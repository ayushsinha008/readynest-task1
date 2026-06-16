import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormBuilderStore, type FormField } from '../../store/useFormBuilderStore';
import { GripVertical, Trash2 } from 'lucide-react';

function SortableField({ field }: { field: FormField }) {
  const { selectedFieldId, setSelectedField, removeField } = useFormBuilderStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { type: 'canvas-field', field },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const isSelected = selectedFieldId === field.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedField(field.id);
      }}
      className={`relative group flex flex-col p-8 mb-4 rounded-lg bg-surface-card transition-all ${
        isSelected ? 'border border-ink shadow-sm' : 'border border-transparent hover:border-hairline'
      } ${isDragging ? 'opacity-50 border-ink shadow-md bg-canvas' : 'opacity-100'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab text-muted hover:text-ink transition-colors">
            <GripVertical className="w-5 h-5" />
          </button>
          <label className="text-base font-semibold text-ink font-sans">
            {field.label} {field.required && <span className="text-error ml-1">*</span>}
          </label>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeField(field.id);
          }}
          className="text-muted hover:text-error transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="pl-8 pointer-events-none">
        {['text', 'email', 'number', 'password', 'url', 'phone', 'date'].includes(field.type) && (
          <input type={field.type} placeholder={field.placeholder} disabled className="w-full h-10 border-hairline bg-canvas px-[14px] py-[10px] rounded-md text-sm border font-sans text-ink placeholder-muted" />
        )}
        {field.type === 'textarea' && (
          <textarea placeholder={field.placeholder} disabled className="w-full border-hairline bg-canvas px-[14px] py-[10px] rounded-md text-sm border h-24 font-sans text-ink placeholder-muted" />
        )}
        {['dropdown'].includes(field.type) && (
          <select disabled className="w-full h-10 border-hairline bg-canvas px-[14px] py-[10px] rounded-md text-sm border font-sans text-ink appearance-none">
            <option>{field.placeholder || 'Select an option'}</option>
          </select>
        )}
        {['checkbox', 'radio', 'toggle'].includes(field.type) && (
          <div className="flex flex-col gap-3">
            {(field.options || [{label: 'Option 1', value: '1'}]).map((opt, i) => (
              <label key={i} className="flex items-center gap-3 text-sm text-body font-sans">
                <input type={field.type === 'radio' ? 'radio' : 'checkbox'} disabled className="border-hairline h-4 w-4 rounded-sm" /> {opt.label}
              </label>
            ))}
          </div>
        )}
        {field.type === 'rating' && (
          <div className="flex gap-1 mt-2">
            {[1,2,3,4,5].map(n => <span key={n} className="text-3xl text-surface-strong">★</span>)}
          </div>
        )}
        {field.type === 'file' && (
          <div className="border border-dashed border-hairline rounded-md bg-canvas p-6 text-center text-sm text-muted">
            File Upload Area
          </div>
        )}
        
        {field.helpText && <p className="text-sm text-muted mt-2 font-sans">{field.helpText}</p>}
      </div>
    </div>
  );
}

export default function Canvas() {
  const { fields, formTitle, formDescription, setFormDetails, setSelectedField } = useFormBuilderStore();
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  return (
    <div 
      className="flex-1 px-4 py-16 md:px-12 bg-canvas overflow-y-auto"
      onClick={() => setSelectedField(null)}
    >
      <div className="max-w-[760px] mx-auto space-y-12 pb-32">
        <div className="bg-canvas p-0">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormDetails(e.target.value, formDescription)}
            className="w-full text-[48px] leading-[1.1] font-display font-semibold text-ink border-none outline-none focus:ring-0 placeholder-muted-soft bg-transparent tracking-tight mb-2 p-0"
            placeholder="Form Title"
          />
          <input
            type="text"
            value={formDescription}
            onChange={(e) => setFormDetails(formTitle, e.target.value)}
            className="w-full text-lg text-muted border-none outline-none focus:ring-0 placeholder-muted-soft bg-transparent font-sans p-0"
            placeholder="Form Description"
          />
        </div>

        <div
          ref={setNodeRef}
          className={`min-h-[400px] transition-colors ${isOver && fields.length === 0 ? 'bg-surface-soft rounded-xl border-2 border-dashed border-ink' : ''}`}
        >
          {fields.length === 0 ? (
            <div className="h-full w-full border-2 border-dashed border-hairline rounded-xl flex items-center justify-center text-muted bg-surface-card min-h-[400px] font-sans">
              Drag and drop elements here to build your form
            </div>
          ) : (
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field) => (
                <SortableField key={field.id} field={field} />
              ))}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}
