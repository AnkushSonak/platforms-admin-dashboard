import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, } from "@/components/shadcn/ui/form"
import { Input } from "@/components/shadcn/ui/input"
import { NewsAndNntfnStatusType } from "@/app/helper/constants/NewsAndNntfnStatusType"
import { FormSelect } from "../../jobs/sections/FormSelect";
import { NewsAndNtfnPriorityType } from "@/app/helper/constants/NewsAndNtfnPriorityType";
import { NewsAndNtfnRelatedEntityType } from "@/app/helper/constants/NewsAndNtfnRelatedEntityType";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { FormSelectId } from "../../jobs/sections/FormSelectId";
import React, { useEffect } from "react";
import { Category } from "@/app/helper/interfaces/Category";
import { State } from "@/app/helper/interfaces/State";
import { FormMultiSelectIds } from "../../jobs/sections/FormMultiSelectIds";
import { MultiSelect } from "@/components/shadcn/ui/multi-select";
import { Organization } from "@/app/helper/interfaces/Organization";
// import { getOrganizations } from "@/app/lib/api/Organizations";
import { Job } from "@/app/helper/interfaces/Job";
import { AdmitCard } from "@/app/helper/interfaces/AdmitCard";
import { Result } from "@/app/helper/interfaces/Result";
import { AnswerKey } from "@/app/helper/interfaces/AnswerKey";
// import { getResults } from "@/app/lib/api/Results";
// import { getAnswerKeys } from "@/app/lib/api/AnswerKeys";
// import { getAdmitCards } from "@/app/lib/api/AdmitCards";
import { getPaginatedEntity } from "@/lib/api/global/Generic";
import { ADMIT_CARDS_API, ANSWER_KEYS_API, CATEGORY_API, JOBS_API, RESULTS_API, STATE_API } from "@/app/envConfig";

export function StepBasicInfo() {

  const { control } = useFormContext();

  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [allStates, setAllStates] = React.useState<State[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [admitCards, setAdmitCards] = React.useState<AdmitCard[]>([]);
  const [results, setResults] = React.useState<Result[]>([]);
  const [answerKeys, setAnswerKeys] = React.useState<AnswerKey[]>([]);

  useEffect(() => { getPaginatedEntity<Organization>("type=organizations&page=1", ANSWER_KEYS_API,  { entityName: "organizations" }).then(res => setOrganizations(res.data)).catch(() => setOrganizations([])); }, []);
  useEffect(() => { getPaginatedEntity<Category>("type=categories&page=1", CATEGORY_API, { entityName: "categories" }).then((res) => setCategories(res.data)).catch(() => setCategories([])); }, []);
  useEffect(() => { getPaginatedEntity<State>("type=states&page=1", STATE_API, { entityName: "states" }).then((res) => setAllStates(res.data)).catch(() => setAllStates([])); }, []);
  useEffect(() => { getPaginatedEntity<Job>("type=jobs&page=1", JOBS_API,  { entityName: "jobs" }).then((response) => setJobs(response.data)).catch(() => setJobs([])); }, []);
  useEffect(() => { getPaginatedEntity<AdmitCard>("type=admitCards&page=1", ADMIT_CARDS_API,  { entityName: "admitCards" }).then((response) => setAdmitCards(response.data)).catch(() => setAdmitCards([])); }, []);
  useEffect(() => { getPaginatedEntity<Result>("type=results&page=1", RESULTS_API,  { entityName: "results" }).then((response) => setResults(response.data)).catch(() => setResults([])); }, []);
  useEffect(() => { getPaginatedEntity<AnswerKey>("type=answer-keys&page=1", ANSWER_KEYS_API,  { entityName: "answerKeys" }).then((response) => setAnswerKeys(response.data)).catch(() => setAnswerKeys([])); }, []);

  const newsAndNtfnStatusOptions = [
    { value: NewsAndNntfnStatusType.PENDING, label: 'Pending' },
    { value: NewsAndNntfnStatusType.PUBLISHED, label: 'Published' },
    { value: NewsAndNntfnStatusType.UPDATED, label: 'Updated' },
    { value: NewsAndNntfnStatusType.RETRACTED, label: 'Retracted' },
    { value: NewsAndNntfnStatusType.EXPIRED, label: 'Expired' },
  ];

  const newsAndNtfnPriorityOptions = [
    { value: NewsAndNtfnPriorityType.HIGH, label: 'High' },
    { value: NewsAndNtfnPriorityType.MEDIUM, label: 'Medium' },
    { value: NewsAndNtfnPriorityType.LOW, label: 'Low' },
  ];

  const newsAndNtfnRelatedEntityOptions = [
    { value: NewsAndNtfnRelatedEntityType.JOB_POSTING, label: 'Job' },
    { value: NewsAndNtfnRelatedEntityType.ADMIT_CARD, label: 'Admit Card' },
    { value: NewsAndNtfnRelatedEntityType.RESULT, label: 'Result' },
    { value: NewsAndNtfnRelatedEntityType.ANSWER_KEY, label: 'Answer Key' },
    { value: NewsAndNtfnRelatedEntityType.EXAM_NOTIFICATION, label: 'Exam Notification' },
    { value: NewsAndNtfnRelatedEntityType.NOTICE, label: 'Notice' },
    { value: NewsAndNtfnRelatedEntityType.UPDATE, label: 'Update' },
  ];


  return (
    <div className="grid grid-cols-2 gap-6">
      <FormField name="title" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="shortTitle" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Short Title</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="officialOrderNumber" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Official Order Number</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="version" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Version</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="status" control={control} render={({ field }) => (
        <FormItem>
          {/* <FormLabel>Status</FormLabel> */}
          <FormSelect {...field} name="status" control={control} label="Select Status" placeholder="Select Status" options={newsAndNtfnStatusOptions} />
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="priority" control={control} render={({ field }) => (
        <FormItem>
          <FormSelect {...field} name="priority" control={control} label="Select Priority" placeholder="Select Priority" options={newsAndNtfnPriorityOptions} />
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="relatedEntityType" control={control} render={({ field }) => (
        <FormItem>
          <FormSelect {...field} name="relatedEntityType" control={control} label="Select Related Entity Type" placeholder="Select Related Entity Type" options={newsAndNtfnRelatedEntityOptions} />
          <FormMessage />
        </FormItem>
      )} />
      {/* 
      <FormField name="language" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Language</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="translations" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Translations</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} /> */}

      <FormField name="officialLink" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Official Link</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="downloadLink" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Download Link</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      {/* <FormField name="sourceLinks" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Source Links</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} /> */}

      <FormField name="organizationId" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormSelectId {...field} name="organizationId" control={control} label="Select Organization" placeholder="Select organization"
              options={organizations.map((o) => ({ id: o.id, label: o.fullName, }))} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="categoryId" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormSelectId {...field} name="categoryId" control={control} label="Select Category" placeholder="Select category"
              options={categories.map((c) => ({ id: String(c.id), label: c.categoryName, }))} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="stateIds" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormMultiSelectIds {...field} name="stateIds" control={control} label="Select States" placeholder="Select states" options={allStates.map((s) => ({
              label: s.stateName, value: String(s.id),
            }))} MultiSelectComponent={MultiSelect} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="relatedJobIds" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormMultiSelectIds {...field} name="relatedJobIds" control={control} label="Related Jobs"
              options={jobs.map(j => ({ label: j.title, value: j.id }))} MultiSelectComponent={MultiSelect} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="relatedAdmitCardIds" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormMultiSelectIds {...field} name="relatedAdmitCardIds" control={control} label="Related Admit Cards"
              options={admitCards.map(a => ({ label: a.admitCardTitle, value: a.id }))} MultiSelectComponent={MultiSelect} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="relatedResultIds" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormMultiSelectIds {...field} name="relatedResultIds" control={control} label="Related Results"
              options={results.map(r => ({ label: r.resultTitle, value: r.id }))} MultiSelectComponent={MultiSelect} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="relatedAnswerKeyIds" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormMultiSelectIds {...field} name="relatedAnswerKeyIds" control={control} label="Related Answer Keys"
              options={answerKeys.map(a => ({ label: a.answerKeyTitle, value: a.id }))} MultiSelectComponent={MultiSelect} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="minAge" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Min Age</FormLabel>
          <FormControl>
            <Input type="number" value={field.value ?? ""} onChange={(e) =>
              field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
            }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
      />

      <FormField name="maxAge" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Max Age</FormLabel>
          <FormControl>
            <Input type="number" value={field.value ?? ""} onChange={(e) =>
              field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
            }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
      />

      <FormField name="qualifications" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Qualifications</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="isFeatured" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Is Featured</FormLabel>
          <FormControl>
            <Checkbox style={{ marginLeft: '10px' }}
              id={`form-news-and-ntfn-checkbox-${field.name}`}
              checked={!!field.value}
              onCheckedChange={(checked) =>
                field.onChange(checked === true)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
      />

      <FormField name="isVerified" control={control} render={({ field }) => (
        <FormItem>
          <FormLabel>Is Verified</FormLabel>
          <FormControl>
            <Checkbox style={{ marginLeft: '10px' }}
              id={`form-news-and-ntfn-checkbox-${field.name}`}
              checked={!!field.value}
              onCheckedChange={(checked) =>
                field.onChange(checked === true)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
      />

    </div>
  )
}

