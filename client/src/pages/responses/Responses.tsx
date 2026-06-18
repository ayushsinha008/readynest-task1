import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { ArrowLeft, Download, Trash2, Star, BarChart2, MessageSquare, ChevronDown, ChevronUp, QrCode, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// ─── Helper: compute per-field analytics ────────────────────────────────────
function buildFieldAnalytics(fields: any[], responses: any[]) {
  return fields.map((field) => {
    const values: any[] = responses
      .map((r) => r.data?.[field.id])
      .filter((v) => v !== undefined && v !== null && v !== '');

    if (field.type === 'rating') {
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      values.forEach((v) => {
        const n = Number(v);
        if (n >= 1 && n <= 5) counts[n]++;
      });
      const total = values.length;
      const avg = total > 0 ? values.reduce((s, v) => s + Number(v), 0) / total : 0;
      return { field, type: 'rating', counts, total, avg };
    }

    if (['dropdown', 'radio', 'checkbox'].includes(field.type)) {
      const counts: Record<string, number> = {};
      values.forEach((v) => {
        const answers = Array.isArray(v) ? v : [v];
        answers.forEach((a) => {
          const label = field.options?.find((o: any) => o.value === a)?.label || a;
          counts[label] = (counts[label] || 0) + 1;
        });
      });
      return { field, type: 'choice', counts, total: values.length };
    }

    // text / textarea / email / etc.
    return { field, type: 'text', values: values.slice(0, 50), total: values.length };
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function RatingAnalyticsCard({ item }: { item: any }) {
  const maxCount = Math.max(...Object.values(item.counts as Record<number, number>));
  return (
    <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-badge-orange" />
          <h3 className="font-semibold text-ink font-sans text-sm">{item.field.label}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display font-semibold text-ink tracking-tight">
            {item.avg > 0 ? item.avg.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-muted">{item.total} responses</p>
        </div>
      </div>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = item.counts[star] || 0;
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 w-16 justify-end">
                {[...Array(star)].map((_, i) => (
                  <span key={i} className="text-badge-orange text-xs">★</span>
                ))}
              </div>
              <div className="flex-1 h-2 bg-surface-soft rounded-full overflow-hidden">
                <div
                  className="h-full bg-badge-orange rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChoiceAnalyticsCard({ item }: { item: any }) {
  const maxCount = Math.max(...Object.values(item.counts as Record<string, number>), 1);
  const entries = Object.entries(item.counts as Record<string, number>).sort((a, b) => b[1] - a[1]);
  return (
    <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-ink" />
          <h3 className="font-semibold text-ink font-sans text-sm">{item.field.label}</h3>
        </div>
        <p className="text-xs text-muted">{item.total} responses</p>
      </div>
      <div className="space-y-2.5">
        {entries.map(([label, count]) => {
          const pct = ((count / maxCount) * 100);
          const realPct = ((count / (item.total || 1)) * 100).toFixed(0);
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink font-medium truncate max-w-[70%]">{label}</span>
                <span className="text-muted">{count} &middot; {realPct}%</span>
              </div>
              <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {entries.length === 0 && <p className="text-xs text-muted">No answers yet.</p>}
      </div>
    </div>
  );
}

function TextAnalyticsCard({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? item.values : item.values.slice(0, 3);
  return (
    <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted" />
          <h3 className="font-semibold text-ink font-sans text-sm">{item.field.label}</h3>
        </div>
        <p className="text-xs text-muted">{item.total} responses</p>
      </div>
      <div className="space-y-2">
        {shown.map((v: any, i: number) => (
          <div key={i} className="bg-surface-soft rounded-md px-3 py-2 text-sm text-ink font-sans border border-hairline break-all">
            {item.field.type === 'file' ? (
              <a href={v} download="upload" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1">
                View / Download File
              </a>
            ) : (
              v?.toString() || '—'
            )}
          </div>
        ))}
        {item.values.length === 0 && <p className="text-xs text-muted">No answers yet.</p>}
      </div>
      {item.values.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Show less' : `Show ${item.values.length - 3} more`}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
type Tab = 'analytics' | 'responses';

export default function Responses() {
  const { formId } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${formId}`);
      return data.form;
    },
  });

  const { data: responses, isLoading: responsesLoading, refetch } = useQuery({
    queryKey: ['responses', formId],
    queryFn: async () => {
      const { data } = await api.get(`/responses/form/${formId}`);
      return data.responses;
    },
  });

  const filteredResponses = responses?.filter((r: any) => {
    // Search
    let matchesSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matchesSearch = Object.values(r.data || {}).some((val: any) =>
        String(val).toLowerCase().includes(q)
      );
    }
    
    // Date
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const submittedDate = new Date(r.submittedAt);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = submittedDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'last7') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = submittedDate >= sevenDaysAgo;
      } else if (dateFilter === 'last30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = submittedDate >= thirtyDaysAgo;
      }
    }

    return matchesSearch && matchesDate;
  }) || [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      await api.delete(`/responses/${id}`);
      refetch();
    }
  };

  const exportCSV = () => {
    if (!responses || responses.length === 0) return;
    const headers = form?.fields.map((f: any) => f.label) || [];
    const csvContent = [
      ['Submitted At', 'Respondent Email', ...headers].join(','),
      ...responses.map((r: any) => [
        format(new Date(r.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
        `"${(r.respondentEmail || 'Anonymous').replace(/"/g, '""')}"`,
        ...form.fields.map((f: any) => {
          let val = r.data[f.id] || '';
          if (f.type === 'file' && val) val = '[File Upload]';
          return `"${val.toString().replace(/"/g, '""')}"`;
        })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${form?.title || 'responses'}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const analytics = form && responses ? buildFieldAnalytics(form.fields, responses) : [];

  if (formLoading || responsesLoading) return <div className="p-12 text-center text-muted font-sans">Loading...</div>;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="space-y-8 max-w-5xl mx-auto pb-12 px-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-6 pt-2">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 border border-hairline rounded-md hover:bg-surface-card text-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">{form?.title}</h1>
              <p className="text-sm text-muted mt-0.5">{responses?.length || 0} total responses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="inline-flex items-center gap-2 rounded-md bg-canvas border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-surface-card transition-colors h-[38px]"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-md bg-canvas border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-surface-card transition-colors h-[38px]"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-soft border border-hairline rounded-lg p-1 w-fit">
          {(['analytics', 'responses'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors ${activeTab === tab
                  ? 'bg-canvas text-ink shadow-sm border border-hairline'
                  : 'text-muted hover:text-ink'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            {responses?.length === 0 ? (
              <div className="p-12 text-center text-muted font-sans bg-surface-soft rounded-xl border border-hairline">
                No responses yet. Share your form to start collecting data.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.map((item: any) => {
                  if (item.type === 'rating') return <RatingAnalyticsCard key={item.field.id} item={item} />;
                  if (item.type === 'choice') return <ChoiceAnalyticsCard key={item.field.id} item={item} />;
                  return <TextAnalyticsCard key={item.field.id} item={item} />;
                })}
              </div>
            )}
          </div>
        )}

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div className="bg-surface-card rounded-xl border border-hairline overflow-hidden">
            {!responses || responses.length === 0 ? (
              <div className="p-12 text-center text-muted font-sans">No responses yet.</div>
            ) : (
              <>
                <div className="p-4 border-b border-hairline bg-surface-soft flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-sm w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-hairline rounded-md leading-5 bg-canvas placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                        placeholder="Search responses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="border border-hairline rounded-md py-2 px-3 bg-canvas text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="last7">Last 7 Days</option>
                      <option value="last30">Last 30 Days</option>
                    </select>
                  </div>
                  <div className="text-sm text-muted shrink-0">
                    Showing {filteredResponses.length} of {responses.length} responses
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left font-sans">
                    <thead className="text-xs text-muted uppercase tracking-wider bg-surface-soft border-b border-hairline">
                      <tr>
                        <th className="px-6 py-4 font-medium">Submitted At</th>
                        <th className="px-6 py-4 font-medium">Respondent Email</th>
                        {form?.fields.map((f: any) => (
                          <th key={f.id} className="px-6 py-4 font-medium">{f.label}</th>
                        ))}
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResponses.length === 0 ? (
                        <tr>
                          <td colSpan={(form?.fields.length || 0) + 2} className="px-6 py-8 text-center text-muted">
                            No matching responses found.
                          </td>
                        </tr>
                      ) : (
                        filteredResponses.map((response: any) => (
                          <tr key={response._id} className="bg-canvas border-b border-hairline hover:bg-surface-soft transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-ink">
                              {format(new Date(response.submittedAt), 'MMM d, yyyy HH:mm')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-ink font-medium">
                              {response.respondentEmail || 'Anonymous'}
                            </td>
                            {form?.fields.map((f: any) => {
                              const val = response.data?.[f.id];
                              let display: React.ReactNode = val?.toString() || '—';
                              
                              if (f.type === 'rating' && val) {
                                display = `${'★'.repeat(Number(val))}${'☆'.repeat(5 - Number(val))} (${val})`;
                              } else if (f.type === 'file' && val) {
                                display = (
                                  <a 
                                    href={val} 
                                    download="upload" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-primary hover:underline font-medium flex items-center gap-1"
                                  >
                                    View File
                                  </a>
                                );
                              } else if (f.type === 'toggle') {
                                display = val ? 'Yes' : 'No';
                              }

                              return (
                                <td key={f.id} className="px-6 py-4 max-w-[200px] truncate text-ink">{display}</td>
                              );
                            })}
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDelete(response._id)}
                                className="text-muted hover:text-error transition-colors p-1.5 rounded-md hover:bg-surface-soft"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQR && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-soft text-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Form QR Code</h3>
                <p className="text-sm text-muted mt-1">Scan this code to quickly access "{form.title}"</p>
              </div>
              <div className="qrcode-svg-container p-6 bg-white border border-hairline rounded-xl shadow-sm inline-block mx-auto mt-4">
                <QRCodeSVG
                  value={`${window.location.origin}/form/${form.slug}`}
                  size={200}
                  level="Q"
                  includeMargin={false}
                  fgColor="#111111"
                />
              </div>
              <p className="text-xs text-muted font-mono bg-surface-soft px-3 py-2 rounded-lg truncate mt-4">
                {window.location.origin}/form/{form.slug}
              </p>
              <button
                onClick={() => {
                  const svg = document.querySelector('.qrcode-svg-container svg') as SVGElement;
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = img.width + 40;
                    canvas.height = img.height + 40;
                    if (ctx) {
                      ctx.fillStyle = 'white';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(img, 20, 20);
                      const a = document.createElement('a');
                      a.download = `${form.slug}-qrcode.png`;
                      a.href = canvas.toDataURL('image/png');
                      a.click();
                    }
                  };
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                }}
                className="w-full mt-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
