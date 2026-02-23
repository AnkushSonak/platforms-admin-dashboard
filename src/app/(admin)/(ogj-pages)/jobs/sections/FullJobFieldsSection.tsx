// FullJobFieldsSection.tsx
import React, { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { IJob } from "@/app/helper/interfaces/IJob";
import { ICategory } from "@/app/helper/interfaces/ICategory";
import { IState } from "@/app/helper/interfaces/IState";

import { Input } from "@/components/shadcn/ui/input";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Label } from "@/components/shadcn/ui/label";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/shadcn/ui/select";
import { MultiSelect } from "@/components/shadcn/ui/multi-select";
import RichTextEditor from "@/components/form/existing/RichTextEditor";
import LogoSelector from "@/components/form/existing/LogoSelector";
import { JsonFieldDialog } from "@/components/form/existing/JsonFieldDialog";
import DynamicFieldsSection from "./DynamicFieldsSection";
import debounce from "lodash/debounce";
import { JobFormData } from "@/lib/schemas/JobSchema";
import { DateTimePicker } from "@/components/shadcn/ui/date-time-picker";
import { SelectOrTypeInput } from "./SelectOrTypeInput";
import { organizations } from "@/app/helper/constants/Organizations";
import { FormTagInput } from "./FormTagInput";
import { FormVideoLinksInput } from "./FormVideoLinksInput";
import { FormColorPicker } from "./FormColorPicker";
import { FormMultiSelectIds } from "./FormMultiSelectIds";
import { INewsAndNtfn } from "@/app/helper/interfaces/INewsAndNtfn";
import { SEOFields } from "./SEOFields";
import { DynamicLinksEditor } from "./DynamicLinksEditor";
import { getPaginatedEntity } from "@/lib/api/global/Generic";
import { CATEGORY_API, JOBS_API, STATE_API } from "@/app/envConfig";

interface Props {
  onValidChange?: (payload: JobFormData) => void;
  onChange?: <K extends keyof IJob>(field: K, value: IJob[K]) => void;
  errors?: Partial<Record<keyof IJob, string>>; // legacy
  statesOptions?: { label: string; value: string }[];
  onLogoFileChange?: (file: File | null) => void;
}

const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Internship", "Temporary",];

const FullJobFieldsSection: React.FC<Props & { onHtmlChange?: (html: string) => void }> = ({ onValidChange, onChange, errors: legacyErrors = {}, statesOptions: propStatesOptions = [], onLogoFileChange, onHtmlChange }) => {

  const [jobs, setJobs] = useState<IJob[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [relatedNotifications, setRelatedNotifications] = useState<INewsAndNtfn[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch categories & states
  const [categories, setCategories] = React.useState<ICategory[]>([]);
    useEffect(() => {
      getPaginatedEntity<ICategory>("type=categories&page=1", CATEGORY_API, { entityName: "categories" })
        .then((res) => setCategories(res.data))
        .catch(() => setCategories([]));
    }, []);

  const [allStates, setAllStates] = React.useState<IState[]>([]);
  useEffect(() => { if (!propStatesOptions?.length) getPaginatedEntity<IState>("type=states&page=1", STATE_API, { entityName: "states" }).then((res) => setAllStates(res.data)).catch(() => setAllStates([])); }, [propStatesOptions?.length]);

  const computedStatesOptions = useMemo(() => {
    return propStatesOptions && propStatesOptions.length ? propStatesOptions : allStates.map(s => ({ label: s.stateName, value: String(s.id) }));
  }, [propStatesOptions, allStates]);

  // RHF context (FormProvider must be used by parent)
  const { control, register, setValue, watch, formState } = useFormContext() as any;
  const { errors } = formState;

  useEffect(() => {
    setLoading(true);
    // getJobListings(jobSearch, undefined, undefined, 1, 20)
    getPaginatedEntity<IJob>("type=jobs&page=1", JOBS_API,  { entityName: "jobs" })
      .then((res) => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobSearch]);

  // debounced emitter for valid payload
  const emitValid = useCallback(
    debounce((payload: JobFormData) => {
      if (onValidChange) onValidChange(payload);
    }, 300),
    [onValidChange]
  );

  // watch all fields (cheap but convenient)
  const watched = watch();

  // When form changes, emit validated payload only if there are no errors
  useEffect(() => {
    const hasErrors = errors && Object.keys(errors).length > 0;
    if (!hasErrors && onValidChange) {
      // normalize dates to Date objects for payload
      const payload: any = { ...watched };
      ["expiryDate", "autoPublishAt", "promotionStart", "promotionEnd"].forEach((k) => {
        if (payload[k]) payload[k] = payload[k] instanceof Date ? payload[k] : new Date(payload[k]);
        else payload[k] = null;
      });
      emitValid(payload);
    }
    return () => emitValid.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched, errors, onValidChange]);

  // convenience: prefer RHF error, fallback to legacy errors prop
  const fieldError = (name: string) => {
    const e = (errors as any)?.[name]?.message;
    return e ?? (legacyErrors as any)?.[name] ?? null;
  };

  // category handler
  const handleCategoryChange = (catId: string) => {
    const sel = categories.find(c => String(c.id) === catId) || null;
    setValue("category", sel, { shouldValidate: true });
    if (onChange) onChange("category" as any, sel as any);
  };

  // states multi-select handler
  const handleStatesSelect = (selectedIds: string[]) => {
    const source = allStates.length ? allStates : computedStatesOptions.map(opt => ({ id: Number(opt.value), stateName: opt.label, slug: "", isActive: true }));
    const stateObjs = source.filter((s: any) => selectedIds.includes(String(s.id)));
    setValue("states", stateObjs, { shouldValidate: true });
    if (onChange) onChange("states" as any, stateObjs as any);
  };

  // editor change handler: sets descriptionJson and generated descriptionHtml
  const onEditorChange = (data: any) => {
    let jsonVal: any = null;
    let htmlVal: string = "";

    if (typeof data === "string") {
      jsonVal = data;
      htmlVal = ""; // Should not happen, always expect object from RichTextEditor
    } else if (data && typeof data === "object") {
      jsonVal = data.json ?? data;
      htmlVal = data.html ?? "";
    }

    setValue("descriptionJson", jsonVal, { shouldValidate: true });
    setValue("descriptionHtml", htmlVal, { shouldValidate: true });
    if (onHtmlChange) onHtmlChange(htmlVal);
  };

  // dynamic fields handler
  const handleDynamicFieldsChange = (items: any) => {
    setValue("dynamicFields", items, { shouldValidate: true });
    if (onChange) onChange("dynamicFields" as any, items as any);
  };

  return (
    <div className="space-y-6">

      <div className="w-full flex justify-center">
        {/* <Label htmlFor="logoImageUrl">Logo</Label> */}
        <Controller
          name="logoImageUrl"
          control={control}
          render={({ field }) => (
            <LogoSelector
              value={field.value || ""}
              onChange={(url) => {
                field.onChange(url);
                if (onLogoFileChange) onLogoFileChange(null);
                if (onChange) onChange("logoImageUrl" as any, url as any);
              }}
            />
          )}
        />
      </div>

      {/* Row: title + advt */}
      <div className="flex gap-4 items-center">
        <div className="w-full">
          <Label htmlFor="title">Job Title</Label>
          <Controller name="title" control={control} render={({ field }) => (
            <Input id="title" {...field} className="mt-1" />
          )}
          />
          {fieldError("title") && <p className="text-red-500 text-sm mt-1">{String(fieldError("title"))}</p>}
        </div>

        <div className="w-full">
          <Label htmlFor="advtNumber">Advertisement Number</Label>
          <Controller
            name="advtNumber"
            control={control}
            render={({ field }) => <Input id="advtNumber" {...field} className="mt-1" />}
          />
          {fieldError("advtNumber") && <p className="text-red-500 text-sm mt-1">{String(fieldError("advtNumber"))}</p>}
        </div>
      </div>

      {/* Description (Lexical) */}
      <div>
        <Label htmlFor="descriptionJson">Description</Label>

        <Controller
          name="descriptionJson"
          control={control}
          defaultValue={{ json: null, html: "" }}
          render={({ field }) => (
            <div className="overflow-x-hidden" key={`desc-${field.name}`}>
              
              <RichTextEditor
                id="descriptionJson"
                namespace="description-editor"
                value={field.value ?? { json: null, html: "" }}
                onChange={(data) => {
                  const val = { json: data.json, html: data.html };
                  field.onChange(val);
                  setValue("descriptionHtml", val.html, { shouldDirty: true });
                }}
              />
            </div>
          )}
        />

        <Controller
          name="descriptionHtml"
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
      </div>


      {/* Organization + Logo + Sector + Location */}
      <div className="flex gap-4">
        <div className="w-full">
          <SelectOrTypeInput name="organization" control={control} label="Organization" options={organizations} />
        </div>

        <div className="w-full">
          <Label htmlFor="sector">Sector</Label>
          <Controller name="sector" control={control} render={({ field }) => <Input id="sector" {...field} className="mt-1" />} />
        </div>

        <div className="w-full">
          <Label htmlFor="locationText">Location Text</Label>
          <Controller name="locationText" control={control} render={({ field }) => <Input id="locationText" {...field} className="mt-1" />} />
        </div>
      </div>

      {/* Category / Job Type / States */}
      <div className="flex gap-4">
        <div className="w-full">
          <Label>Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value && (field.value as any).id ? String((field.value as any).id) : ""} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {fieldError("category") && <p className="text-red-500 text-sm mt-1">{String(fieldError("category"))}</p>}
        </div>

        <div className="w-full">
          <Label>Job Type</Label>
          <Controller
            name="jobType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(val) => { field.onChange(val); if (onChange) onChange("jobType" as any, val as any); }} value={field.value || ""}>
                <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select job type" /></SelectTrigger>
                <SelectContent>
                  {jobTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {fieldError("jobType") && <p className="text-red-500 text-sm mt-1">{String(fieldError("jobType"))}</p>}
        </div>

        <div className="w-full">
          <Label>States</Label>
          <Controller
            name="states"
            control={control}
            render={({ field }) => {
              const selectedIds = Array.isArray(field.value) ? field.value.map((s: any) => String(s.id ?? s)) : [];
              return (
                <MultiSelect
                  options={computedStatesOptions}
                  selected={selectedIds}
                  onSelect={(ids) => handleStatesSelect(ids)}
                  placeholder="Select states"
                  className="mt-1"
                />
              );
            }}
          />
          {fieldError("states") && <p className="text-red-500 text-sm mt-1">{String(fieldError("states"))}</p>}
        </div>
      </div>

      {/* Website / Notification / Apply */}
      <div className="flex gap-4">
        <div className="w-full">
          <Label htmlFor="officialWebsite">Official Website</Label>
          <Controller name="officialWebsite" control={control} render={({ field }) => <Input id="officialWebsite" {...field} type="url" placeholder="https://example.com" className="mt-1" />} />
          {fieldError("officialWebsite") && <p className="text-red-500 text-sm mt-1">{String(fieldError("officialWebsite"))}</p>}
        </div>

        <div className="w-full">
          <Label htmlFor="notificationPdf">Notification PDF</Label>
          <Controller name="notificationPdf" control={control} render={({ field }) => <Input id="notificationPdf" {...field} type="url" placeholder="https://example.com/notification.pdf" className="mt-1" />} />
        </div>

        <div className="w-full">
          <Label htmlFor="applyLink">Apply Link</Label>
          <Controller name="applyLink" control={control} render={({ field }) => <Input id="applyLink" {...field} type="url" placeholder="https://example.com/apply" className="mt-1" />} />
        </div>
      </div>

      {/* Qualification / Applicants / Salary */}
      <div className="flex gap-4">
        <div className="w-full">
          <Label htmlFor="qualification">Qualification</Label>
          <Controller name="qualification" control={control} render={({ field }) => <Input id="qualification" {...field} className="mt-1" />} />
        </div>

        <div className="w-full">
          <Label>Estimated Salary Range</Label>
          <Controller name="estimatedSalaryRange" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} />
        </div>

        <div className="w-full">
          <Label>Job Level</Label>
          <Controller name="jobLevel" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} />
        </div>

        {/* <div className="w-full">
          <Label htmlFor="salary">Salary (comma-separated)</Label>
          <Controller name="salary" control={control} render={({ field }) => <Input id="salary" {...field} className="mt-1" placeholder="₹ 25000, ₹ 35000" />} />
        </div> */}
      </div>

      {/* Tags / Tag colors / Logo text / bgColor */}
      <div className="flex gap-4">
        <div className="w-full">
          <FormTagInput name="tags" control={control} label="Tags" placeholder="Type tag and press Enter" />
        </div>

        <div className="w-full">
          <FormVideoLinksInput name="helpfullVideoLinks" control={control} label="Helpful Video Links" />

        </div>

        {/* <div className="w-full">
          <Label>Tag Colors</Label>
          <Controller name="tagColors" control={control} render={({ field }) => <Input {...field} className="mt-1" placeholder="e.g., bg-blue-500, bg-green-500" />} />
        </div> */}

        <div className="w-full">
          <Label>Logo (text)</Label>
          <Controller name="logo" control={control} render={({ field }) => <Input {...field} className="mt-1" placeholder="e.g., SBI" />} />
        </div>

        <div className="w-full">
          <FormColorPicker name="bgColor" control={control} label="Logo BG Color" />
        </div>

        <div className="w-full">
          <Label>Total Vacancies</Label>
          <Controller name="totalVacancies" control={control} render={({ field }) => <Input {...field} className="mt-1" placeholder="enter total vacancies e.g, 5000" />} />
        </div>
      </div>

      {/* Structured JSONB fields */}
      <div className="flex flex-wrap gap-4">
        <Controller control={control} name="importantDates" render={({ field }) => (
          <JsonFieldDialog title="Important Dates" value={field.value || []} onChange={(v) => field.onChange(v)} errors={fieldError("importantDates")} />
        )} />
        <Controller control={control} name="vacancyDetails" render={({ field }) => (
          <JsonFieldDialog title="Vacancy Details" value={field.value || []} onChange={(v) => field.onChange(v)} errors={fieldError("vacancyDetails")} />
        )} />
        <Controller control={control} name="eligibility" render={({ field }) => (
          <JsonFieldDialog title="Eligibility" value={field.value || []} onChange={(v) => field.onChange(v)} errors={fieldError("eligibility")} />
        )} />
        <Controller control={control} name="applicationFee" render={({ field }) => (
          <JsonFieldDialog title="Application Fee" value={field.value || []} onChange={(v) => field.onChange(v)} errors={fieldError("applicationFee")} />
        )} />
        <Controller control={control} name="contactDetails" render={({ field }) => (
          <JsonFieldDialog title="Contact Details" value={field.value || []} onChange={(v) => field.onChange(v)} errors={fieldError("contactDetails")} />
        )} />
        <Controller control={control} name="examPattern" render={({ field }) => (
          <JsonFieldDialog title="Exam Pattern" value={field.value || []} onChange={(v) => field.onChange(v)} errors={fieldError("examPattern")} />
        )} />
        <Controller control={control} name="importantLinks" render={({ field }) => (
          <JsonFieldDialog title="Important Links" value={field.value || []} onChange={(v) => field.onChange(v)} errors={fieldError("importantLinks")} />
        )} />
      </div>

      {/* Dates + expired flag */}
      <div className="flex gap-4">
        <div className="w-full">
          <Label>Expiry Date</Label>
          <Controller control={control} name="expiryDate" render={({ field }) => (
            <DateTimePicker value={field.value ? new Date(field.value) : null} onChange={(d) => field.onChange(d)} />
          )}
          />
          {fieldError("expiryDate") && (<p className="text-red-500 text-sm mt-1">{String(fieldError("expiryDate"))}</p>)}
        </div>

        <div className="w-full">
          <Label>Auto Publish At</Label>
          <Controller control={control} name="autoPublishAt" render={({ field }) => (
            <DateTimePicker value={field.value ? new Date(field.value) : null} onChange={(d) => field.onChange(d)} />
          )} />
        </div>

        <div className="w-full flex items-center gap-3">
          <Controller control={control} name="isExpired" render={({ field }) => <Checkbox id="isExpired" checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />} />
          <Label htmlFor="isExpired">Is Expired</Label>
        </div>

        {/* Flags */}
        <div className="w-full flex items-center gap-3">
          <Controller control={control} name="isNew" render={({ field }) => <Checkbox id="isNew" checked={!!field.value} onCheckedChange={(c) => field.onChange(!!c)} />} />
          <Label htmlFor="isNew">Mark as New Job</Label>
        </div>
      </div>

      <div className="flex flex-row gap-4 w-full">
        <div className="w-full">
          <Label>Review Status</Label>
          <Controller name="reviewStatus" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} />
        </div>

        <div className="w-full">
          {/* <Label>Related Jobs</Label>
          <Controller name="relatedJobs" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} /> */}
          <FormMultiSelectIds name="relatedJobs" control={control} label="Related Jobs"
            options={jobs.map(j => ({ label: j.title, value: j.id }))} MultiSelectComponent={MultiSelect} />
        </div>

        <div className="w-full">
          {/* <Label>Related Notifications</Label>
          <Controller name="relatedNotifications" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} /> */}
          <FormMultiSelectIds name="relatedNotifications" control={control} label="News & Notifications"
            options={relatedNotifications.map(n => ({ label: n.title, value: n.id }))} MultiSelectComponent={MultiSelect} />
        </div>
      </div>

      <div className="flex flex-row gap-4 w-full">
        <div className="w-full">
          <Label>Source Name</Label>
          <Controller name="sourceName" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} />
        </div>

        <div className="w-full">
          <Label>External Source Link</Label>
          <Controller name="externalSourceLink" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} />
        </div>

        <div className="w-full">
          <Label>Application Mode</Label>
          <Controller name="applicationMode" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} />
        </div>
      </div>

      <Controller name="importantLinks" control={control} defaultValue={[]} render={({ field }) => (
        <DynamicLinksEditor value={field.value || []} onChange={field.onChange} />
      )} />

      {/* Dynamic Fields (non-RHF component bridged via Controller) */}
      <div>
        <DynamicFieldsSection />
      </div>

      <SEOFields control={control} watch={watch} />

      <div>
        <Label>Last Updated By</Label>
        <Controller name="lastUpdatedBy" control={control} render={({ field }) => <Input {...field} className="mt-1 w-full" />} />
      </div>
{/* 
      <div>
        <Label>Notes</Label>
        <Controller name="notes" control={control} render={({ field }) => <Textarea {...field} className="mt-1 w-full" rows={2} />} />
      </div> */}

      {/* Save button is intentionally left to parent form; keep only a UI button for convenience */}
      {/* <div className="flex justify-end gap-2">
        <Button type="button" onClick={() => {
          // optional: you can trigger a validation run here via form context if needed:
          // (form context not directly exposed here) — leave submit to parent.
        }} className="px-4">Save</Button>
      </div> */}
    </div>
  );
};

export default FullJobFieldsSection;
