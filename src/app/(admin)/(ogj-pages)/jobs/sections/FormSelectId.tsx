import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';

interface FormSelectIdProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  options: {
    id: string | number;
    label: string;
  }[];
}

export function FormSelectId<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Select option',
  options,
}: FormSelectIdProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          <label className="block text-sm pb-2">{label}</label>

          <Select
            value={field.value ?? ''}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className='bg-gray-25'>
              {options.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)}>
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
