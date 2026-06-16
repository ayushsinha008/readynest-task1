import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Plus, BarChart2, Trash2, CheckCircle2, Edit2,
  ArrowUpRight, TrendingUp, Eye, RefreshCw, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

const PRIMARY = '#1a3c2a';
const PRIMARY_LIGHT = '#52b788';
const FORM_COLORS = ['#1a3c2a', '#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'];

// ─── Skeleton pulse block ──────────────────────────────────────────────────
const Skeleton = ({ w = 'w-16', h = 'h-7', rounded = 'rounded-lg' }: { w?: string; h?: string; rounded?: string }) => (
  <div className={`${w} ${h} ${rounded} animate-pulse`} style={{ background: '#E5E7E0' }} />
);

// ─── Pill-shaped Recharts bar ──────────────────────────────────────────────
const PillBar = (props: any) => {
  const { x, y, width, height, value, isHighest } = props;
  const r = Math.min(width / 2, 10);
  if (!height || height <= 0) {
    const minH = 22, bgH = props.background?.height ?? 100, bgY = props.background?.y ?? 0;
    const barY = bgY + bgH - minH;
    const pid = `sp${x}`;
    return (
      <g>
        <defs>
          <pattern id={pid} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
            <rect width="2.5" height="5" fill="#D1FAE5" />
            <rect x="2.5" width="2.5" height="5" fill="#F0FDF4" />
          </pattern>
        </defs>
        <rect x={x} y={barY} width={width} height={minH} rx={r} ry={r} fill={`url(#${pid})`} stroke="#C6E7D0" strokeWidth="1" />
      </g>
    );
  }
  const pid = `dp${x}`;
  return (
    <g>
      {!isHighest && (
        <defs>
          <pattern id={pid} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
            <rect width="2.5" height="5" fill="#D1FAE5" />
            <rect x="2.5" width="2.5" height="5" fill="#F0FDF4" />
          </pattern>
        </defs>
      )}
      <rect x={x} y={y} width={width} height={height} rx={r} ry={r}
        fill={isHighest ? PRIMARY : `url(#${pid})`}
        stroke={isHighest ? 'none' : '#C6E7D0'} strokeWidth="1"
      />
      {isHighest && height > 22 && (
        <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill={PRIMARY}>
          {value}
        </text>
      )}
    </g>
  );
};

// ─── Semicircle conversion gauge ───────────────────────────────────────────
function SemiGauge({ pct, dark }: { pct: number; dark?: boolean }) {
  const r = 50, cx = 72, cy = 65;
  const arc = Math.PI * r;
  const filled = arc * Math.min(Math.max(pct, 0) / 100, 1);
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const trackColor = dark ? 'rgba(255,255,255,0.15)' : '#E2F4EB';
  const progressColor = dark ? '#fff' : PRIMARY;
  const textColor = dark ? '#fff' : PRIMARY;
  const subColor = dark ? 'rgba(255,255,255,0.5)' : '#9CA3AF';
  return (
    <svg viewBox="0 0 144 78" className="w-full">
      <path d={d} fill="none" stroke={trackColor} strokeWidth="13" strokeLinecap="round" />
      {pct > 0 && (
        <path d={d} fill="none" stroke={progressColor} strokeWidth="13" strokeLinecap="round"
          strokeDasharray={`${filled} ${arc}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      )}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="20" fontWeight="800" fill={textColor}>{pct}%</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize="7.5" fill={subColor}>Views → Submissions</text>
    </svg>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, dark, loading }: {
  label: string; value: any; sub: string; dark?: boolean; loading?: boolean;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2 flex-1" style={{
      background: dark ? PRIMARY : '#fff',
      border: dark ? 'none' : '1px solid #E8EAE4',
    }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dark ? 'rgba(255,255,255,0.55)' : '#9CA3AF' }}>
          {label}
        </p>
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: dark ? 'rgba(255,255,255,0.12)' : '#F4F5F1' }}>
          <ArrowUpRight className="w-2.5 h-2.5" style={{ color: dark ? '#fff' : '#9CA3AF' }} />
        </div>
      </div>
      {loading
        ? <Skeleton w="w-12" h="h-8" />
        : <p className="text-[30px] font-bold leading-none" style={{ color: dark ? '#fff' : '#111', fontVariantNumeric: 'tabular-nums' }}>{value ?? 0}</p>
      }
      <p className="text-[10px] flex items-center gap-1" style={{ color: dark ? '#74c69d' : '#9CA3AF' }}>
        <TrendingUp className="w-2.5 h-2.5 flex-shrink-0" />
        {sub}
      </p>
    </div>
  );
}

// ─── Form list item ────────────────────────────────────────────────────────
function FormItem({ form, index, onDelete, onPublish }: {
  form: any; index: number; onDelete: () => void; onPublish: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const color = FORM_COLORS[index % FORM_COLORS.length];

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.title}"?`)) return;
    setBusy(true);
    await onDelete();
    setBusy(false);
  };

  const handlePublish = async () => {
    setBusy(true);
    await onPublish();
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-gray-50 transition-colors group"
      style={{ borderBottom: '1px solid #F4F5F1' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
        style={{ background: color }}>
        {form.title[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate" style={{ color: '#111' }}>{form.title}</p>
        <p className="text-[9px] flex items-center gap-1" style={{ color: '#9CA3AF' }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: form.isPublished ? '#22c55e' : '#d1d5db' }} />
          {form.isPublished ? 'Published' : 'Draft'} · {form.responseCount ?? 0} responses
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button title={form.isPublished ? 'Unpublish' : 'Publish'}
          onClick={handlePublish} disabled={busy}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors">
          <CheckCircle2 className="w-3 h-3" style={{ color: form.isPublished ? PRIMARY : '#9CA3AF' }} />
        </button>
        {form.isPublished && (
          <Link to={`/responses/${form._id}`} title="View analytics"
            className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <BarChart2 className="w-3 h-3" style={{ color: '#9CA3AF' }} />
          </Link>
        )}
        {form.isPublished && (
          <Link to={`/form/${form.slug}`} target="_blank" title="Open form"
            className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <ExternalLink className="w-3 h-3" style={{ color: '#9CA3AF' }} />
          </Link>
        )}
        <button title="Delete" onClick={handleDelete} disabled={busy}
          className="p-1 rounded-md hover:bg-red-50 transition-colors">
          <Trash2 className="w-3 h-3 hover:text-red-500" style={{ color: '#9CA3AF' }} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const qc = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data.stats;
    },
    staleTime: 30_000,
  });

  const { data: recentResponses } = useQuery({
    queryKey: ['dashboardRecent'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data.recentResponses || [];
    },
    staleTime: 30_000,
  });

  const { data: formsData, isLoading: formsLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const { data } = await api.get('/forms');
      return data.forms;
    },
    staleTime: 30_000,
  });

  const refetchAll = () => {
    qc.invalidateQueries({ queryKey: ['dashboardStats'] });
    qc.invalidateQueries({ queryKey: ['dashboardRecent'] });
    qc.invalidateQueries({ queryKey: ['forms'] });
  };

  const deleteForm = async (id: string) => {
    try { await api.delete(`/forms/${id}`); refetchAll(); }
    catch { alert('Delete failed. Please try again.'); }
  };

  const publishForm = async (id: string, current: boolean) => {
    try { await api.put(`/forms/${id}`, { isPublished: !current }); refetchAll(); }
    catch { alert('Update failed. Please try again.'); }
  };

  const statsLoaded = !statsLoading;
  const weeklyRaw: any[] = statsData?.weeklyData || Array(7).fill(0).map((_, i) => ({
    name: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i], submissions: 0, isToday: i === 6,
  }));
  const maxSubs = Math.max(...weeklyRaw.map(d => d.submissions), 1);
  const weeklyData = weeklyRaw.map(d => ({ ...d, isHighest: d.submissions === maxSubs && maxSubs > 0 }));

  const RESPONSE_BADGE = [
    { bg: '#D1FAE5', text: '#065F46', label: 'Received' },
    { bg: '#DBEAFE', text: '#1E40AF', label: 'Viewed' },
    { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 p-5 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight leading-none" style={{ color: '#111' }}>Dashboard</h1>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Create, publish, and analyse your forms with ease.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetchAll}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-all hover:bg-white"
            style={{ border: '1px solid #E8EAE4', color: '#6B7280' }}>
            <RefreshCw className="w-3 h-3" />Refresh
          </button>
          <Link to="/builder"
            className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-all shadow-sm"
            style={{ background: PRIMARY }}>
            <Plus className="w-3 h-3" />Add New Form
          </Link>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-shrink-0">
        <StatCard label="Total Forms" value={statsData?.totalForms} sub="All your forms" dark loading={!statsLoaded} />
        <StatCard label="Published" value={statsData?.publishedForms} sub="Live & accepting" loading={!statsLoaded} />
        <StatCard label="Drafts" value={statsData?.draftForms} sub="Not published yet" loading={!statsLoaded} />
        <StatCard label="Total Responses" value={statsData?.totalResponses} sub="Across all forms" loading={!statsLoaded} />
      </div>

      {/* ── Middle row: Analytics | Quick Publish | Forms ─────────── */}
      <div className="flex gap-3 flex-shrink-0" style={{ height: '210px' }}>

        {/* Form Analytics chart */}
        <div className="bg-white rounded-xl flex flex-col p-4 flex-1 min-w-0 overflow-hidden" style={{ border: '1px solid #E8EAE4' }}>
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div>
              <p className="text-xs font-bold" style={{ color: '#111' }}>Form Analytics</p>
              <p className="text-[10px]" style={{ color: '#9CA3AF' }}>Submissions per day (last 7 days)</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F0FDF4', color: PRIMARY }}>
              This week
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="28%" margin={{ top: 16, right: 4, bottom: 0, left: 4 }}>
                <Tooltip cursor={false}
                  contentStyle={{ background: '#fff', border: '1px solid #E8EAE4', borderRadius: 10, fontSize: 11, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  formatter={(v: any) => [v, 'Submissions']}
                />
                <Bar dataKey="submissions" shape={<PillBar />} isAnimationActive>
                  {weeklyData.map((_: any, i: number) => <Cell key={i} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around flex-shrink-0 mt-1 px-2">
            {weeklyData.map((d: any, i: number) => (
              <span key={i} className="text-[10px] font-semibold text-center flex-1"
                style={{ color: d.isToday ? PRIMARY : '#C0C7BD' }}>{d.name}</span>
            ))}
          </div>
        </div>

        {/* Quick Publish */}
        <div className="bg-white rounded-xl flex flex-col p-4 flex-shrink-0 overflow-hidden" style={{ border: '1px solid #E8EAE4', width: '220px' }}>
          <p className="text-xs font-bold flex-shrink-0 mb-2" style={{ color: '#111' }}>Quick Publish</p>
          {formsLoading ? (
            <div className="flex-1 flex flex-col gap-2 justify-center">
              <Skeleton w="w-full" h="h-4" /><Skeleton w="w-3/4" h="h-4" />
            </div>
          ) : (
            (() => {
              const draft = formsData?.find((f: any) => !f.isPublished);
              const draftCount = formsData?.filter((f: any) => !f.isPublished).length ?? 0;
              if (!draft) return (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: '#F0FDF4' }}>
                    <CheckCircle2 className="w-5 h-5" style={{ color: PRIMARY_LIGHT }} />
                  </div>
                  <p className="text-xs font-bold" style={{ color: '#111' }}>All published! 🎉</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>No drafts remaining</p>
                </div>
              );
              return (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <p className="text-[10px] mb-2 flex-shrink-0" style={{ color: '#9CA3AF' }}>
                    {draftCount} draft{draftCount !== 1 ? 's' : ''} awaiting publish
                  </p>
                  <div className="flex-1 rounded-xl p-3 mb-2.5 min-h-0 overflow-hidden" style={{ background: '#F4FBF7', border: '1px solid #D1FAE5' }}>
                    <p className="text-[10px] mb-0.5" style={{ color: '#6B7280' }}>Ready to publish</p>
                    <p className="text-sm font-bold leading-tight truncate" style={{ color: '#111' }}>{draft.title}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>{draft.responseCount ?? 0} responses so far</p>
                  </div>
                  <button onClick={() => publishForm(draft._id, draft.isPublished)}
                    className="w-full h-8 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 hover:opacity-90 flex-shrink-0 transition-all shadow-sm"
                    style={{ background: PRIMARY }}>
                    <CheckCircle2 className="w-3.5 h-3.5" />Publish Now
                  </button>
                </div>
              );
            })()
          )}
        </div>

        {/* Forms list */}
        <div className="bg-white rounded-xl flex flex-col flex-shrink-0 overflow-hidden" style={{ border: '1px solid #E8EAE4', width: '200px' }}>
          <div className="flex items-center justify-between px-3.5 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid #F4F5F1' }}>
            <p className="text-xs font-bold" style={{ color: '#111' }}>Forms</p>
            <Link to="/builder" className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors hover:opacity-80"
              style={{ background: '#F0FDF4', color: PRIMARY }}>
              <Plus className="w-2.5 h-2.5" />New
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {formsLoading && (
              <div className="p-3 space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} w="w-full" h="h-8" rounded="rounded-lg" />)}
              </div>
            )}
            {!formsLoading && (!formsData || formsData.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-[10px] text-gray-400 mb-1">No forms yet</p>
                <Link to="/builder" className="text-[10px] font-bold" style={{ color: PRIMARY }}>Create one →</Link>
              </div>
            )}
            {formsData?.map((form: any, i: number) => (
              <FormItem key={form._id} form={form} index={i}
                onDelete={() => deleteForm(form._id)}
                onPublish={() => publishForm(form._id, form.isPublished)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Recent Responses | Conversion Rate ────────── */}
      <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">

        {/* Recent Responses */}
        <div className="bg-white rounded-xl flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden" style={{ border: '1px solid #E8EAE4' }}>
          <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid #F4F5F1' }}>
            <p className="text-xs font-bold" style={{ color: '#111' }}>Recent Responses</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F0FDF4', color: PRIMARY }}>
              {statsData?.totalResponses ?? 0} total
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {statsLoading && (
              <div className="p-3 space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} w="w-full" h="h-10" rounded="rounded-lg" />)}
              </div>
            )}
            {!statsLoading && (!recentResponses || recentResponses.length === 0) && (
              <div className="h-full flex items-center justify-center p-4 text-center">
                <p className="text-[10px] text-gray-400">No responses yet. Share your forms to start collecting data.</p>
              </div>
            )}
            {recentResponses?.map((r: any, i: number) => {
              const badge = RESPONSE_BADGE[i % RESPONSE_BADGE.length];
              return (
                <div key={r._id || i} className="flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  style={{ borderBottom: '1px solid #F4F5F1' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: FORM_COLORS[i % FORM_COLORS.length] }}>
                    {(r.formTitle || 'F')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold truncate" style={{ color: '#111' }}>
                          {r.formTitle || 'Unknown Form'}
                        </p>
                        <p className="text-[9px] truncate" style={{ color: '#9CA3AF' }}>
                          {r.submittedAt ? format(new Date(r.submittedAt), 'MMM d, yyyy · h:mm a') : ''}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
                        style={{ background: badge.bg, color: badge.text }}>{badge.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/responses/${r.formId}`} className="text-[9px] font-semibold hover:underline flex items-center gap-1" style={{ color: PRIMARY }}>
                        <Eye className="w-2.5 h-2.5" /> View Details
                      </Link>
                      <Link to={`/builder/${r.formId}`} className="text-[9px] font-semibold hover:underline flex items-center gap-1" style={{ color: '#6B7280' }}>
                        <Edit2 className="w-2.5 h-2.5" /> Edit Form
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Rate — Dark Theme */}
        <div className="rounded-xl flex flex-col p-5 flex-shrink-0 overflow-hidden shadow-sm" style={{ background: PRIMARY, width: '250px' }}>
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <p className="text-xs font-bold text-white">Conversion Rate</p>
            <Eye className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.45)' }} />
          </div>
          {statsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Skeleton w="w-32" h="h-20" rounded="rounded-xl" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
              <SemiGauge pct={Number(statsData?.conversionRate ?? 0)} dark />
              <p className="text-[10px] mt-2 text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {statsData?.totalViews ?? 0} views → {statsData?.totalResponses ?? 0} responses
              </p>
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mt-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white" />
              <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Converted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Remaining</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
