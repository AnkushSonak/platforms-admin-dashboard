import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';

export interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  options: SelectOption[];
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Select option',
  options,
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          <label className="block text-sm">{label}</label>

          <Select
            value={field.value ?? ''}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className='bg-gray-25'>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
}
