import { useDraggable } from '@dnd-kit/core';
import type { FieldType } from '../../store/useFormBuilderStore';
import { 
  Type, Mail, Hash, KeyRound, AlignLeft, 
  ChevronDown, CheckSquare, CircleDot, 
  Calendar, Upload, Phone, Link2, Star, ToggleLeft 
} from 'lucide-react';

const FIELD_TYPES: { type: FieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'password', label: 'Password', icon: KeyRound },
  { type: 'textarea', label: 'Textarea', icon: AlignLeft },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio', icon: CircleDot },
  { type: 'date', label: 'Date Picker', icon: Calendar },
  { type: 'file', label: 'File Upload', icon: Upload },
  { type: 'phone', label: 'Phone Number', icon: Phone },
  { type: 'url', label: 'URL', icon: Link2 },
  { type: 'rating', label: 'Rating', icon: Star },
  { type: 'toggle', label: 'Toggle', icon: ToggleLeft },
];

function DraggableField({ type, label, icon: Icon }: { type: FieldType; label: string; icon: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      type: 'sidebar-field',
      fieldType: type,
      label,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 p-3 mb-2 rounded-md border bg-canvas cursor-grab hover:border-ink hover:shadow-sm transition-all ${
        isDragging ? 'opacity-50 border-ink shadow-md' : 'border-hairline'
      }`}
    >
      <Icon className="w-4 h-4 text-muted" />
      <span className="text-sm font-medium text-ink">{label}</span>
    </div>
  );
}

export default function Sidebar() {
  return (
    <div className="w-72 border-r border-hairline bg-surface-soft p-6 overflow-y-auto">
      <h3 className="font-semibold mb-6 text-xs uppercase text-muted tracking-widest">Form Elements</h3>
      <div className="space-y-1">
        {FIELD_TYPES.map((field) => (
          <DraggableField key={field.type} {...field} />
        ))}
      </div>
    </div>
  );
}
