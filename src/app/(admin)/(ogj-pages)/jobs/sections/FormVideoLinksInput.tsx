import { useState } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/shadcn/ui/input';
import { ExternalLink, X } from 'lucide-react';

interface FormVideoLinksInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  maxLinks?: number;
}

// Simple YouTube URL validation
const YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?][\w=&-]*)?$/;

function isYouTubeUrl(url: string) {
  return YOUTUBE_REGEX.test(url);
}


export function FormVideoLinksInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Paste YouTube link and press Enter',
  maxLinks,
}: FormVideoLinksInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const links: string[] = Array.isArray(field.value) ? field.value : [];
        const [inputValue, setInputValue] = useState('');
        const [error, setError] = useState('');

        const addLink = () => {
          const value = inputValue.trim();
          if (!value) return;

          if (!isYouTubeUrl(value)) {
            setError('Please enter a valid YouTube URL');
            return;
          }

          if (links.includes(value)) {
            setError('This link is already added');
            return;
          }

          if (maxLinks && links.length >= maxLinks) {
            setError(`Maximum ${maxLinks} links allowed`);
            return;
          }

          field.onChange([...links, value]);
          setInputValue('');
          setError('');
        };

        const removeLink = (link: string) => {
          field.onChange(links.filter((l) => l !== link));
        };

        return (
          <div>
            <label className="block text-sm pb-2">{label}</label>

            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
                placeholder={placeholder}
                className="flex-1"
              />
              <button
                type="button"
                onClick={addLink}
                className="px-3 py-2 border rounded"
              >
                Add
              </button>
            </div>

            {error && <p className="text-sm text-destructive mt-1">{error}</p>}

            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li
                  key={link}
                  className="flex items-center justify-between border rounded p-2 text-sm"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink size={14} />
                    {link}
                  </a>

                  <button
                    type="button"
                    onClick={() => removeLink(link)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      }}
    />
  );
}
