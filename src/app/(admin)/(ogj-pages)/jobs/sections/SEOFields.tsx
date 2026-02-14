import React, { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';

interface SEOFieldsProps {
  control: Control<any>;
  watch: (field: string) => any; // Pass watch from useForm
}

export const SEOFields: React.FC<SEOFieldsProps> = ({ control, watch }) => {
  const metaTitle = watch('metaTitle') || 'Your meta title will appear here';
  const metaDescription =
    watch('metaDescription') ||
    'Your meta description will appear here, showing how it will appear in search results.';
  const seoCanonicalUrl = watch('seoCanonicalUrl') || 'https://example.com/page';

  return (
    <fieldset className="border rounded p-4 mb-4">
      <legend className="font-bold text-lg mb-2">SEO Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meta Title */}
        <Controller
          name="metaTitle"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm pb-1">Meta Title</label>
              <Input
                {...field}
                className="w-full border rounded p-2"
                maxLength={60}
                placeholder="Enter Meta Title (max 60 chars)"
              />
              <p className="text-xs text-muted mt-1">{field.value?.length || 0}/60 characters</p>
            </div>
          )}
        />

        {/* Meta Description */}
        <Controller
          name="metaDescription"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm pb-1">Meta Description</label>
              <Textarea
                {...field}
                className="w-full border rounded p-2"
                maxLength={160}
                rows={4}
                placeholder="Enter Meta Description (max 160 chars)"
              />
              <p className="text-xs text-muted mt-1">{field.value?.length || 0}/160 characters</p>
            </div>
          )}
        />

        {/* SEO Keywords */}
        <Controller
          name="seoKeywords"
          control={control}
          render={({ field }) => {
            const addKeyword = (keyword: string) => {
              const value = keyword.trim();
              if (!value) return;
              if (!Array.isArray(field.value)) field.onChange([value]);
              else if (!field.value.includes(value)) field.onChange([...field.value, value]);
            };

            const removeKeyword = (keyword: string) => {
              if (!Array.isArray(field.value)) return;
              field.onChange(field.value.filter((k) => k !== keyword));
            };

            const keywords = Array.isArray(field.value) ? field.value : [];

            return (
              <div className="md:col-span-2">
                <label className="block text-sm pb-1">SEO Keywords</label>
                <div className="border rounded p-2 flex flex-wrap gap-2">
                  {keywords.map((keyword: string) => (
                    <span
                      key={keyword}
                      className="bg-primary text-blue-800 px-2 py-1 rounded flex items-center gap-1 text-sm"
                    >
                      {keyword}
                      <button type="button" onClick={() => removeKeyword(keyword)} className="hover:text-red-500">
                        ✕
                      </button>
                    </span>
                  ))}
                  <Input
                    placeholder="Type keyword and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 border rounded p-2"
                  />
                </div>
              </div>
            );
          }}
        />

        {/* Canonical URL */}
        <Controller
          name="seoCanonicalUrl"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm pb-1">Canonical URL</label>
              <Input {...field} type="url" placeholder="https://example.com/page" className="w-full border rounded p-2" />
            </div>
          )}
        />

        {/* Schema Markup JSON */}
        <Controller
          name="schemaMarkupJson"
          control={control}
          render={({ field }) => {
            const [error, setError] = useState<string | null>(null);

            const value = typeof field.value === 'string' ? field.value : JSON.stringify(field.value || {}, null, 2);

            const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
              const text = e.target.value;
              try {
                const parsed = JSON.parse(text);
                field.onChange(parsed);
                setError(null);
              } catch {
                field.onChange(text);
                setError('Invalid JSON');
              }
            };

            return (
              <div>
                <label className="block text-sm pb-1">Schema Markup JSON</label>
                <Textarea
                  className="w-full border rounded p-2 font-mono text-sm"
                  rows={8}
                  placeholder="Paste valid JSON schema markup here"
                  value={value}
                  onChange={handleChange}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
            );
          }}
        />
      </div>

      {/* Google Snippet Preview */}
      <div className="mt-6 p-4 border rounded bg-secondary">
        <h3 className="font-semibold text-sm mb-2">Google Search Preview</h3>
        <div className="text-blue-700 font-medium text-base truncate">{metaTitle}</div>
        <div className="text-green-700 text-sm mb-1 truncate">{seoCanonicalUrl}</div>
        <div className="text-secondary-foreground text-sm">{metaDescription}</div>
      </div>
    </fieldset>
  );
};
