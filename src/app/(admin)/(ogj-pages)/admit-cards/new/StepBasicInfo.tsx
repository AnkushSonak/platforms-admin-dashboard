import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, } from "@/components/shadcn/ui/form"
import { Input } from "@/components/shadcn/ui/input"
import { NewsAndNntfnStatusType } from "@/app/helper/constants/NewsAndNntfnStatusType"
import { FormSelect } from "../../jobs/sections/FormSelect";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { FormSelectId } from "../../jobs/sections/FormSelectId";
import React, { useEffect } from "react";
import { ICategory } from "@/app/helper/interfaces/ICategory";
import { IState } from "@/app/helper/interfaces/IState";
import { FormMultiSelectIds } from "../../jobs/sections/FormMultiSelectIds";
import { MultiSelect } from "@/components/shadcn/ui/multi-select";
import { IOrganization } from "@/app/helper/interfaces/IOrganization";
import { IJob } from "@/app/helper/interfaces/IJob";
import { AdmitCardStatus, IAdmitCard } from "@/app/helper/interfaces/IAdmitCard";
import { IResult } from "@/app/helper/interfaces/IResult";
import { IAnswerKey } from "@/app/helper/interfaces/IAnswerKey";
import { getPaginatedEntity } from "@/lib/api/global/Generic";
import { ADMIT_CARDS_API, ANSWER_KEYS_API, CATEGORY_API, NEWS_AND_NTFN_API, ORGANIZATION_API, QUALIFICATIONS_API, RESULTS_API, STATE_API } from "@/app/envConfig";
import { IQualification } from "@/app/helper/interfaces/IQualification";
import { INewsAndNtfn } from "@/app/helper/interfaces/INewsAndNtfn";
import { DateTimePicker } from "@/components/shadcn/ui/date-time-picker";
import { ExamShiftsField } from "@/components/form/ExamShiftsField";


export function StepBasicInfo({ handleJobSelect, jobs }: { handleJobSelect: (jobId: string) => void; jobs: IJob[] }) {
  const { control, setValue, watch } = useFormContext();

  const [organizations, setOrganizations] = React.useState<IOrganization[]>([]);
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [allStates, setAllStates] = React.useState<IState[]>([]);
  const [allNewsAndNotifications, setAllNewsAndNotifications] = React.useState<INewsAndNtfn[]>([]);
  const [allQualifications, setAllQualifications] = React.useState<any[]>([]);
  // const [jobs, setJobs] = React.useState<IJob[]>([]);
  // const [admitCards, setAdmitCards] = React.useState<IAdmitCard[]>([]);
  const [results, setResults] = React.useState<IResult[]>([]);
  const [answerKeys, setAnswerKeys] = React.useState<IAnswerKey[]>([]);
  const selectedJobId = watch('jobId');

  React.useEffect(() => {
    if (!selectedJobId) return;
    const selectedJob = jobs.find(j => j.id === selectedJobId);
    if (!selectedJob) return;
      setValue('jobSnapshot', {
        advtNumber: selectedJob.advtNumber,
        sector: selectedJob.sector,
        totalVacancies: selectedJob.totalVacancies,
        jobType: selectedJob.jobType,
        ageLimitText: selectedJob.ageLimitText,
        applicationFee: selectedJob.applicationFee,
        minAge: selectedJob.minAge,
        maxAge: selectedJob.maxAge,
      }, { shouldDirty: true });
      setValue('jobId', selectedJob.id, { shouldDirty: true });

      // Autofill individual fields
      setValue('advtNumber', selectedJob.advtNumber ?? '', { shouldDirty: true });
      setValue('sector', selectedJob.sector ?? '', { shouldDirty: true });
      setValue('totalVacancies', selectedJob.totalVacancies ?? '', { shouldDirty: true });
      setValue('jobType', selectedJob.jobType ?? '', { shouldDirty: true });
      setValue('ageLimitText', selectedJob.ageLimitText ?? '', { shouldDirty: true });
      setValue('applicationFee', selectedJob.applicationFee ?? '', { shouldDirty: true });
      setValue('minAge', selectedJob.minAge ?? '', { shouldDirty: true });
      setValue('maxAge', selectedJob.maxAge ?? '', { shouldDirty: true });
  }, [selectedJobId, jobs, setValue]);

  useEffect(() => { getPaginatedEntity<IOrganization>("type=organizations&page=1", ORGANIZATION_API, { entityName: "organizations" }).then(res => setOrganizations(res.data)).catch(() => setOrganizations([])); }, []);
  useEffect(() => { getPaginatedEntity<ICategory>("type=categories&page=1", CATEGORY_API, { entityName: "categories" }).then((res) => setCategories(res.data)).catch(() => setCategories([])); }, []);
  useEffect(() => { getPaginatedEntity<IState>("type=states&page=1", STATE_API, { entityName: "states" }).then((res) => setAllStates(res.data)).catch(() => setAllStates([])); }, []);
  useEffect(() => { getPaginatedEntity<INewsAndNtfn>("type=news-and-notifications&page=1", NEWS_AND_NTFN_API, { entityName: "newsAndNotifications" }).then((res) => setAllNewsAndNotifications(res.data)).catch(() => setAllNewsAndNotifications([])); }, []);
  useEffect(() => { getPaginatedEntity<IResult>("type=results&page=1", RESULTS_API, { entityName: "results" }).then((response) => setResults(response.data)).catch(() => setResults([])); }, []);
  useEffect(() => { getPaginatedEntity<IAnswerKey>("type=answer-keys&page=1", ANSWER_KEYS_API, { entityName: "answerKeys" }).then((response) => setAnswerKeys(response.data)).catch(() => setAnswerKeys([])); }, []);
  useEffect(() => { getPaginatedEntity<IQualification>("type=qualifications&page=1", QUALIFICATIONS_API, { entityName: "qualifications" }).then((response) => setAllQualifications(response.data)).catch(() => setAllQualifications([])); }, []);

  const admitCardStatusOptions = [
    { value: AdmitCardStatus.ACTIVE, label: 'Active' },
    { value: AdmitCardStatus.POSTPONED, label: 'Postponed' },
    { value: AdmitCardStatus.LINK_INACTIVE, label: 'Link Inactive' },
    { value: AdmitCardStatus.RELEASED, label: 'Released' },
    { value: AdmitCardStatus.UPCOMING, label: 'Upcoming' },
    { value: AdmitCardStatus.CLOSED, label: 'Closed' },
    { value: AdmitCardStatus.DELETED, label: 'Deleted' },
    { value: AdmitCardStatus.DRAFT, label: 'Draft' },
    { value: AdmitCardStatus.ARCHIVED, label: 'Archived' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-6">
        {/* Job select for autofill */}
        <FormField name="jobId" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Related Job (auto-fill)</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded p-2"
              >
                <option value="">Select a job to auto-fill</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="title" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="examName" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Exam Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="status" control={control} render={({ field }) => (
          <FormItem>
            {/* <FormLabel>Status</FormLabel> */}
            <FormSelect {...field} name="status" control={control} label="Select Status" placeholder="Select Status" options={admitCardStatusOptions} />
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="organizationId" control={control} render={({ field }) => (
          <FormItem>
            <FormControl>
              <FormSelectId {...field} name="organizationId" control={control} label="Select Organization" placeholder="Select organization"
                options={organizations.map((o) => ({ id: String(o.id), label: o.fullName, }))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="categoryId" control={control} render={({ field }) => (
          <FormItem>
            <FormControl>
              <FormSelectId {...field} name="categoryId" control={control} label="Select Category" placeholder="Select category"
                options={categories.map((c) => ({ id: String(c.id), label: c.name, }))} />
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

        <FormField name="newsAndNotificationIds" control={control} render={({ field }) => (
          <FormItem>
            <FormControl>
              <FormMultiSelectIds {...field} name="newsAndNotificationIds" control={control} label="Select News & Notifications" placeholder="Select news and notifications" options={allNewsAndNotifications.map((n) => ({
                label: n.title, value: String(n.id),
              }))} MultiSelectComponent={MultiSelect} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="grid grid-cols-3 gap-6 my-6">
        <FormField name="releaseDate" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Release Date</FormLabel>
            <FormControl><DateTimePicker value={field.value ? new Date(field.value) : null} onChange={field.onChange} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="examStartDate" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Exam Start Date</FormLabel>
            <FormControl><DateTimePicker value={field.value ? new Date(field.value) : null} onChange={field.onChange} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="examEndDate" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Exam End Date</FormLabel>
            <FormControl><DateTimePicker value={field.value ? new Date(field.value) : null} onChange={field.onChange} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField name="modeOfExam" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Mode of Exam</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="examLocation" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Exam Location</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="jobSnapshot.advtNumber" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Advt Number</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="jobSnapshot.sector" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Sector</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="jobSnapshot.totalVacancies" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Total Vacancies</FormLabel>
            <FormControl><Input type="number" value={field.value ?? ""} onChange={(e) =>
                field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
              }
              /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* <FormField name="downloadLink" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Download Link</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />  */}

        <FormField name="relatedJobIds" control={control} render={({ field }) => (
          <FormItem>
            <FormControl>
              <FormMultiSelectIds {...field} name="relatedJobIds" control={control} label="Related Jobs"
                options={jobs.map(j => ({ label: j.title, value: j.id }))} MultiSelectComponent={MultiSelect} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* <FormField name="relatedResultIds" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormMultiSelectIds {...field} name="relatedResultIds" control={control} label="Related Results"
              options={results.map(r => ({ label: r.title, value: r.id }))} MultiSelectComponent={MultiSelect} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField name="relatedAnswerKeyIds" control={control} render={({ field }) => (
        <FormItem>
          <FormControl>
            <FormMultiSelectIds {...field} name="relatedAnswerKeyIds" control={control} label="Related Answer Keys"
              options={answerKeys.map(a => ({ label: a.title, value: a.id }))} MultiSelectComponent={MultiSelect} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} /> */}

        <FormField name="jobSnapshot.minAge" control={control} render={({ field }) => (
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

        <FormField name="jobSnapshot.maxAge" control={control} render={({ field }) => (
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

        <FormField name="jobSnapshot.qualificationSummary" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Qualification Summary</FormLabel>
            <FormControl>
              <Input type="text" value={field.value ?? ""} onChange={(e) =>
                field.onChange(e.target.value === "" ? undefined : e.target.value)
              }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />

        {/* //should be mapped with job qualifications for auto-fill, but allowing manual entry as well for flexibility
        <FormField name="qualificationIds" control={control} render={({ field }) => (
          <FormItem>
            <FormControl>
              <FormMultiSelectIds {...field} name="qualificationIds" control={control} label="Select Qualifications" placeholder="Select qualifications" options={allQualifications.map((s) => ({
                label: s.qualificationName, value: String(s.id),
              }))} MultiSelectComponent={MultiSelect} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} /> */}

        <FormField name="isFeatured" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Is Featured</FormLabel>
            <FormControl>
              <Checkbox style={{ marginLeft: '10px' }}
                id={`form-admit-card-checkbox-${field.name}`}
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

        {/* Modern dynamic exam shifts field */}
        <FormField name="examShifts" control={control} render={() => (
          <FormItem>
            <FormControl>
              <ExamShiftsField name="examShifts" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

      </div>
    </div>
  )
}

