import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/shadcn/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/ui/select';

interface SelectOrTypeInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: string[];
  placeholder?: string;
}

export function SelectOrTypeInput<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = 'Select or type value',
}: SelectOrTypeInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          <label className="block text-sm pb-2">{label}</label>
          <div className='flex flex-row justify-center gap-2 items-center'>

          {/* Dropdown */}
          <Select
            value={options.includes(field.value) ? field.value : ''}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Free text input */}
          <Input
            className="w-full"
            placeholder="Or type custom value"
            value={field.value || ''}
            onChange={(e) => field.onChange(e.target.value)}
          />
          </div>
        </div>
      )}
    />
  );
}
