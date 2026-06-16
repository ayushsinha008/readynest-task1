import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import { useForm as useHookForm, Controller } from 'react-hook-form';

export default function FormViewer() {
  const { slug } = useParams();
  const [formSchema, setFormSchema] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data } = await api.get(`/public/forms/${slug}`);
        setFormSchema(data.form);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Form not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  const handleFormSubmit = async (data: any) => {
    try {
      await api.post(`/public/forms/${slug}/submit`, { data });
      setIsSubmitted(true);
    } catch (err) {
      alert('Failed to submit form');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-canvas text-muted font-sans">Loading form...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-canvas text-error font-sans">{error}</div>;
  if (isSubmitted) return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="bg-surface-card p-12 rounded-lg border border-hairline max-w-md w-full text-center">
        <div className="w-16 h-16 bg-surface-strong text-ink rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
        <h2 className="text-3xl font-display font-semibold tracking-tight text-ink mb-3">Thank You!</h2>
        <p className="text-muted font-sans text-lg">Your response has been recorded.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6">
      <div className="max-w-[760px] mx-auto">
        <div className="bg-surface-card rounded-xl border border-hairline overflow-hidden">
          <div className="p-10 border-b border-hairline bg-surface-card">
            <h1 className="text-[48px] leading-[1.1] font-display font-semibold text-ink tracking-tight">{formSchema.title}</h1>
            {formSchema.description && <p className="mt-4 text-lg text-muted font-sans">{formSchema.description}</p>}
          </div>
          <div className="p-10">
            <FormRenderer formSchema={formSchema} onSubmit={handleFormSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormRenderer({ formSchema, onSubmit }: { formSchema: any, onSubmit: (data: any) => Promise<void> }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useHookForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {formSchema.fields.map((field: any) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-semibold text-ink font-sans">
            {field.label} {field.required && <span className="text-error ml-1">*</span>}
          </label>
          
          {['text', 'email', 'number', 'password', 'url', 'phone', 'date'].includes(field.type) && (
            <input
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.id, { required: field.required })}
              className="w-full h-10 px-[14px] py-[10px] border-hairline rounded-md focus:border-ink focus:ring-1 focus:ring-ink text-sm border bg-canvas text-ink transition-all font-sans outline-none placeholder-muted"
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              placeholder={field.placeholder}
              {...register(field.id, { required: field.required })}
              className="w-full px-[14px] py-[10px] border-hairline rounded-md focus:border-ink focus:ring-1 focus:ring-ink text-sm border h-32 bg-canvas text-ink transition-all font-sans outline-none placeholder-muted"
            />
          )}

          {field.type === 'dropdown' && (
            <select
              {...register(field.id, { required: field.required })}
              className="w-full h-10 px-[14px] py-[10px] border-hairline rounded-md focus:border-ink focus:ring-1 focus:ring-ink text-sm border bg-canvas text-ink transition-all font-sans outline-none appearance-none"
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((opt: any, i: number) => (
                <option key={i} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {field.type === 'radio' && (
            <div className="space-y-3 mt-3">
              {field.options?.map((opt: any, i: number) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value={opt.value}
                    {...register(field.id, { required: field.required })}
                    className="w-4 h-4 text-ink border-hairline focus:ring-ink bg-canvas"
                  />
                  <span className="text-sm text-ink font-sans">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === 'checkbox' && (
            <div className="space-y-3 mt-3">
              {field.options?.map((opt: any, i: number) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={opt.value}
                    {...register(field.id)}
                    className="w-4 h-4 rounded-sm text-ink border-hairline focus:ring-ink bg-canvas"
                  />
                  <span className="text-sm text-ink font-sans">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === 'rating' && (
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: { onChange, value } }) => (
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onChange(star)}
                      className={`text-3xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm ${
                        (value || 0) >= star ? 'text-badge-orange' : 'text-surface-strong hover:text-badge-orange/50'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              )}
            />
          )}

          {errors[field.id] && <p className="text-error text-sm mt-1 font-sans">This field is required</p>}
          {field.helpText && !errors[field.id] && <p className="text-muted text-sm mt-2 font-sans">{field.helpText}</p>}
        </div>
      ))}

      <div className="pt-8 mt-8 border-t border-hairline">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-on-primary rounded-md px-5 py-2 h-10 font-semibold hover:bg-primary-active transition-colors disabled:opacity-50 text-sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </div>
    </form>
  );
}
