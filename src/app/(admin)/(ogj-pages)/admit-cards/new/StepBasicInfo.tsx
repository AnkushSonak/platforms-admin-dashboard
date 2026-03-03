import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, } from "@/components/shadcn/ui/form"
import { Input } from "@/components/shadcn/ui/input"
import { FormSelect } from "../../jobs/sections/FormSelect";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { FormSelectId } from "../../jobs/sections/FormSelectId";
import { ICategory } from "@/app/helper/interfaces/ICategory";
import { IState } from "@/app/helper/interfaces/IState";
import { FormMultiSelectIds } from "../../jobs/sections/FormMultiSelectIds";
import { MultiSelect } from "@/components/shadcn/ui/multi-select";
import { IOrganization } from "@/app/helper/interfaces/IOrganization";
import { IJob } from "@/app/helper/interfaces/IJob";
import { AdmitCardStatus } from "@/app/helper/interfaces/IAdmitCard";
import { IResult } from "@/app/helper/interfaces/IResult";
import { IAnswerKey } from "@/app/helper/interfaces/IAnswerKey";
import { IQualification } from "@/app/helper/interfaces/IQualification";
import { INewsAndNtfn } from "@/app/helper/interfaces/INewsAndNtfn";
import { DateTimePicker } from "@/components/shadcn/ui/date-time-picker";
import { ExamShiftsField } from "@/components/form/ExamShiftsField";
import { AdmitCardFormValues } from "@/lib/schemas/AdmitCardSchema";


export function StepBasicInfo({ onJobChange, jobs, organizations, categories, allStates, allNewsAndNotifications, allQualifications }
  : { onJobChange: (jobId: string | null) => void; jobs: IJob[]; organizations: IOrganization[]; categories: ICategory[]; allStates: IState[]; 
    allNewsAndNotifications: INewsAndNtfn[]; allQualifications: IQualification[]; }) {
  const { control, setValue } = useFormContext<AdmitCardFormValues>();

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job select for autofill */}
        <FormField name="jobId" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Related Job (auto-fill)</FormLabel>
            <FormControl>
              <select
                name={field.name}
                ref={field.ref}
                value={field.value ?? ""}
                onBlur={field.onBlur}
                disabled={field.disabled}
                className="w-full border rounded p-2"
                onChange={(e) => {
                  const jobId = e.target.value || null;
                  onJobChange(jobId);
                }}

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
        <FormField name="releaseDate" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Release Date</FormLabel>
            <FormControl><DateTimePicker value={field.value && (typeof field.value === "string" || typeof field.value === "number" || field.value instanceof Date)
              ? new Date(field.value) : null} onChange={field.onChange} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="examStartDate" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Exam Start Date</FormLabel>
            <FormControl><DateTimePicker value={
              field.value && (typeof field.value === "string" || typeof field.value === "number" || field.value instanceof Date) ? new Date(field.value)
                : null} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="examEndDate" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Exam End Date</FormLabel>
            <FormControl><DateTimePicker value={field.value && (typeof field.value === "string" || typeof field.value === "number" || field.value instanceof Date)
              ? new Date(field.value) : null} onChange={field.onChange} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField name="modeOfExam" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Mode of Exam</FormLabel>
            <FormControl><Input  {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField name="examLocation" control={control} render={({ field }) => (
          <FormItem>
            <FormLabel>Exam Location</FormLabel>
            <FormControl><Input  {...field} value={field.value ?? ""} /></FormControl>
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
              <Input type="number" value={field.value} onChange={(e) =>
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

