import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Edit3, QrCode, Download, Link2, ExternalLink, 
  Trash2, Copy, BarChart2, CheckCircle2, Eye, X
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';

const PRIMARY = '#1a3c2a';
const PRIMARY_LIGHT = '#52b788';

export default function MyForms() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [qrForm, setQrForm] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; formId: string | null; formTitle: string }>({
    isOpen: false,
    formId: null,
    formTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: formsData, isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const res = await api.get('/forms');
      return res.data.forms;
    }
  });

  const forms = formsData?.filter((f: any) => f.title.toLowerCase().includes(query)) || [];

  const handleDownloadCSV = async (form: any) => {
    try {
      const res = await api.get(`/responses/form/${form._id}`);
      const responses = res.data.responses;
      if (!responses || responses.length === 0) {
        alert('No responses to download yet!');
        return;
      }
      const headers = form.fields.map((f: any) => f.label) || [];
      const csvContent = [
        ['Submitted At', ...headers].join(','),
        ...responses.map((r: any) => [
          format(new Date(r.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
          ...form.fields.map((f: any) => `"${(r.data[f.id] || '').toString().replace(/"/g, '""')}"`)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${form?.title || 'responses'}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Failed to download CSV');
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const confirmDelete = (id: string, title: string) => {
    setDeleteModal({ isOpen: true, formId: id, formTitle: title });
  };

  const executeDelete = async () => {
    if (!deleteModal.formId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/forms/${deleteModal.formId}`);
      qc.invalidateQueries({ queryKey: ['forms'] });
      setDeleteModal({ isOpen: false, formId: null, formTitle: '' });
    } catch (err) {
      alert('Failed to delete form. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const duplicateForm = async (form: any) => {
    try {
      await api.post(`/forms/${form._id}/duplicate`);
      qc.invalidateQueries({ queryKey: ['forms'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to duplicate form. Please try again.');
    }
  };

  const publishForm = async (id: string, current: boolean) => {
    try { 
      await api.put(`/forms/${id}`, { isPublished: !current }); 
      qc.invalidateQueries({ queryKey: ['forms'] });
    } catch { alert('Update failed. Please try again.'); }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 flex-shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Forms</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, edit, and export your forms and responses.</p>
        </div>
        <Link to="/builder"
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm"
          style={{ background: PRIMARY }}>
          <Plus className="w-4 h-4" /> Create New Form
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-10">
        {isLoading ? (
          <div className="flex justify-center mt-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: PRIMARY }}></div>
          </div>
        ) : forms?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
              <Plus className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No forms yet</h2>
            <p className="text-sm text-gray-500 mb-6">You haven't created any forms yet. Create your first form to start collecting responses.</p>
            <Link to="/builder" className="px-6 py-2.5 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-90" style={{ background: PRIMARY }}>
              Create your first form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {forms?.map((form: any) => (
              <div key={form._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm" style={{ background: PRIMARY }}>
                      {form.title[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight truncate max-w-[180px]">{form.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: form.isPublished ? '#10b981' : '#d1d5db' }} />
                        {form.isPublished ? 'Published' : 'Draft'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => duplicateForm(form)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Duplicate Form">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(form._id, form.title)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Form">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {form.isPublished ? (
                    <Link 
                      to={`/responses/${form._id}`} 
                      className="p-3 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 hover:border-green-200 transition-all group flex flex-col justify-between cursor-pointer"
                      title="View Analytics"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] uppercase font-bold text-green-800">Responses</p>
                        <div className="w-5 h-5 rounded bg-white flex items-center justify-center shadow-sm text-green-600 group-hover:scale-105 transition-transform">
                          <BarChart2 className="w-3 h-3" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-950 flex items-center gap-1.5">
                        {form.responseCount || 0}
                        <span className="text-[9px] font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider ml-auto">
                          View
                        </span>
                      </p>
                    </Link>
                  ) : (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between opacity-60">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] uppercase font-bold text-gray-500">Responses</p>
                        <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-gray-400">
                          <BarChart2 className="w-3 h-3" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-400 flex items-center gap-1.5">
                        {form.responseCount || 0}
                      </p>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between opacity-60">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Views</p>
                    <p className="text-xl font-bold text-gray-400">{form.views || 0}</p>
                  </div>
                </div>

                <div className={`mt-auto grid gap-2 ${form.isPublished ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1'}`}>
                  <button onClick={() => navigate(`/builder/${form._id}`)} className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700">
                    <Edit3 className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">Edit</span>
                  </button>
                  {form.isPublished && (
                    <>
                      <button onClick={() => setQrForm(form)} className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700">
                        <QrCode className="w-4 h-4" />
                        <span className="text-[10px] font-semibold">QR Code</span>
                      </button>
                      <button onClick={() => handleDownloadCSV(form)} className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700">
                        <Download className="w-4 h-4" />
                        <span className="text-[10px] font-semibold">CSV</span>
                      </button>
                      <button onClick={() => copyLink(form.slug)} className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700">
                        <Link2 className="w-4 h-4" />
                        <span className="text-[10px] font-semibold">Copy Link</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                   <button 
                    onClick={() => publishForm(form._id, form.isPublished)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    style={{ background: form.isPublished ? '#f3f4f6' : PRIMARY, color: form.isPublished ? '#374151' : 'white' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {form.isPublished ? 'Unpublish Form' : 'Publish Form'}
                  </button>
                  {form.isPublished && (
                    <a href={`/form/${form.slug}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center text-xs font-bold" title="Open Form">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setQrForm(null)} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{qrForm.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Scan to open the form</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block mx-auto mb-6">
              <QRCodeCanvas 
                value={`${window.location.origin}/form/${qrForm.slug}`} 
                size={220}
                level="H"
                fgColor={PRIMARY}
              />
            </div>
            <button 
              onClick={() => copyLink(qrForm.slug)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: PRIMARY }}
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl relative border border-gray-100">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: '#F0FDF4', color: PRIMARY }}>
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Form?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900">"{deleteModal.formTitle}"</strong>? This action cannot be undone and all responses will be lost permanently.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, formId: null, formTitle: '' })}
                className="flex-1 py-3 rounded-xl font-semibold transition-colors"
                style={{ background: '#f3f4f6', color: '#4b5563' }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
                style={{ background: PRIMARY }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
