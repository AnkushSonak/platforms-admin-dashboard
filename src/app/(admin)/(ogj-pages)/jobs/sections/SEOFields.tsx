import React, { useState } from 'react';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { AdmitCardFormValues } from '@/lib/schemas/AdmitCardSchema';

interface SEOFieldsProps {
  control: Control<any>;
  watch: (field: string) => any;
}

export const SEOFields: React.FC<SEOFieldsProps> = ({ control, watch }) => {
const { formState: { errors },} = useFormContext<AdmitCardFormValues>();

  // Preview values
  const metaTitle = watch('seo.metaTitle') || 'Your meta title will appear here';
  const metaDescription = watch('seo.metaDescription') || 'Your meta description will appear here, showing how it will appear in search results.';
  const seoCanonicalUrl = watch('seo.seoCanonicalUrl') || 'https://example.com/page';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Meta Title */}
        <div className="bg-secondary shadow-sm rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-icons text-blue-500">title</span>
            <span className="font-semibold">Meta Title</span>
          </div>

          <Controller
            name="seo.metaTitle"
            control={control}
            render={({ field }) => (
              <>
                <Input
                  {...field}
                  maxLength={60}
                  placeholder="Enter Meta Title (max 60 chars)"
                />
                <p className="text-xs text-muted mt-1">
                  {field.value?.length || 0}/60 characters
                </p>

                {errors?.seo?.metaTitle && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.seo.metaTitle.message as string}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* Meta Description */}
        <div className="bg-secondary shadow-sm rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-icons text-green-500">description</span>
            <span className="font-semibold">Meta Description</span>
          </div>

          <Controller
            name="seo.metaDescription"
            control={control}
            render={({ field }) => (
              <>
                <Textarea
                  {...field}
                  maxLength={160}
                  rows={4}
                  placeholder="Enter Meta Description (max 160 chars)"
                />
                <p className="text-xs text-muted mt-1">
                  {field.value?.length || 0}/160 characters
                </p>

                {errors?.seo?.metaDescription && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.seo.metaDescription.message as string}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* SEO Keywords */}
        <div className="bg-secondary shadow-sm rounded-lg p-4 flex flex-col gap-2 md:col-span-2">
          <Controller
            name="seo.seoKeywords"
            control={control}
            render={({ field }) => {
              const keywords = Array.isArray(field.value)
                ? field.value
                : [];

              const addKeyword = (keyword: string) => {
                const value = keyword.trim();
                if (!value) return;

                if (!keywords.includes(value)) {
                  field.onChange([...keywords, value]);
                }
              };

              const removeKeyword = (keyword: string) => {
                field.onChange(
                  keywords.filter((k: string) => k !== keyword)
                );
              };

              return (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword: string) => (
                    <span
                      key={keyword}
                      className="bg-primary text-blue-800 px-2 py-1 rounded flex items-center gap-1 text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-red-500"
                      >
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
                  />
                </div>
              );
            }}
          />
        </div>

        {/* Canonical URL */}
        <div className="bg-secondary shadow-sm rounded-lg p-4 flex flex-col gap-2">
          <Controller
            name="seo.seoCanonicalUrl"
            control={control}
            render={({ field }) => (
              <>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://example.com/page"
                />

                {errors?.seo?.seoCanonicalUrl && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.seo.seoCanonicalUrl.message as string}
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* Schema JSON */}
        <div className="bg-secondary shadow-sm rounded-lg p-4 flex flex-col gap-2 md:col-span-2">
          <Controller
            name="seo.schemaMarkupJson"
            control={control}
            render={({ field }) => {
              const [jsonError, setJsonError] = useState<string | null>(null);

              const value =
                typeof field.value === 'string'
                  ? field.value
                  : JSON.stringify(field.value || {}, null, 2);

              const handleChange = (
                e: React.ChangeEvent<HTMLTextAreaElement>
              ) => {
                const text = e.target.value;

                try {
                  const parsed = JSON.parse(text);
                  field.onChange(parsed);
                  setJsonError(null);
                } catch {
                  field.onChange(text);
                  setJsonError('Invalid JSON');
                }
              };

              return (
                <>
                  <Textarea
                    rows={8}
                    value={value}
                    onChange={handleChange}
                    className="font-mono text-sm"
                  />
                  {jsonError && (
                    <p className="text-red-500 text-xs mt-1">
                      {jsonError}
                    </p>
                  )}
                </>
              );
            }}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-6 border rounded-lg bg-secondary shadow-sm">
        <h3 className="font-semibold text-sm mb-2">
          Google Search Preview
        </h3>
        <div className="text-blue-700 font-medium truncate">
          {metaTitle}
        </div>
        <div className="text-green-700 text-sm truncate">
          {seoCanonicalUrl}
        </div>
        <div className="text-sm">{metaDescription}</div>
      </div>
    </div>
  );
};