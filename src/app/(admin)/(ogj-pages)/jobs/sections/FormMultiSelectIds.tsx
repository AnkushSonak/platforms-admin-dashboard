import { Controller, Control, FieldValues, Path } from 'react-hook-form';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface FormMultiSelectIdsProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: MultiSelectOption[];
  placeholder?: string;
  MultiSelectComponent: React.ComponentType<{
    options: MultiSelectOption[];
    selected: string[];
    onSelect: (ids: string[]) => void;
    placeholder?: string;
  }>;
}

export function FormMultiSelectIds<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  MultiSelectComponent,
}: FormMultiSelectIdsProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedIds: string[] = Array.isArray(field.value) ? field.value : [];

        return (
          <div>
            <label className="block text-sm pb-2">{label}</label>

            <MultiSelectComponent
              options={options}
              selected={selectedIds}
              onSelect={(ids) => field.onChange(ids)}
              placeholder={placeholder}
            />
          </div>
        );
      }}
    />
  );
}
