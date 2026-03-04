import RichTextEditor from "@/components/form/existing/RichTextEditor"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcn/ui/form"
import { useFormContext } from "react-hook-form"
import DynamicFieldsSection from "../../jobs/sections/DynamicFieldsSection"
import { FormTagInput } from "../../jobs/sections/FormTagInput"
import { FormMultiSelectIds } from "../../jobs/sections/FormMultiSelectIds"
import { MultiSelect } from "@/components/shadcn/ui/multi-select"
import React, { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getPaginatedEntity } from "@/lib/api/global/Generic"
import { ITag } from "@/app/helper/interfaces/ITag"
import { TAGS_API } from "@/app/envConfig"
import { FormVideoLinksInput } from "../../jobs/sections/FormVideoLinksInput"
import { DynamicLinksEditorPro } from "@/components/form/DynamicLinksEditorPro"
import { ImportantDatesDialog } from "@/components/form/ImportantDatesDialog"

let tagsEndpointUnavailableInSession = false;

export function StepContent() {
  const { control, setValue, watch, getValues } = useFormContext();
  const [tagsUnavailable, setTagsUnavailable] = React.useState(tagsEndpointUnavailableInSession);
  const lastAppliedSnapshotRef = React.useRef<string | null>(null);
  const normalizeImportantDates = React.useCallback((value: unknown) => {
    if (value == null) return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "object") {
      const objectValue = value as Record<string, unknown>;
      if ("label" in objectValue && "date" in objectValue) return [objectValue];
      return Object.values(objectValue).filter((entry) => entry && typeof entry === "object");
    }
    return value;
  }, []);

  const tagsQuery = useQuery({
    queryKey: ["admit-card-form", "tags"],
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !tagsEndpointUnavailableInSession,
    queryFn: () =>
      getPaginatedEntity<ITag>("type=tags&page=1", TAGS_API, {
      entityName: "tags",
      suppressErrorStatuses: [404],
      onHttpError: ({ status }) => {
        if (status === 404) {
          tagsEndpointUnavailableInSession = true;
          setTagsUnavailable(true);
        }
      },
    }),
  });
  const allTags = tagsQuery.data?.data ?? [];

  // Autofill StepContent fields from jobSnapshot
  const jobSnapshot = watch('jobSnapshot');
  useEffect(() => {
    if (!jobSnapshot) return;
    const payload = {
      dynamicFields: jobSnapshot.dynamicFields ?? null,
      importantLinks: jobSnapshot.importantLinks ?? null,
      importantDates: jobSnapshot.importantDates ?? null,
      helpfullVideoLinks: jobSnapshot.helpfullVideoLinks ?? null,
    };
    const signature = JSON.stringify(payload);
    if (lastAppliedSnapshotRef.current === signature) return;
    lastAppliedSnapshotRef.current = signature;

    const hasArrayValues = (value: unknown) => Array.isArray(value) && value.length > 0;

    // Do not overwrite existing/manual StepContent values on edit or after manual adjustments.
    const currentDynamicFields = getValues("dynamicFields");
    const currentImportantLinks = getValues("importantLinks");
    const currentImportantDates = getValues("importantDates");
    const currentHelpfulVideoLinks = getValues("helpfullVideoLinks");

    if (jobSnapshot.dynamicFields && !hasArrayValues(currentDynamicFields)) {
      setValue("dynamicFields", jobSnapshot.dynamicFields, { shouldDirty: false });
    }
    if (jobSnapshot.importantLinks && !hasArrayValues(currentImportantLinks)) {
      setValue("importantLinks", jobSnapshot.importantLinks, { shouldDirty: false });
    }
    if (jobSnapshot.importantDates && !hasArrayValues(currentImportantDates)) {
      setValue("importantDates", normalizeImportantDates(jobSnapshot.importantDates), { shouldDirty: false });
    }
    if (jobSnapshot.helpfullVideoLinks && !hasArrayValues(currentHelpfulVideoLinks)) {
      setValue("helpfullVideoLinks", jobSnapshot.helpfullVideoLinks, { shouldDirty: false });
    }
  }, [getValues, jobSnapshot, normalizeImportantDates, setValue]);

  return (
    <div className="grid grid-cols-1 gap-6">
 
      <FormField name="descriptionJson" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Description (JSON)</FormLabel>
          <FormControl>
            <RichTextEditor id="descriptionJson" namespace="form-news-and-ntfn-description" value={field.value || ''}
              mode="full"
              onChange={(data) => { field.onChange(JSON.stringify(data.json)); setValue('descriptionHtml', data.html); }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          {tagsUnavailable && (
            <p className="text-sm text-amber-600">Tags service is unavailable right now. You can continue without selecting tags.</p>
          )}
          <FormMessage />
        </FormItem>
      )} />
      </div>

      <FormField name="importantLinks" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Important Links</FormLabel>
          <FormControl>
            <DynamicLinksEditorPro value={field.value || []} onChange={field.onChange} />
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

      <FormField name="helpfullVideoLinks" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
              <FormVideoLinksInput name="helpfullVideoLinks" control={control} label="Helpful Video Links" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="importantDates" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
              <ImportantDatesDialog value={field.value || []} onChange={(v) => field.onChange(v)} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      {/* <FormField name="importantInstructions" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Important Instructions</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Important Instructions (comma separated)" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} /> */}


    </div>
  )
}
