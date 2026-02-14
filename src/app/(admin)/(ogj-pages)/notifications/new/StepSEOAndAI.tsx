import { useFormContext } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { SEOFields } from "../../jobs/sections/SEOFields"

export function StepSEOAndAI() {
  const { control, watch } = useFormContext()

  return (
    <div className="space-y-6">
      <SEOFields control={control} watch={watch} />

      {/* <FormField name="aiMeta.tldr" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>AI Summary</FormLabel>
          <FormControl><Textarea rows={3} {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} /> */}
    </div>
  )
}
