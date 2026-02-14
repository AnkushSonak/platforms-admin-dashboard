import { useState } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';

interface RegionWiseLinksEditorProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  regionPlaceholder?: string;
  urlPlaceholder?: string;
}

export function RegionWiseLinksEditor<T extends FieldValues>({
  name,
  control,
  label,
  regionPlaceholder = 'Region Name',
  urlPlaceholder = 'Enter URL',
}: RegionWiseLinksEditorProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const regionLinks: Record<string, string> = field.value || {};

        const [newRegion, setNewRegion] = useState('');
        const [newUrl, setNewUrl] = useState('');

        const setRegionLink = (region: string, url: string) => {
          field.onChange({ ...regionLinks, [region]: url });
        };

        const removeRegion = (region: string) => {
          const updated = { ...regionLinks };
          delete updated[region];
          field.onChange(updated);
        };

        const addRegion = () => {
          const region = newRegion.trim();
          const url = newUrl.trim();

          if (!region) return;
          if (regionLinks[region]) {
            alert('This region already exists');
            return;
          }

          field.onChange({ ...regionLinks, [region]: url });
          setNewRegion('');
          setNewUrl('');
        };

        return (
          <div>
            <label className="block text-sm pb-2">{label}</label>

            <div className="space-y-2">
              {/* Existing regions */}
              {Object.entries(regionLinks).map(([region, url]) => (
                <div key={region} className="flex gap-2 items-center">
                  <Input
                    value={region}
                    readOnly
                    className="w-1/4 bg-muted"
                  />
                  <Input
                    value={url}
                    onChange={(e) => setRegionLink(region, e.target.value)}
                    className="w-3/4"
                    placeholder={urlPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => removeRegion(region)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* Add new region */}
              <div className="flex gap-2 items-center pt-2">
                <Input
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder={regionPlaceholder}
                  className="w-1/4"
                />
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={urlPlaceholder}
                  className="w-3/4"
                />
                <button
                  type="button"
                  onClick={addRegion}
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
