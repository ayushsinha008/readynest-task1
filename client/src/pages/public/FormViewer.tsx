import { useState, useEffect } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';
import { useForm as useHookForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default function FormViewer() {
  const { slug } = useParams();
  const location = useLocation();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuthStore();
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
      const processedData = { ...data };
      
      // Convert any FileList to base64 strings
      for (const key in processedData) {
        if (processedData[key] instanceof FileList && processedData[key].length > 0) {
          const file = processedData[key][0];
          processedData[key] = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } else if (processedData[key] instanceof FileList) {
          processedData[key] = null;
        }
      }

      await api.post(`/public/forms/${slug}/submit`, { data: processedData, respondentEmail: user?.email });
      setIsSubmitted(true);
    } catch (err) {
      alert('Failed to submit form');
    }
  };

  if (isAuthLoading || isLoading) return <div className="min-h-screen flex items-center justify-center bg-canvas text-muted font-sans">Loading form...</div>;
  if (!isAuthenticated) return <Navigate to={`/register?returnTo=${encodeURIComponent(location.pathname)}`} replace />;

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

  const theme = formSchema.theme || {};
  const wrapperStyle = {
    backgroundColor: theme.backgroundColor || '#ffffff',
    fontFamily: theme.fontFamily ? `"${theme.fontFamily}", sans-serif` : undefined,
  };
  const radiusClass = theme.borderRadius === 'none' ? 'rounded-none' : theme.borderRadius === 'sm' ? 'rounded-sm' : theme.borderRadius === 'xl' ? 'rounded-[24px]' : 'rounded-xl';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 transition-colors" style={wrapperStyle}>
      <div className="max-w-[760px] mx-auto">
        <div className={`bg-white border border-hairline overflow-hidden shadow-sm ${radiusClass}`} style={{ fontFamily: wrapperStyle.fontFamily }}>
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
  const generateZodSchema = (fields: any[]) => {
    const schemaObject: Record<string, z.ZodTypeAny> = {};
    fields.forEach(field => {
      let validator: z.ZodTypeAny;
      
      if (field.type === 'email') validator = z.string().email('Invalid email address');
      else if (field.type === 'number') validator = z.string().refine((val) => !val || !isNaN(Number(val)), 'Must be a number');
      else if (field.type === 'url') validator = z.string().refine((val) => !val || /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val), 'Invalid URL');
      else if (field.type === 'file') validator = z.any();
      else if (field.type === 'payment') validator = z.any();
      else if (field.type === 'checkbox') validator = z.any();
      else if (field.type === 'rating') validator = z.number().min(1).max(5);
      else if (field.type === 'toggle') validator = z.boolean().default(false);
      else validator = z.string();
      
      if (field.required) {
        if (['text', 'textarea', 'dropdown', 'radio', 'email', 'number', 'url'].includes(field.type)) {
           validator = (validator as z.ZodString).min(1, 'This field is required');
        } else if (field.type === 'file') {
           validator = validator.refine((files: any) => files?.length > 0, 'File is required');
        } else if (field.type === 'checkbox') {
           validator = validator.refine((val: any) => Array.isArray(val) && val.length > 0, 'Must select at least one option');
        }
      } else {
        if (field.type !== 'file' && field.type !== 'payment' && field.type !== 'checkbox' && field.type !== 'rating' && field.type !== 'toggle') {
          validator = (validator as z.ZodString).optional().or(z.literal(''));
        } else {
          validator = validator.optional();
        }
      }
      schemaObject[field.id] = validator;
    });
    return z.object(schemaObject);
  };

  const dynamicSchema = generateZodSchema(formSchema.fields);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useHookForm({
    resolver: zodResolver(dynamicSchema)
  });

  const handleFormSubmit = async (data: any) => {
    // In the future, if the form contains a payment field, 
    // this would hit the backend to generate a PayU hash and redirect to PayU.
    await onSubmit(data);
  };

  const theme = formSchema.theme || {};
  const radiusClass = theme.borderRadius === 'none' ? 'rounded-none' : theme.borderRadius === 'sm' ? 'rounded-sm' : theme.borderRadius === 'xl' ? 'rounded-xl' : 'rounded-md';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
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
              className={`w-full h-12 px-4 border-hairline ${radiusClass} focus:border-ink focus:ring-1 focus:ring-ink text-base border bg-canvas text-ink transition-all font-sans outline-none placeholder-muted`}
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              placeholder={field.placeholder}
              {...register(field.id, { required: field.required })}
              className={`w-full px-4 py-3 border-hairline ${radiusClass} focus:border-ink focus:ring-1 focus:ring-ink text-base border h-32 bg-canvas text-ink transition-all font-sans outline-none placeholder-muted`}
            />
          )}

          {field.type === 'dropdown' && (
            <select
              {...register(field.id, { required: field.required })}
              className={`w-full h-12 px-4 border-hairline ${radiusClass} focus:border-ink focus:ring-1 focus:ring-ink text-base border bg-canvas text-ink transition-all font-sans outline-none appearance-none`}
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
                        (Number(value) || 0) >= star ? 'text-badge-orange' : 'text-surface-strong hover:text-badge-orange/50'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              )}
            />
          )}

          {field.type === 'file' && (
            <input
              type="file"
              {...register(field.id, { required: field.required })}
              className={`w-full px-4 py-3 border-hairline ${radiusClass} focus:border-ink focus:ring-1 focus:ring-ink text-base border bg-canvas text-ink transition-all font-sans outline-none file:mr-4 file:py-2 file:px-4 file:${radiusClass} file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:opacity-90 cursor-pointer`}
            />
          )}

          {field.type === 'toggle' && (
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register(field.id, { required: field.required })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
              <span className="text-sm text-ink font-sans">{field.placeholder || 'Enable'}</span>
            </label>
          )}

          {field.type === 'payment' && (
            <div className="mt-2">
              <div className={`p-4 border border-hairline ${radiusClass} bg-canvas`}>
                <p className="text-muted text-sm italic">Payment will be securely processed via PayU after submission.</p>
              </div>
              {field.placeholder && (
                <p className="text-sm font-medium text-ink mt-2">Amount to pay: ₹{field.placeholder}</p>
              )}
            </div>
          )}

          {errors[field.id] && <p className="text-error text-sm mt-1 font-sans">{errors[field.id]?.message as string}</p>}
          {field.helpText && !errors[field.id] && <p className="text-muted text-sm mt-2 font-sans">{field.helpText}</p>}
        </div>
      ))}

      <div className="pt-8 mt-8 border-t border-hairline">
        <button
          type="submit"
          disabled={isSubmitting}
          style={formSchema.theme?.primaryColor ? { backgroundColor: formSchema.theme.primaryColor, color: '#fff' } : undefined}
          className={`bg-primary text-on-primary ${radiusClass} px-8 h-12 font-bold hover:opacity-90 transition-opacity disabled:opacity-50 text-base shadow-sm hover:shadow-md hover:-translate-y-0.5`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </div>
    </form>
  );
}
