import RichTextEditor from "@/app/components/RichTextEditor"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useFormContext } from "react-hook-form"
import DynamicFieldsSection from "../../jobs/sections/DynamicFieldsSection"
import { FormTagInput } from "../../jobs/sections/FormTagInput"
import { DynamicLinksEditor } from "../../jobs/sections/DynamicLinksEditor"

export function StepContent() {
  const { control, setValue } = useFormContext()

  return (
    <div className="space-y-6">
 
      <FormField name="descriptionJson" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Description (JSON)</FormLabel>
          <FormControl>
            <RichTextEditor id="descriptionJson" namespace="form-news-and-ntfn-description" value={field.value || ''}
              onChange={(data) => { field.onChange(JSON.stringify(data.json)); setValue('descriptionHtml', data.html); }}
            />
          </FormControl>
          {/* <Controller name="descriptionJson" control={control}
            render={({ field }) => (<RichTextEditor id="descriptionJson" namespace="form-news-and-ntfn-description" value={field.value || ''}
              onChange={(data) => { field.onChange(JSON.stringify(data.json)); setValue('descriptionHtml', data.html); }}
            />
            )}
          /> */}
          <FormMessage />
        </FormItem>
      )} />

      {/* <FormField name="headlineImage.url" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Headline Image URL</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} /> */}

      <FormField name="tags" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormTagInput name="tags" control={control} label="Tags" placeholder="Type tag and press Enter" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="importantLinks" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Important Links</FormLabel>
          <FormControl>
            <DynamicLinksEditor value={field.value || []} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="dynamicFields" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Dynamic Fields</FormLabel>
          <FormControl>
              <DynamicFieldsSection />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />


    </div>
  )
}
