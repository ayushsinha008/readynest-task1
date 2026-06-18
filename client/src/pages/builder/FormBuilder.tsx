import { DndContext, type DragEndEvent, DragOverlay, closestCenter, type DragStartEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/builder/Sidebar';
import Canvas from '../../components/builder/Canvas';
import PropertiesPanel from '../../components/builder/PropertiesPanel';
import { useFormBuilderStore, type FieldType } from '../../store/useFormBuilderStore';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { FormRenderer } from '../public/FormViewer';
import { X, Loader2, Cloud, CloudOff, CheckCircle2, Palette, Type, LayoutTemplate, Brush, PlusCircle, Layout, Sliders } from 'lucide-react';

const PRESET_COLORS = ['#4f46e5', '#2563eb', '#0ea5e9', '#10b981', '#84cc16', '#eab308', '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#111111'];
const PRESET_BGS = ['#ffffff', '#f9fafb', '#f3f4f6', '#fffbeb', '#f0fdf4', '#eff6ff', '#fdf2f8'];
const BORDER_RADII = [
  { label: 'Sharp', value: 'none', radius: '0px' },
  { label: 'Slight', value: 'sm', radius: '4px' },
  { label: 'Rounded', value: 'md', radius: '8px' },
  { label: 'Smooth', value: 'xl', radius: '16px' },
];

export default function FormBuilder() {
  const { addField, reorderFields, fields, formTitle, formDescription, theme, setFormDetails, setFields, setTheme } = useFormBuilderStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<FieldType | null>(null);
  const [mobileTab, setMobileTab] = useState<'canvas' | 'sidebar' | 'properties'>('canvas');
  const [showPreview, setShowPreview] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Load existing form if id is present in URL
  useEffect(() => {
    if (id) {
      setLoadingForm(true);
      isFirstLoad.current = true;
      api.get(`/forms/${id}`)
        .then((res) => {
          const form = res.data.form;
          setFormDetails(form.title || 'Untitled Form', form.description || '');
          setFields(form.fields || []);
          if (form.theme) {
            setTheme(form.theme);
          }
        })
        .catch((err) => {
          console.error('Failed to load form for editing', err);
        })
        .finally(() => {
          setLoadingForm(false);
          // Allow auto-save after a short delay so initial load doesn't trigger it
          setTimeout(() => { isFirstLoad.current = false; }, 500);
        });
    } else {
      // Reset store for a new form
      setFormDetails('Untitled Form', '');
      setFields([]);
      isFirstLoad.current = false;
    }
  }, [id]);

  // Auto-save to MongoDB when editing an existing form
  useEffect(() => {
    if (!id || isFirstLoad.current || loadingForm) return;

    setSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      try {
        await api.put(`/forms/${id}`, { title: formTitle, description: formDescription, fields, theme });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('error');
      }
    }, 1500); // 1.5 second debounce

    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [fields, formTitle, formDescription, theme]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    if (active.data.current?.type === 'sidebar-field') {
      setActiveType(active.data.current.fieldType as FieldType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const isOverCanvas = over.id === 'canvas' || over.data.current?.type === 'canvas-field';

    if (active.data.current?.type === 'sidebar-field' && isOverCanvas) {
      const fieldType = active.data.current.fieldType as FieldType;
      const label = active.data.current.label as string;
      addField({
        type: fieldType,
        label: label,
        required: false,
        placeholder: `Enter ${label.toLowerCase()}`,
        options: ['dropdown', 'radio', 'checkbox'].includes(fieldType)
          ? [{ label: 'Option 1', value: 'option-1' }]
          : undefined,
      });
      return;
    }

    if (active.data.current?.type === 'canvas-field' && over.data.current?.type === 'canvas-field') {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== newIndex) {
        reorderFields(oldIndex, newIndex);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (id) {
        // Update existing form
        await api.put(`/forms/${id}`, {
          title: formTitle,
          description: formDescription,
          fields,
          theme,
        });
      } else {
        // Create new form
        await api.post('/forms', {
          title: formTitle,
          description: formDescription,
          fields,
          theme,
        });
      }
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.requiresUpgrade) {
        setShowUpgradeModal(true);
      } else {
        console.error('Failed to save form', error);
      }
    }
  };

  if (loadingForm) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1a3c2a' }} />
          <p className="text-sm text-gray-500">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white relative overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-hairline bg-canvas">
        <div>
          <h1 className="text-xl font-display font-medium text-ink">
            {id ? 'Edit Form' : 'Form Builder'}
          </h1>
          {id && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-gray-400">Editing: {formTitle}</p>
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-[10px] text-amber-500">
                  <Cloud className="w-3 h-3 animate-pulse" /> Saving…
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-[10px] text-green-600">
                  <CheckCircle2 className="w-3 h-3" /> Saved to MongoDB
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-[10px] text-red-500">
                  <CloudOff className="w-3 h-3" /> Save failed
                </span>
              )}
            </div>
          )}
        </div>
        <div className="space-x-2 md:space-x-3 flex items-center">
          <button
            onClick={() => setShowThemeSettings(true)}
            className="rounded-md border border-hairline bg-surface-soft px-2 md:px-4 py-2 text-xs md:text-sm font-medium hover:bg-surface-card text-ink transition-colors shadow-sm flex items-center gap-1 md:gap-2 inline-flex"
          >
            <Brush className="w-4 h-4" />
            Theme Settings
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="hidden md:inline-block rounded-md border border-hairline bg-surface-soft px-4 py-2 text-sm font-medium hover:bg-surface-card text-ink transition-colors shadow-sm"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-3 md:px-4 py-2 h-[40px] text-xs md:text-sm font-medium text-on-primary hover:bg-primary-active transition-colors"
          >
            {id ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row relative">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <Sidebar className={mobileTab === 'sidebar' ? 'block absolute inset-0 z-40 bg-surface-soft w-full' : 'hidden md:block'} />
          <div className={`flex-1 overflow-hidden relative ${mobileTab === 'canvas' ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
            <Canvas />
          </div>
          <PropertiesPanel className={mobileTab === 'properties' ? 'block absolute inset-0 z-40 bg-surface-soft w-full' : 'hidden md:block'} />

          <DragOverlay>
            {activeId && activeType ? (
              <div className="p-3 bg-surface-dark border border-surface-dark-elevated shadow-lg rounded-md opacity-90 cursor-grabbing flex items-center gap-2">
                <span className="text-sm font-medium text-on-dark capitalize">{activeType}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden flex border-t border-hairline bg-surface-soft shrink-0">
          <button 
            onClick={() => setMobileTab('sidebar')} 
            className={`flex-1 py-3 text-[10px] font-bold flex flex-col items-center gap-1 uppercase tracking-wider ${mobileTab === 'sidebar' ? 'text-primary' : 'text-muted'}`}
          >
            <PlusCircle className="w-5 h-5" /> Add
          </button>
          <button 
            onClick={() => setMobileTab('canvas')} 
            className={`flex-1 py-3 text-[10px] font-bold flex flex-col items-center gap-1 uppercase tracking-wider ${mobileTab === 'canvas' ? 'text-primary' : 'text-muted'}`}
          >
            <Layout className="w-5 h-5" /> Canvas
          </button>
          <button 
            onClick={() => setMobileTab('properties')} 
            className={`flex-1 py-3 text-[10px] font-bold flex flex-col items-center gap-1 uppercase tracking-wider ${mobileTab === 'properties' ? 'text-primary' : 'text-muted'}`}
          >
            <Sliders className="w-5 h-5" /> Edit
          </button>
        </div>
      </div>

      {showPreview && (
        <div 
          className="fixed inset-0 z-50 flex py-12 px-4 sm:px-6 overflow-y-auto transition-colors" 
          style={{ 
            backgroundColor: theme?.backgroundColor || '#ffffff',
            fontFamily: theme?.fontFamily ? `"${theme.fontFamily}", sans-serif` : undefined 
          }}
        >
          <div className="max-w-[760px] w-full mx-auto relative my-auto">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-12 right-0 text-gray-500 hover:text-ink transition-colors bg-white/50 backdrop-blur-sm rounded-full p-2 border border-hairline"
            >
              <X className="w-6 h-6" />
            </button>
            <div 
              className={`bg-white border border-hairline overflow-hidden shadow-2xl ${
                theme?.borderRadius === 'none' ? 'rounded-none' : 
                theme?.borderRadius === 'sm' ? 'rounded-sm' : 
                theme?.borderRadius === 'xl' ? 'rounded-[24px]' : 'rounded-xl'
              }`}
              style={{ fontFamily: theme?.fontFamily ? `"${theme.fontFamily}", sans-serif` : undefined }}
            >
              <div className="p-10 border-b border-hairline bg-surface-card">
                <h1 className="text-[48px] leading-[1.1] font-display font-semibold text-ink tracking-tight">{formTitle || 'Untitled Form'}</h1>
                {formDescription && <p className="mt-4 text-lg text-muted font-sans">{formDescription}</p>}
              </div>
              <div className="p-10">
                <FormRenderer
                  formSchema={{ title: formTitle, description: formDescription, fields, theme }}
                  onSubmit={async (data) => {
                    alert(JSON.stringify(data, null, 2));
                    setShowPreview(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings Modal */}
      {showThemeSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[24px] border border-hairline shadow-2xl relative overflow-hidden my-auto">
            <div className="px-8 py-6 border-b border-hairline bg-surface-soft flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink leading-tight">Theme Settings</h2>
                  <p className="text-xs text-muted font-medium mt-0.5">Customize the look and feel of your form.</p>
                </div>
              </div>
              <button onClick={() => setShowThemeSettings(false)} className="text-muted hover:text-ink transition-colors bg-white rounded-full border border-hairline p-2 hover:bg-gray-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Primary Color Section */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-primary"></div> Primary Accent Color
                </label>
                <div className="flex gap-3 items-center mb-4">
                  <div className="relative group shrink-0">
                    <input
                      type="color"
                      value={theme?.primaryColor || '#4f46e5'}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className="w-12 h-12 rounded-[14px] shadow-sm border border-gray-200 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: theme?.primaryColor || '#4f46e5' }}
                    />
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">HEX</span>
                    </div>
                    <input
                      type="text"
                      value={theme?.primaryColor || '#4f46e5'}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-[14px] border border-gray-200 bg-gray-50/50 text-ink text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all uppercase font-medium tracking-wide"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setTheme({ ...theme, primaryColor: color })}
                      className={`w-7 h-7 rounded-full transition-all hover:scale-110 relative ${theme?.primaryColor === color ? 'scale-110 shadow-sm' : 'border border-gray-200 shadow-sm'}`}
                      style={{ backgroundColor: color }}
                    >
                      {theme?.primaryColor === color && (
                        <div className="absolute inset-0 rounded-full border-2 border-white mix-blend-overlay"></div>
                      )}
                      {theme?.primaryColor === color && (
                        <div className="absolute -inset-1 rounded-full border-2 border-primary"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <hr className="border-gray-100" />

              {/* Background Color Section */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div> Background Color
                </label>
                <div className="flex gap-3 items-center mb-4">
                  <div className="relative group shrink-0">
                    <input
                      type="color"
                      value={theme?.backgroundColor || '#ffffff'}
                      onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className="w-12 h-12 rounded-[14px] shadow-sm border border-gray-200 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: theme?.backgroundColor || '#ffffff' }}
                    />
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">HEX</span>
                    </div>
                    <input
                      type="text"
                      value={theme?.backgroundColor || '#ffffff'}
                      onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                      className="w-full h-12 pl-12 pr-4 rounded-[14px] border border-gray-200 bg-gray-50/50 text-ink text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all uppercase font-medium tracking-wide"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_BGS.map(color => (
                    <button
                      key={color}
                      onClick={() => setTheme({ ...theme, backgroundColor: color })}
                      className={`w-7 h-7 rounded-full transition-all hover:scale-110 relative ${theme?.backgroundColor === color ? 'scale-110 shadow-sm' : 'border border-gray-200 shadow-sm'}`}
                      style={{ backgroundColor: color }}
                    >
                      {theme?.backgroundColor === color && (
                        <div className="absolute inset-0 rounded-full border border-gray-200/50 mix-blend-overlay"></div>
                      )}
                      {theme?.backgroundColor === color && (
                        <div className="absolute -inset-1 rounded-full border-2 border-gray-800"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-hairline" />

              {/* Typography Section */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-ink mb-3 uppercase tracking-wide">
                  <Type className="w-4 h-4 text-gray-400" /> Typography Style
                </label>
                <div className="relative">
                  <select
                    value={theme?.fontFamily || 'Inter'}
                    onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                    className="w-full h-14 px-4 rounded-xl border border-hairline bg-surface-soft text-ink text-base outline-none focus:border-ink transition-all font-semibold appearance-none hover:bg-gray-50"
                  >
                    <option value="Inter">Inter (Clean & Modern)</option>
                    <option value="Merriweather">Merriweather (Classic Serif)</option>
                    <option value="Roboto Mono">Roboto Mono (Technical)</option>
                    <option value="Outfit">Outfit (Bold Display)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <hr className="border-hairline" />

              {/* Form Radius Section */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-ink mb-3 uppercase tracking-wide">
                  <LayoutTemplate className="w-4 h-4 text-gray-400" /> Form Shape
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {BORDER_RADII.map((radiusOpt) => (
                    <button
                      key={radiusOpt.value}
                      onClick={() => setTheme({ ...theme, borderRadius: radiusOpt.value })}
                      className={`flex flex-col items-center justify-center py-4 border rounded-xl transition-all ${
                        (theme?.borderRadius || 'md') === radiusOpt.value 
                          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                          : 'border-hairline bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 mb-2 border-2 border-current`} style={{ borderRadius: radiusOpt.radius }}></div>
                      <span className="text-xs font-bold">{radiusOpt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
            
            <div className="px-8 py-5 border-t border-hairline bg-surface-soft flex justify-between items-center">
              <span className="text-xs text-muted font-medium">Changes apply immediately</span>
              <button
                onClick={() => setShowThemeSettings(false)}
                className="bg-primary text-on-primary font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full text-center shadow-2xl relative">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 bg-[#1a3c2a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1a3c2a]/20">
              <span className="text-3xl font-bold text-white">3</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111] mb-3">Form Limit Reached</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              You have reached the limit of 3 forms on the Free plan. Please upgrade to Pro to unlock unlimited forms.
            </p>
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-[#1a3c2a] text-white hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg mb-3"
            >
              Upgrade to Pro
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
