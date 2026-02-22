import { useState } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/shadcn/ui/input';

interface FormTagInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  maxTags?: number;
  transform?: (value: string) => string;
}

export function FormTagInput<T extends FieldValues>({ name, control, label, placeholder = 'Type and press Enter', maxTags,
  transform = (v) => v.trim(), }: FormTagInputProps<T>) {

  return (
    <Controller name={name} control={control}
      render={({ field }) => {
        const tags: string[] = Array.isArray(field.value) ? field.value : [];
        const [inputValue, setInputValue] = useState('');

        const addTag = () => {
          let value = transform(inputValue);

          if (!value) return;
          if (tags.includes(value)) return;
          if (maxTags && tags.length >= maxTags) return;

          field.onChange([...tags, value]);
          setInputValue('');
        };

        const removeTag = (tag: string) => {
          field.onChange(tags.filter((t) => t !== tag));
        };

        return (
          <div>
            <label className="block text-sm pb-2">{label}</label>

            <div className="flex flex-wrap gap-2 text-green-500 rounded">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ✕
                  </button>
                </span>
              ))}

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder={placeholder}
                className="flex-1 focus-visible:ring-0"
              />
            </div>

            {maxTags && (
              <p className="text-xs text-muted-foreground mt-1">
                {tags.length}/{maxTags} tags
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
