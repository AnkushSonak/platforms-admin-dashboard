import RichTextEditor from "@/components/form/existing/RichTextEditor"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcn/ui/form"
import { useFormContext } from "react-hook-form"
import DynamicFieldsSection from "../../jobs/sections/DynamicFieldsSection"
import { FormTagInput } from "../../jobs/sections/FormTagInput"
import { DynamicLinksEditor } from "../../jobs/sections/DynamicLinksEditor"
import { FormMultiSelectIds } from "../../jobs/sections/FormMultiSelectIds"
import { MultiSelect } from "@/components/shadcn/ui/multi-select"
import React, { useEffect } from "react"
import { getPaginatedEntity } from "@/lib/api/global/Generic"
import { ITag } from "@/app/helper/interfaces/ITag"
import { TAGS_API } from "@/app/envConfig"

export function StepContent() {
  const { control, setValue } = useFormContext()
  const [allTags, setAllTags] = React.useState<ITag[]>([]);

  useEffect(() => { getPaginatedEntity<ITag>("type=tags&page=1", TAGS_API,  { entityName: "tags" }).then((response) => setAllTags(response.data)).catch(() => setAllTags([])); }, []);
  

  return (
    <div className="grid grid-cols-1 gap-6">
 
      <FormField name="descriptionJson" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Description (JSON)</FormLabel>
          <FormControl>
            <RichTextEditor id="descriptionJson" namespace="form-news-and-ntfn-description" value={field.value || ''}
              onChange={(data) => { field.onChange(JSON.stringify(data.json)); setValue('descriptionHtml', data.html); }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

        <div className="grid grid-cols-2 gap-6">
      <FormField name="cardTags" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormTagInput name="cardTags" control={control} label="Card Tags" placeholder="Type tag and press Enter" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="tagIds" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormMultiSelectIds {...field} name="tagIds" control={control} label="Select Tags" placeholder="Select tags" options={allTags.map((s) => ({
              label: s.name, value: String(s.id),
            }))} MultiSelectComponent={MultiSelect} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
      </div>

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
