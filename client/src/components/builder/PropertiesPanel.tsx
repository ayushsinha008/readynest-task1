import { useFormBuilderStore, type FormField } from '../../store/useFormBuilderStore';

export default function PropertiesPanel() {
  const { fields, selectedFieldId, updateField } = useFormBuilderStore();
  const selectedField = fields.find((f) => f.id === selectedFieldId);

  if (!selectedField) {
    return (
      <div className="w-[320px] border-l border-hairline bg-surface-soft p-6 flex flex-col items-center justify-center text-center">
        <h3 className="font-semibold mb-2 text-ink">No Element Selected</h3>
        <p className="text-sm text-muted">Click on an element in the canvas to edit its properties.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    updateField(selectedField.id, { [name]: finalValue });
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...(selectedField.options || [])];
    newOptions[index].label = val;
    newOptions[index].value = val.toLowerCase().replace(/\s+/g, '-');
    updateField(selectedField.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(selectedField.options || []), { label: `Option ${(selectedField.options?.length || 0) + 1}`, value: `option-${(selectedField.options?.length || 0) + 1}` }];
    updateField(selectedField.id, { options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (selectedField.options || []).filter((_, i) => i !== index);
    updateField(selectedField.id, { options: newOptions });
  };

  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(selectedField.type);

  return (
    <div className="w-[320px] border-l border-hairline bg-surface-soft p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-hairline">
        <h3 className="font-bold text-ink font-sans">Field Properties</h3>
        <span className="text-xs bg-surface-card text-muted border border-hairline px-2 py-1 rounded-pill capitalize font-medium">{selectedField.type}</span>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">Field Label</label>
          <input
            type="text"
            name="label"
            value={selectedField.label}
            onChange={handleChange}
            className="w-full h-10 px-[14px] py-[10px] rounded-md border border-hairline bg-canvas text-ink text-sm outline-none focus:border-ink transition-all"
          />
        </div>

        {['text', 'email', 'number', 'password', 'textarea', 'url'].includes(selectedField.type) && (
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Placeholder</label>
            <input
              type="text"
              name="placeholder"
              value={selectedField.placeholder || ''}
              onChange={handleChange}
              className="w-full h-10 px-[14px] py-[10px] rounded-md border border-hairline bg-canvas text-ink text-sm outline-none focus:border-ink transition-all"
            />
          </div>
        )}

        {selectedField.type === 'payment' && (
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Payment Amount ($)</label>
            <input
              type="number"
              name="placeholder"
              value={selectedField.placeholder || ''}
              onChange={handleChange}
              className="w-full h-10 px-[14px] py-[10px] rounded-md border border-hairline bg-canvas text-ink text-sm outline-none focus:border-ink transition-all"
            />
            <p className="text-xs text-muted mt-1">Users will be charged this amount.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-ink mb-2">Help Text</label>
          <input
            type="text"
            name="helpText"
            value={selectedField.helpText || ''}
            onChange={handleChange}
            className="w-full h-10 px-[14px] py-[10px] rounded-md border border-hairline bg-canvas text-ink text-sm outline-none focus:border-ink transition-all"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="required-checkbox"
            name="required"
            checked={selectedField.required}
            onChange={handleChange}
            className="rounded-sm border-hairline bg-canvas text-ink focus:ring-ink focus:ring-offset-surface-soft w-4 h-4 outline-none"
          />
          <label htmlFor="required-checkbox" className="text-sm font-semibold text-ink cursor-pointer">
            Required Field
          </label>
        </div>

        {hasOptions && (
          <div className="pt-6 border-t border-hairline">
            <label className="block text-sm font-semibold text-ink mb-3">Options</label>
            <div className="space-y-3">
              {(selectedField.options || []).map((opt, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 h-10 px-[14px] py-[10px] rounded-md border border-hairline bg-canvas text-ink text-sm outline-none focus:border-ink transition-all"
                  />
                  <button onClick={() => removeOption(index)} className="text-muted hover:text-error px-2 transition-colors">✕</button>
                </div>
              ))}
              <button 
                onClick={addOption}
                className="text-sm text-ink font-semibold hover:underline mt-2 transition-all block"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
