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
import { X, Loader2, Cloud, CloudOff, CheckCircle2 } from 'lucide-react';

export default function FormBuilder() {
  const { addField, reorderFields, fields, formTitle, formDescription, setFormDetails, setFields } = useFormBuilderStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<FieldType | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
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
        await api.put(`/forms/${id}`, { title: formTitle, description: formDescription, fields });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('error');
      }
    }, 1500); // 1.5 second debounce

    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [fields, formTitle, formDescription]);

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
        });
      } else {
        // Create new form
        await api.post('/forms', {
          title: formTitle,
          description: formDescription,
          fields,
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save form', error);
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
        <div className="space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            className="rounded-md border border-hairline px-4 py-2 text-sm font-medium hover:bg-surface-card text-ink transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 h-[40px] text-sm font-medium text-on-primary hover:bg-primary-active transition-colors"
          >
            {id ? 'Update Form' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <Sidebar />
          <Canvas />
          <PropertiesPanel />

          <DragOverlay>
            {activeId && activeType ? (
              <div className="p-3 bg-surface-dark border border-surface-dark-elevated shadow-lg rounded-md opacity-90 cursor-grabbing flex items-center gap-2">
                <span className="text-sm font-medium text-on-dark capitalize">{activeType}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-canvas w-full max-w-[760px] rounded-xl border border-hairline shadow-2xl relative my-auto">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-6 right-6 text-muted hover:text-ink transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-10 border-b border-hairline bg-surface-card rounded-t-xl">
              <h1 className="text-[48px] leading-[1.1] font-display font-semibold text-ink tracking-tight">{formTitle || 'Untitled Form'}</h1>
              {formDescription && <p className="mt-4 text-lg text-muted font-sans">{formDescription}</p>}
            </div>
            <div className="p-10">
              <FormRenderer
                formSchema={{ title: formTitle, description: formDescription, fields }}
                onSubmit={async (data) => {
                  alert(JSON.stringify(data, null, 2));
                  setShowPreview(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
