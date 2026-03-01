import { useFormContext } from "react-hook-form"
import { SEOFields } from "../../jobs/sections/SEOFields"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/shadcn/ui/form"

export function StepSEOAndAI() {
  const { control, watch } = useFormContext()

  return (
    <div className="space-y-6">
      

      <FormField name="aiMeta.tldr" control={control} render={({ field }) => (
        <FormItem>
          {/* <FormLabel>AI Summary</FormLabel> */}
          <FormControl><SEOFields control={control} watch={watch} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  )
}
