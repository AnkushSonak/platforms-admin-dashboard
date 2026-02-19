// Edit Answer Key Page

// Clean, modern react-hook-form-based Edit Answer Key Page
"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { getAnswerKeyBySlugForForms, updateAnswerKey } from '@/app/lib/api/AnswerKeys';
import { Input } from '@/components/shadcn/ui/input';
import RichTextEditor from '@/components/form/existing/RichTextEditor';
import { ApplicationMode, Job } from '@/app/helper/interfaces/Job';
import { Category } from '@/app/helper/interfaces/Category';
import { State } from '@/app/helper/interfaces/State';
import { JsonFieldDialog } from '@/components/form/existing/JsonFieldDialog';
import DynamicFieldsSection from '../../../jobs/sections/DynamicFieldsSection';
import { MultiSelect } from '@/components/shadcn/ui/multi-select';
import LogoSelector from '@/components/form/existing/LogoSelector';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { organizations } from '@/app/helper/constants/Organizations';
import { INewsAndNtfn } from '@/app/helper/interfaces/INewsAndNtfn';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import { SelectOrTypeInput } from '../../../jobs/sections/SelectOrTypeInput';
import { FormSelect } from '../../../jobs/sections/FormSelect';
import { FormMultiSelectIds } from '../../../jobs/sections/FormMultiSelectIds';
import { FormSelectId } from '../../../jobs/sections/FormSelectId';
import { FormColorPicker } from '../../../jobs/sections/FormColorPicker';
import { FormTagInput } from '../../../jobs/sections/FormTagInput';
import { FormVideoLinksInput } from '../../../jobs/sections/FormVideoLinksInput';
import { SEOFields } from '../../../jobs/sections/SEOFields';
import { AnswerKeyFormInterface } from '../../../form-interfaces/AnswerKeyFormInterface';
import { AnswerKeyStatus } from '@/app/helper/interfaces/AnswerKey';
import { DateTimePicker } from '@/components/shadcn/ui/date-time-picker';
import { DynamicLinksEditor } from '../../../jobs/sections/DynamicLinksEditor';
import { CATEGORY_API, JOBS_API, STATE_API } from '@/app/envConfig';
import { getPaginatedEntity } from '@/lib/api/global/Generic';

const JOB_TO_ANSWERKEY_MAP: Record<string, keyof AnswerKeyFormInterface> = {
  advtNumber: 'answerKeyAdvtNumber',
  organization: 'answerKeyOrganization',

  // object → id
  categoryId: 'categoryId',

  sector: 'sector',

  // object[] → ids[]
  stateIds: 'stateIds',

  locationText: 'locationText',
  qualification: 'qualification',

  logo: 'logo',
  logoImageUrl: 'logoImageUrl',
  bgColor: 'logoBgColor',

  totalVacancies: 'totalVacancies',

  tags: 'tags',
  helpfullVideoLinks: 'helpfullVideoLinks',

  jobType: 'jobType',
  jobLevel: 'jobLevel',

  ageLimitText: 'ageLimitText',
  salary: 'salary',

  importantDates: 'importantDates',
  vacancyDetails: 'vacancyDetails',
  applicationFee: 'applicationFee',
  eligibility: 'eligibility',
  contactDetails: 'contactDetails',
  examPattern: 'examPattern',
  importantLinks: 'importantLinks',

  expiryDate: 'expiryDate',
  isExpired: 'isExpired',

  estimatedSalaryRange: 'estimatedSalaryRange',
  applicationMode: 'applicationMode',

  dynamicFields: 'dynamicFields',

  applyLink: 'applyLink',

  officialWebsite: 'answerKeyOfficialWebsite',
};


export default function EditAnswerKeyPage() {
  const params = useParams();
  const answerKeySlug = params?.slug as string;
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobLoading, setJobLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allStates, setAllStates] = useState<State[]>([]);
  const [newsAndNotifications, setNewsAndNotifications] = useState<INewsAndNtfn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { user } = useSelector((state: RootState) => state.authentication);

  const methods = useForm<AnswerKeyFormInterface>();

  useEffect(() => {
    setFetching(true);

    const normalizeAnswerKeyToForm = (data: AnswerKeyFormInterface): AnswerKeyFormInterface => ({
      ...data,
      // Convert nested objects to IDs
      categoryId: data.categoryId ? String(data.categoryId) : null,
      stateIds: data.stateIds ?? [],

      // Enum conversions
      applicationMode: (data.applicationMode as ApplicationMode) || null,
      answerKeyStatus: (data.answerKeyStatus as AnswerKeyStatus) || null,
      jobLevel: data.jobLevel ? (data.jobLevel as any) : null, // if jobLevel is also enum, cast similarly

      // Convert dates
      answerKeyReleaseDate: data.answerKeyReleaseDate ? new Date(data.answerKeyReleaseDate) : null,
      publishDate: data.publishDate ? new Date(data.publishDate) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      autoPublishAt: data.autoPublishAt ? new Date(data.autoPublishAt) : null,

      // Make sure optional strings are at least empty
      answerKeyDescriptionJson: data.answerKeyDescriptionJson || '',
      answerKeyDescriptionHtml: data.answerKeyDescriptionHtml || '',

      // Ensure arrays are initialized
      tags: data.tags || [],
      helpfullVideoLinks: data.helpfullVideoLinks || [],
      dynamicFields: data.dynamicFields || [],
      importantDates: data.importantDates || [],
      vacancyDetails: data.vacancyDetails || [],
      eligibility: data.eligibility || [],
      applicationFee: data.applicationFee || [],
      contactDetails: data.contactDetails || [],
      examPattern: data.examPattern || [],
      importantLinks: data.importantLinks || [],
      relatedJobs: data.relatedJobs || [],
      newsAndNotifications: data.newsAndNotifications
    });

    getAnswerKeyBySlugForForms(answerKeySlug)
      .then((data) => {
        if (data) {
          const normalized = normalizeAnswerKeyToForm(data);
          methods.reset(normalized);
        }
        setFetching(false);
      })
      .catch(() => {
        setError('Failed to fetch answer key data.');
        setFetching(false);
      });
  }, [answerKeySlug]);


  useEffect(() => {
    const stateIds = methods.getValues("stateIds");

    if (allStates.length && stateIds?.length) {
      methods.setValue("stateIds", [...stateIds], {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [allStates]);

  useEffect(() => {
    setJobLoading(true);
    getPaginatedEntity<Job>("type=jobs&page=1", JOBS_API,  { entityName: "jobs" })
      .then((res) => {
        setJobs(res.data);
        setJobLoading(false);
      })
      .catch(() => setJobLoading(false));
  }, [jobSearch]);

  useEffect(() => {
    getPaginatedEntity<Category>("type=categories&page=1", CATEGORY_API, { entityName: "categories" })
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);
  useEffect(() => {
    getPaginatedEntity<State>("type=states&page=1", STATE_API, { entityName: "states" })
    .then((res) => setAllStates(res.data))
    .catch(() => setAllStates([])); }, []);

  const answerKeyStatusOptions = [
    { value: AnswerKeyStatus.RELEASED, label: 'Released' },
    { value: AnswerKeyStatus.UPCOMING, label: 'Upcoming' },
    { value: AnswerKeyStatus.CLOSED, label: 'Closed' },
  ];

  const applicationModes = [
    { value: ApplicationMode.ONLINE, label: 'Online' },
    { value: ApplicationMode.OFFLINE, label: 'Offline' },
    { value: ApplicationMode.BOTH, label: 'Both' },
  ];

  const onLogoFileChange = (file: File) => {
    setLogoFile(file);
    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) setLogoError("Invalid file type");
      else if (file.size > 1024 * 1024) setLogoError("Max size is 1 MB");
      else setLogoError("");
    } else {
      setLogoError("");
    }
  };

  const handleJobSelect = (jobId: string) => {
    const selectedJob = jobs.find(j => j.id === jobId);
    if (!selectedJob) return;

    // 1️⃣ Simple fields
    Object.entries(JOB_TO_ANSWERKEY_MAP).forEach(([jobKey, answerKey]) => {
      const value = selectedJob[jobKey as keyof Job];
      if (value !== undefined && value !== null) {
        methods.setValue(answerKey, value as any, { shouldDirty: true });
      }
    });

    // 2️⃣ Category → categoryId
    if (selectedJob.category) {
      methods.setValue(
        'categoryId',
        String(selectedJob.category.id),
        { shouldDirty: true }
      );
    }

    // 3️⃣ States → stateIds
    if (selectedJob.states?.length) {
      methods.setValue(
        'stateIds',
        selectedJob.states.map(s => String(s.id)),
        { shouldDirty: true }
      );
    }

    // 4️⃣ jobId only
    methods.setValue('jobId', selectedJob.id);
  };


  const onValidSubmit = async (values: AnswerKeyFormInterface) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await updateAnswerKey(values.id!, values);
      if (res.success) {
        setSuccess('Answer Key updated successfully!');
      } else {
        setError(res.message || 'Failed to update Answer Key');
      }
    } catch (e: any) {
      setError(e.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center items-center h-screen">Loading answer key...</div>;
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/answer-keys" passHref>
            <Button variant="outline" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Answer Key</h1>
        </div>
        <Card className="shadow-md">
          <CardHeader><CardTitle>Edit Answer Key Details</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={methods.handleSubmit(onValidSubmit)}>
              {/* Job Auto-fill Dropdown */}
              <fieldset className="border rounded p-4 mb-4">
                <label className="block text-sm pb-2">Job (auto-fill)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      className="w-full border rounded p-2"
                      value={methods.watch('jobId') || ''}
                      onChange={e => handleJobSelect(e.target.value)}
                    >
                      <option value="">Select a job to auto-fill</option>
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                    </select>
                    <Input
                      className="w-full border rounded p-2 mt-2"
                      placeholder="Search jobs..."
                      value={jobSearch}
                      onChange={e => setJobSearch(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm pb-2">Logo URL</label>
                    <Controller
                      name="logoImageUrl"
                      control={methods.control}
                      render={({ field }) => (
                        <LogoSelector
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </fieldset>
              {/* Core Fields */}
              <fieldset className="border rounded p-4 mb-4">
                <legend className="font-bold text-lg mb-2">Core Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm pb-2">Title *</label><Input {...methods.register('answerKeyTitle', { required: true })} className="w-full border rounded p-2" required /></div>
                  <div><label className="block text-sm pb-2">Advertise Number</label><Input {...methods.register('answerKeyAdvtNumber')} className="w-full border rounded p-2" /></div>

                  <div className="md:col-span-2"><label className="block text-sm pb-2">Description</label>
                    <Controller name="answerKeyDescriptionJson" control={methods.control}
                      render={({ field }) => (<RichTextEditor id="descriptionJson" namespace="description-answerKey" value={field.value || ''}
                        onChange={(data) => { field.onChange(JSON.stringify(data.json)); methods.setValue('answerKeyDescriptionHtml', data.html); }}
                      />
                      )}
                    />
                  </div>
                  <div><label className="block text-sm pb-2">Exam Name</label><Input {...methods.register('answerKeyExamName')} className="w-full border rounded p-2" /></div>
                  <SelectOrTypeInput name="answerKeyOrganization" control={methods.control} label="Organization" options={organizations} />
                  <div><FormSelect name="answerKeyStatus" control={methods.control} label="Select Status" placeholder="Select Status" options={answerKeyStatusOptions} /></div>
                  <div><label className="block text-sm pb-2">Release Date</label>
                    <Controller name="answerKeyReleaseDate" control={methods.control}
                      render={({ field }) => (<DateTimePicker value={field.value ? new Date(field.value) : null} onChange={field.onChange} />)}
                    />
                  </div>
                </div>
              </fieldset>
              {/* Exam Details */}
              <fieldset className="border rounded p-4 mb-4">
                <legend className="font-bold text-lg mb-2">Exam Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect name="applicationMode" control={methods.control} label="Mode of Exam" placeholder="Select Application Mode" options={applicationModes} />
                </div>
              </fieldset>
              {/* Resource Links */}
              <fieldset className="border rounded p-4 mb-4">
                <legend className="font-bold text-lg mb-2">Resource Links</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm pb-2">AnswerKey Download Link</label><Input {...methods.register('answerKeyDownloadLink')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">AnswerKey Official Website Link</label><Input {...methods.register('answerKeyOfficialWebsite')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">is New</label><Checkbox {...methods.register('isAnswerKeyNew')} className="border rounded p-2" /></div>
                  {/* <div><label className="block text-sm pb-2">Notification PDF Link</label><Input {...methods.register('notificationPdfLink')} className="w-full border rounded p-2" /></div> */}

                  {/* <RegionWiseLinksEditor name="regionWiseLinks" control={methods.control} label="Region Wise Links" /> */}

                  <Controller name="importantLinks" control={methods.control} defaultValue={[]} render={({ field }) => (
                    <DynamicLinksEditor value={field.value || []} onChange={field.onChange} />
                  )} />
                </div>
              </fieldset>

              {/* Job Details */}
              <fieldset className="border rounded p-4 mb-4">
                <legend className="font-bold text-lg mb-2">Job Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm pb-2">Sector</label><Input {...methods.register('sector')} className="w-full border rounded p-2" /></div>
                  <FormMultiSelectIds name="stateIds" control={methods.control} label="States" placeholder="Select states" options={allStates.map((s) => ({
                    label: s.stateName, value: String(s.id),
                  }))} MultiSelectComponent={MultiSelect} />
                  <FormSelectId name="categoryId" control={methods.control} label="Select Category" placeholder="Select category"
                    options={categories.map((c) => ({ id: c.id, label: c.name, }))} />
                  <div><label className="block text-sm pb-2">Location Text</label><Input {...methods.register('locationText')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">Qualification</label><Input {...methods.register('qualification')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">Logo Text</label><Input {...methods.register('logo')} className="w-full border rounded p-2" /></div>
                  <FormColorPicker name="logoBgColor" control={methods.control} label="Logo BG Color" />
                  <div><label className="block text-sm pb-2">Total Vacancies</label><Input {...methods.register('totalVacancies')} className="w-full border rounded p-2" /></div>

                  <FormTagInput name="tags" control={methods.control} label="Tags" placeholder="Type tag and press Enter" />

                  <FormVideoLinksInput name="helpfullVideoLinks" control={methods.control} label="Helpful Video Links" />

                  <div className="flex flex-wrap gap-4">
                    <Controller control={methods.control} name="importantDates" render={({ field }) => (
                      <JsonFieldDialog title="Important Dates" value={field.value || []} onChange={(v) => field.onChange(v)} />
                    )} />
                    <Controller control={methods.control} name="vacancyDetails" render={({ field }) => (
                      <JsonFieldDialog title="Vacancy Details" value={field.value || []} onChange={(v) => field.onChange(v)} />
                    )} />
                    <Controller control={methods.control} name="eligibility" render={({ field }) => (
                      <JsonFieldDialog title="Eligibility" value={field.value || []} onChange={(v) => field.onChange(v)} />
                    )} />
                    <Controller control={methods.control} name="applicationFee" render={({ field }) => (
                      <JsonFieldDialog title="Application Fee" value={field.value || []} onChange={(v) => field.onChange(v)} />
                    )} />
                    <Controller control={methods.control} name="contactDetails" render={({ field }) => (
                      <JsonFieldDialog title="Contact Details" value={field.value || []} onChange={(v) => field.onChange(v)} />
                    )} />
                    <Controller control={methods.control} name="examPattern" render={({ field }) => (
                      <JsonFieldDialog title="Exam Pattern" value={field.value || []} onChange={(v) => field.onChange(v)} />
                    )} />

                  </div>
                  <div>
                    <div><label className="block text-sm pb-2">Publish Date</label>
                      <Controller name="publishDate" control={methods.control}
                        render={({ field }) => (<DateTimePicker value={field.value ? new Date(field.value) : null} onChange={field.onChange} />)}
                      />
                    </div>
                    <div><label className="block text-sm pb-2">Expiry Date</label>
                      <Controller name="expiryDate" control={methods.control}
                        render={({ field }) => (<DateTimePicker value={field.value ? new Date(field.value) : null} onChange={field.onChange} />)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm pb-1">Min Salary</label>
                      <Input
                        type="text"
                        {...methods.register('estimatedSalaryRange.min', { valueAsNumber: true })}
                        className="w-full border rounded p-2"
                        placeholder="Min"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm pb-1">Max Salary</label>
                      <Input
                        type="text"
                        {...methods.register('estimatedSalaryRange.max', { valueAsNumber: true })}
                        className="w-full border rounded p-2"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div><label className="block text-sm pb-2">Job Level</label><Input {...methods.register('jobLevel')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">Job Type</label><Input {...methods.register('jobType')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">Age Limit Text</label><Input {...methods.register('ageLimitText')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">Apply Link</label><Input {...methods.register('applyLink')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">Salary</label><Input {...methods.register('salary')} className="w-full border rounded p-2" /></div>
                </div>
              </fieldset>

              {/* SEO Details */}
              <SEOFields control={methods.control} watch={methods.watch} />

              {/* Related Jobs, Salary, Application Mode, etc. */}
              <fieldset className="border rounded p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormMultiSelectIds name="relatedJobs" control={methods.control} label="Related Jobs"
                    options={jobs.map(j => ({ label: j.title, value: j.id }))} MultiSelectComponent={MultiSelect} />
                  {/* News & Notification */}
                  <FormMultiSelectIds name="newsAndNotifications" control={methods.control} label="News & Notifications"
                    options={newsAndNotifications.map(n => ({ label: n.title, value: n.id }))} MultiSelectComponent={MultiSelect} />
                </div>
              </fieldset>

              {/* Statistics Details */}
              <fieldset className="border rounded p-4 mb-4">
                <legend className="font-bold text-lg mb-2">Statistics Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-sm pb-2">View Count</label><Input {...methods.register('viewCount')} className="w-full border rounded p-2" type="number" /></div>
                  <div><label className="block text-sm pb-2">Click Count</label><Input {...methods.register('clickCount')} className="w-full border rounded p-2" type="number" /></div>
                  <div><label className="block text-sm pb-2">Save Count</label><Input {...methods.register('saveCount')} className="w-full border rounded p-2" type="number" /></div>
                </div>
              </fieldset>

              <Controller control={methods.control} name="dynamicFields" render={({ field }) => (
                <DynamicFieldsSection />
              )} />

              <fieldset className="border rounded p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm pb-2">Notes</label><Input {...methods.register('notes')} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm pb-2">Review Status</label><Input {...methods.register('reviewStatus')} className="w-full border rounded p-2" /></div>
                </div>
              </fieldset>

              {error && <div className="text-red-500 text-sm pb-2">{error}</div>}
              {success && <div className="text-green-600 text-sm pb-2">{success}</div>}
              <Button type="submit" className="mt-2" disabled={loading}>{loading ? 'Saving...' : 'Update Answer Key'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider >
  );
}
