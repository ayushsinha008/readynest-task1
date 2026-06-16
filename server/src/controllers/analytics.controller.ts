import { Request, Response, NextFunction } from 'express';
import Form from '../models/Form';
import ResponseModel from '../models/Response';

export const getDashboardStats = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const forms = await Form.find({ createdBy: userId });
    const totalForms = forms.length;
    const publishedForms = forms.filter(f => f.isPublished).length;
    const draftForms = totalForms - publishedForms;

    const formIds = forms.map(f => f._id);

    const totalViews = forms.reduce((acc, form) => acc + (form.views || 0), 0);
    const totalResponses = await ResponseModel.countDocuments({ formId: { $in: formIds } });
    const conversionRate = totalViews > 0 ? Number(((totalResponses / totalViews) * 100).toFixed(1)) : 0;

    // ── Monthly chart (last 6 months) ─────────────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await ResponseModel.aggregate([
      { $match: { formId: { $in: formIds }, submittedAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$submittedAt' }, year: { $year: '$submittedAt' } }, submissions: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1, y = d.getFullYear();
      const found = monthlyTrend.find(t => t._id.month === m && t._id.year === y);
      chartData.push({ name: monthNames[m - 1], submissions: found ? found.submissions : 0 });
    }

    // ── Weekly chart (last 7 days by day letter) ──────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrend = await ResponseModel.aggregate([
      { $match: { formId: { $in: formIds }, submittedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }, submissions: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const dayLetters = ['S','M','T','W','T','F','S'];
    const weeklyData: any[] = [];
    let maxSubs = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyTrend.find((t: any) => t._id === dateStr);
      const subs = found ? found.submissions : 0;
      if (subs > maxSubs) maxSubs = subs;
      weeklyData.push({ name: dayLetters[d.getDay()], submissions: subs, isToday: i === 0 });
    }
    // mark the highest bar
    weeklyData.forEach(d => { d.isHighest = d.submissions === maxSubs && maxSubs > 0; });

    // ── Recent responses ──────────────────────────────────────────────────
    const recentResponses = await ResponseModel.find({ formId: { $in: formIds } })
      .sort({ submittedAt: -1 }).limit(5).lean();
    const responsesWithForm = recentResponses.map(r => {
      const form = forms.find(f => f._id.toString() === r.formId.toString());
      return { ...r, formTitle: form?.title || 'Unknown Form' };
    });

    res.status(200).json({
      success: true,
      stats: { totalForms, publishedForms, draftForms, totalResponses, totalViews, conversionRate, chartData, weeklyData },
      recentResponses: responsesWithForm,
    });
  } catch (error) {
    next(error);
  }
};
