import { Request, Response, NextFunction } from 'express';
import Form from '../models/Form';

export const createForm = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { title, description, fields, theme } = req.body;

    // Plan Enforcement
    if (req.user.plan === 'free') {
      const formCount = await Form.countDocuments({ createdBy: req.user.id });
      if (formCount >= 3) {
        return res.status(403).json({ 
          success: false, 
          message: 'You have reached the limit of 3 forms on the Free plan. Please upgrade to Pro or Premium to create unlimited forms.',
          requiresUpgrade: true
        });
      }
    }
    
    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    const form = await Form.create({
      title,
      description,
      slug,
      fields: fields || [],
      theme,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, form });
  } catch (error) {
    next(error);
  }
};

export const getForms = async (req: any, res: Response, next: NextFunction) => {
  try {
    const ResponseModel = (await import('../models/Response')).default;
    const forms = await Form.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    const formIds = forms.map(f => f._id);

    // Attach real response counts per form
    const counts = await ResponseModel.aggregate([
      { $match: { formId: { $in: formIds } } },
      { $group: { _id: '$formId', count: { $sum: 1 } } }
    ]);

    const formsWithCounts = forms.map(form => ({
      ...form.toObject(),
      responseCount: counts.find((c: any) => c._id.toString() === form._id.toString())?.count || 0,
    }));

    res.status(200).json({ success: true, count: forms.length, forms: formsWithCounts });
  } catch (error) {
    next(error);
  }
};

export const getFormById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }
    res.status(200).json({ success: true, form });
  } catch (error) {
    next(error);
  }
};

export const updateForm = async (req: any, res: Response, next: NextFunction) => {
  try {
    let form = await Form.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    form = await Form.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, form });
  } catch (error) {
    next(error);
  }
};

export const deleteForm = async (req: any, res: Response, next: NextFunction) => {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }
    res.status(200).json({ success: true, message: 'Form deleted' });
  } catch (error) {
    next(error);
  }
};

export const duplicateForm = async (req: any, res: Response, next: NextFunction) => {
  try {
    const originalForm = await Form.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!originalForm) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    // Plan Enforcement
    if (req.user.plan === 'free') {
      const formCount = await Form.countDocuments({ createdBy: req.user.id });
      if (formCount >= 3) {
        return res.status(403).json({ 
          success: false, 
          message: 'You have reached the limit of 3 forms on the Free plan. Please upgrade to Pro or Premium to create unlimited forms.',
          requiresUpgrade: true
        });
      }
    }

    const title = `${originalForm.title} (Copy)`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    const duplicatedForm = await Form.create({
      title,
      description: originalForm.description,
      slug,
      fields: originalForm.fields,
      theme: originalForm.theme,
      createdBy: req.user.id,
      isPublished: false,
      views: 0,
      submissions: 0,
    });

    res.status(201).json({ success: true, form: duplicatedForm });
  } catch (error) {
    next(error);
  }
};
