import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/shadcn/ui/input';

interface FormColorPickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  defaultColor?: string;
}

export function FormColorPicker<T extends FieldValues>({
  name,
  control,
  label,
  defaultColor = '#000000',
}: FormColorPickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = field.value || defaultColor;

        return (
          <div>
            <label className="block text-sm pb-2">{label}</label>

            <div className="flex items-center gap-3">
              {/* Native color picker */}
              <Input
                type="color"
                value={value}
                onChange={field.onChange}
                className="h-10 w-14 p-1 cursor-pointer"
              />

              {/* Hex input */}
              <Input
                type="text"
                value={value}
                onChange={field.onChange}
                placeholder={defaultColor}
                className="flex-1"
              />

              {/* Preview box */}
              <div
                className="h-10 w-10 rounded border"
                style={{ backgroundColor: value }}
              />
            </div>
          </div>
        );
      }}
    />
  );
}
