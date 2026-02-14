// // app/admin/jobs/new/page.tsx
// "use client";

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { format } from 'date-fns';

// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { MultiSelect } from '@/components/ui/multi-select'; // Assuming this is fixed
// // import { useAuth } from '../../../contexts/AuthContext';
// import { ArrowLeft } from 'lucide-react';
// import { Category } from '@/helper/interfaces/Category';
// import { State } from '@/helper/interfaces/State';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/app/state/store';
// import { getCategories } from '@/app/lib/api/categories';
// import { getStates } from '@/app/lib/api/states';

// // Define Zod schema for form validation (remains the same)
// const jobFormSchema = z.object({
//   title: z.string().min(3, "Job Title is required and must be at least 3 characters."),
//   description: z.string().min(3, "Job Discription is required"),
//   advtNumber: z.string().optional(),
//   organization: z.string().min(2, "Organization is required."),
//   categoryId: z.string().min(1, "Category is required."),
//   sector: z.string().optional(),
//   states: z.array(z.string()).min(1, "At least one State is required."),
//   locationText: z.string().optional(),
//   officialWebsite: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
//   notificationPdf: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
//   // closingDate: z.date({ required_error: "Closing Date is required." }),
//   qualification: z.string().optional(),
//   applicants: z.preprocess(
//     (val) => (val === "" ? null : Number(val)),
//     z.number().int().min(0, "Applicants must be a non-negative number.").nullable().optional()
//   ),
//   logo: z.string().optional(),
//   bgColor: z.string().optional(),
//   tags: z.string().optional(),
//   tagColors: z.string().optional(),
//   importantDates: z.string().optional(),
//   vacancyDetails: z.string().optional(),
//   eligibility: z.string().optional(),
//   jobType: z.string().min(1, "Job Type is required."),
//   ageLimitText: z.string().optional(),
//   applicationFee: z.string().optional(),
//   selectionProcess: z.string().optional(),
//   salary: z.string().optional(),
//   howToApply: z.string().optional(),
//   contactDetails: z.string().optional(),
//   examPattern: z.string().optional(),
//   syllabus: z.string().optional(),
//   isNew: z.boolean().default(false),
//   metaTitle: z.string().optional(),
//   metaDescription: z.string().optional(),
//   applyLink: z.string().url("Must be a valid URL.").min(1, "Apply Link is required."),
//   viewCount: z.number().optional(),
//   clickCount: z.number().optional(),
//   saveCount: z.number().optional(),
//   expiryDate: z.date().optional().nullable(),
//   autoPublishAt: z.date().optional().nullable(),
//   isExpired: z.boolean().optional(),
//   lastUpdatedBy: z.string().optional().nullable(),
//   notes: z.string().optional().nullable(),
//   reviewStatus: z.string().optional(),
//   editorialPriority: z.number().optional(),
//   featuredJob: z.boolean().optional(),
//   priorityLevel: z.number().optional(),
//   promotionStart: z.date().optional().nullable(),
//   promotionEnd: z.date().optional().nullable(),
//   promotionNotes: z.string().optional().nullable(),
//   relatedJobs: z.string().optional(),
//   relatedNotifications: z.string().optional(),
//   sourceName: z.string().optional().nullable(),
//   externalSourceLink: z.string().optional().nullable(),
//   estimatedSalaryRange: z.string().optional().nullable(),
//   applicationMode: z.string().optional().nullable(),
//   contactPerson: z.string().optional().nullable(),
//   jobLevel: z.string().optional().nullable(),
//   dynamicFields: z.string().optional().nullable(),
//   seoKeywords: z.string().optional(),
//   seoCanonicalUrl: z.string().optional().nullable(),
//   schemaMarkupJson: z.string().optional().nullable(),
// });

// type JobFormValues = z.infer<typeof jobFormSchema>;

// export default function AddJobPage() {
//   const { user, loading: authLoading } = useSelector((state: RootState) => state.authentication);
//   // const { user, isLoading: authLoading } = useAuth();
//   const router = useRouter();
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [states, setStates] = useState<State[]>([]);
//   const [loadingInitialData, setLoadingInitialData] = useState(true);
//   const [initialDataError, setInitialDataError] = useState<string | null>(null);
//   const [submitError, setSubmitError] = useState<string | null>(null);

//   const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;

//   const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset} = useForm<JobFormValues>({
//     resolver: zodResolver(jobFormSchema),
//     defaultValues: {
//       title: '',
//       description: '',
//       advtNumber: '',
//       organization: '',
//       categoryId: '',
//       sector: '',
//       states: [],
//       locationText: '',
//       officialWebsite: '',
//       notificationPdf: '',
//       qualification: '',
//       applicants: null,
//       logo: '',
//       bgColor: '',
//       tags: '',
//       tagColors: '',
//       importantDates: '',
//       vacancyDetails: '',
//       eligibility: '',
//       jobType: '',
//       ageLimitText: '',
//       applicationFee: '',
//       selectionProcess: '',
//       salary: '',
//       howToApply: '',
//       contactDetails: '',
//       examPattern: '',
//       syllabus: '',
//       isNew: false,
//       metaTitle: '',
//       metaDescription: '',
//       applyLink: '',
//       viewCount: 0,
//       clickCount: 0,
//       saveCount: 0,
//       expiryDate: undefined,
//       autoPublishAt: undefined,
//       isExpired: false,
//       lastUpdatedBy: '',
//       notes: '',
//       reviewStatus: '',
//       editorialPriority: 0,
//       featuredJob: false,
//       priorityLevel: 0,
//       promotionStart: undefined,
//       promotionEnd: undefined,
//       promotionNotes: '',
//       relatedJobs: '',
//       relatedNotifications: '',
//       sourceName: '',
//       externalSourceLink: '',
//       estimatedSalaryRange: '',
//       applicationMode: '',
//       contactPerson: '',
//       jobLevel: '',
//       dynamicFields: '',
//       seoKeywords: '',
//       seoCanonicalUrl: '',
//       schemaMarkupJson: '',
//     },
//   });

//   const fetchInitialData = useCallback(async () => {
//     setLoadingInitialData(true);
//     setInitialDataError(null);
//     try {
//       // const [categoriesRes, statesRes] = await Promise.all([
//       //   fetch(`${API_BASE_URL}/categories`, { credentials: 'include' }),
//       //   fetch(`${API_BASE_URL}/states`, { credentials: 'include' }),
//       // ]);

//       // if (!categoriesRes.ok) throw new Error('Failed to fetch categories.');
//       // if (!statesRes.ok) throw new Error('Failed to fetch states.');

//       // const categoriesData = await categoriesRes.json();
//       // const statesData = await statesRes.json();

//       const categoriesData = await getCategories();
//       const statesData = await getStates();

//       setCategories(categoriesData);
//       setStates(statesData);
//     } catch (err: any) {
//       console.error("Error fetching initial data:", err);
//       setInitialDataError(err.message || 'Failed to load categories or states.');
//     } finally {
//       setLoadingInitialData(false);
//     }
//   }, [API_BASE_URL]);

//   useEffect(() => {
//     if (!authLoading && user) {
//       fetchInitialData();
//     }
//   }, [authLoading, user, fetchInitialData]);

//   const onSubmit = async (data: JobFormValues) => {
    
//     setSubmitError(null);

//     const payload = {
//       ...data,
//       stateIds: data.states,
//       expiryDate: data.expiryDate ? format(data.expiryDate, 'dd-MM-yyyy') : undefined,
//       autoPublishAt: data.autoPublishAt ? format(data.autoPublishAt, 'yyyy-MM-dd') : undefined,
//       tags: data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
//       tagColors: data.tagColors ? data.tagColors.split(',').map(s => s.trim()).filter(Boolean) : [],
//       selectionProcess: data.selectionProcess ? data.selectionProcess.split(',').map(s => s.trim()).filter(Boolean) : [],
//       salary: data.salary ? data.salary.split(',').map(s => s.trim()).filter(Boolean) : [],
//       howToApply: data.howToApply ? data.howToApply.split(',').map(s => s.trim()).filter(Boolean) : [],
//       syllabus: data.syllabus ? data.syllabus.split(',').map(s => s.trim()).filter(Boolean) : [],
//       importantDates: data.importantDates ? JSON.parse(data.importantDates) : null,
//       vacancyDetails: data.vacancyDetails ? JSON.parse(data.vacancyDetails) : null,
//       eligibility: data.eligibility ? JSON.parse(data.eligibility) : null,
//       applicationFee: data.applicationFee ? JSON.parse(data.applicationFee) : null,
//       contactDetails: data.contactDetails ? JSON.parse(data.contactDetails) : null,
//       examPattern: data.examPattern ? JSON.parse(data.examPattern) : null,
//       relatedJobs: data.relatedJobs ? data.relatedJobs.split(',').map(s => s.trim()).filter(Boolean) : [],
//       relatedNotifications: data.relatedNotifications ? data.relatedNotifications.split(',').map(s => s.trim()).filter(Boolean) : [],
//       seoKeywords: data.seoKeywords ? data.seoKeywords.split(',').map(s => s.trim()).filter(Boolean) : [],
//       dynamicFields: data.dynamicFields ? JSON.parse(data.dynamicFields) : null,
//       schemaMarkupJson: data.schemaMarkupJson ? JSON.parse(data.schemaMarkupJson) : null,
//       // Remove obsolete/legacy fields if any
//     };

//     try {
//       console.debug("Job Payload : ", payload);
//       const response = await fetch(`${API_BASE_URL}/job`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         alert('Job added successfully!');
//         reset();
//         router.push('/admin/jobs');
//       } else {
//         const errorData = await response.json();
//         setSubmitError(errorData.message || 'Failed to add job.');
//         console.error("API error:", errorData);
//       }
//     } catch (err: any) {
//       console.error("Network error:", err);
//       setSubmitError(err.message || 'Network error. Could not connect to server.');
//     }
//   };

//   if (authLoading || loadingInitialData) {
//     return <div className="flex justify-center items-center h-screen text-gray-600">Loading admin panel...</div>;
//   }

//   if (!user || user.role !== 'admin') {
//     return <div className="text-center text-red-500 py-10">Access Denied. Only administrators can add jobs.</div>;
//   }

//   if (initialDataError) {
//     return <div className="text-center text-red-500 py-10">Error: {initialDataError}</div>;
//   }

//   return (
//     <div className="space-y-6 pb-10"> {/* Added pb-10 for bottom padding */}
//       <div className="flex items-center gap-4">
//         <Link href="/admin/jobs" passHref>
//           <Button variant="outline" size="icon" className="h-8 w-8">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//         </Link>
//         <h1 className="text-2xl font-bold text-gray-900">Add New Job Posting</h1>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {submitError && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//             {submitError}
//           </div>
//         )}

//   {/* Section: Basic Job Details */}
//         <Card className="shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg">Basic Job Details</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="title">Job Title</Label>
//                 <Input id="title" {...register('title')} className="mt-1" />
//                 {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="advtNumber">Advt Number</Label>
//                 <Input id="advtNumber" {...register('advtNumber')} className="mt-1" />
//                 {errors.advtNumber && <p className="text-red-500 text-sm mt-1">{errors.advtNumber.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="organization">Organization</Label>
//                 <Input id="organization" {...register('organization')} className="mt-1" />
//                 {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>}
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="description">Short Description</Label>
//               <Textarea id="description" {...register('description')} className="mt-1" rows={3} />
//               {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="categoryId">Category</Label>
//                 <Select onValueChange={(value) => setValue('categoryId', value)} value={watch('categoryId')}>
//                   <SelectTrigger className="w-full mt-1">
//                     <SelectValue placeholder="Select a category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map(cat => (
//                       <SelectItem key={cat.id} value={cat.id?.toString()}>
//                         {cat.categoryName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="jobType">Job Type</Label>
//                 <Select onValueChange={(value) => setValue('jobType', value)} value={watch('jobType')}>
//                   <SelectTrigger className="w-full mt-1">
//                     <SelectValue placeholder="Select job type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Full-time">Full-time</SelectItem>
//                     <SelectItem value="Part-time">Part-time</SelectItem>
//                     <SelectItem value="Contract">Contract</SelectItem>
//                     <SelectItem value="Internship">Internship</SelectItem>
//                     <SelectItem value="Temporary">Temporary</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {errors.jobType && <p className="text-red-500 text-sm mt-1">{errors.jobType.message}</p>}
//               </div>
//             </div>
//       <div>
//         <Label htmlFor="sector">Sector (e.g., "Government", "Private")</Label>
//         <Input id="sector" {...register('sector')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="viewCount">View Count</Label>
//         <Input id="viewCount" {...register('viewCount', { valueAsNumber: true })} className="mt-1" type="number" />
//       </div>
//       <div>
//         <Label htmlFor="clickCount">Click Count</Label>
//         <Input id="clickCount" {...register('clickCount', { valueAsNumber: true })} className="mt-1" type="number" />
//       </div>
//       <div>
//         <Label htmlFor="saveCount">Save Count</Label>
//         <Input id="saveCount" {...register('saveCount', { valueAsNumber: true })} className="mt-1" type="number" />
//       </div>
//       <div>
//         <Label htmlFor="expiryDate">Expiry Date</Label>
//         <Input id="expiryDate" {...register('expiryDate', { valueAsDate: true })} className="mt-1" type="date" />
//       </div>
//       <div>
//         <Label htmlFor="autoPublishAt">Auto Publish At</Label>
//         <Input id="autoPublishAt" {...register('autoPublishAt', { valueAsDate: true })} className="mt-1" type="date" />
//       </div>
//       <div>
//         <Label htmlFor="isExpired">Is Expired</Label>
//         <Checkbox id="isExpired" checked={watch('isExpired')} onCheckedChange={(checked) => setValue('isExpired', !!checked)} />
//       </div>
//       <div>
//         <Label htmlFor="lastUpdatedBy">Last Updated By</Label>
//         <Input id="lastUpdatedBy" {...register('lastUpdatedBy')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="notes">Notes</Label>
//         <Textarea id="notes" {...register('notes')} className="mt-1" rows={2} />
//       </div>
//       <div>
//         <Label htmlFor="reviewStatus">Review Status</Label>
//         <Input id="reviewStatus" {...register('reviewStatus')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="editorialPriority">Editorial Priority</Label>
//         <Input id="editorialPriority" {...register('editorialPriority', { valueAsNumber: true })} className="mt-1" type="number" />
//       </div>
//       <div>
//         <Label htmlFor="featuredJob">Featured Job</Label>
//         <Checkbox id="featuredJob" checked={watch('featuredJob')} onCheckedChange={(checked) => setValue('featuredJob', !!checked)} />
//       </div>
//       <div>
//         <Label htmlFor="priorityLevel">Priority Level</Label>
//         <Input id="priorityLevel" {...register('priorityLevel', { valueAsNumber: true })} className="mt-1" type="number" />
//       </div>
//       <div>
//         <Label htmlFor="promotionStart">Promotion Start</Label>
//         <Input id="promotionStart" {...register('promotionStart', { valueAsDate: true })} className="mt-1" type="date" />
//       </div>
//       <div>
//         <Label htmlFor="promotionEnd">Promotion End</Label>
//         <Input id="promotionEnd" {...register('promotionEnd', { valueAsDate: true })} className="mt-1" type="date" />
//       </div>
//       <div>
//         <Label htmlFor="promotionNotes">Promotion Notes</Label>
//         <Textarea id="promotionNotes" {...register('promotionNotes')} className="mt-1" rows={2} />
//       </div>
//       <div>
//         <Label htmlFor="relatedJobs">Related Jobs (Comma-separated Job IDs)</Label>
//         <Input id="relatedJobs" {...register('relatedJobs')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="relatedNotifications">Related Notifications (Comma-separated IDs)</Label>
//         <Input id="relatedNotifications" {...register('relatedNotifications')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="sourceName">Source Name</Label>
//         <Input id="sourceName" {...register('sourceName')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="externalSourceLink">External Source Link</Label>
//         <Input id="externalSourceLink" {...register('externalSourceLink')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="estimatedSalaryRange">Estimated Salary Range</Label>
//         <Input id="estimatedSalaryRange" {...register('estimatedSalaryRange')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="applicationMode">Application Mode</Label>
//         <Input id="applicationMode" {...register('applicationMode')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="contactPerson">Contact Person</Label>
//         <Input id="contactPerson" {...register('contactPerson')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="jobLevel">Job Level</Label>
//         <Input id="jobLevel" {...register('jobLevel')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="dynamicFields">Dynamic Fields (JSON)</Label>
//         <Textarea id="dynamicFields" {...register('dynamicFields')} className="mt-1" rows={3} placeholder='[{"label":"Extra","type":"text","value":"..."}]' />
//       </div>
//       <div>
//         <Label htmlFor="seoKeywords">SEO Keywords (Comma-separated)</Label>
//         <Input id="seoKeywords" {...register('seoKeywords')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="seoCanonicalUrl">SEO Canonical URL</Label>
//         <Input id="seoCanonicalUrl" {...register('seoCanonicalUrl')} className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="schemaMarkupJson">Schema Markup JSON</Label>
//         <Textarea id="schemaMarkupJson" {...register('schemaMarkupJson')} className="mt-1" rows={3} placeholder='{"@context":"https://schema.org"}' />
//       </div>
//           </CardContent>
//         </Card>

//         {/* Section: Location & Dates */}
//         <Card className="shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg">Location & Key Dates</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="states">States (Multi-Select)</Label>
//                 <MultiSelect
//                   options={states.map(state => ({ label: state.stateName, value: state.id?.toString() }))}
//                   selected={watch('states')}
//                   onSelect={(selectedItems) => setValue('states', selectedItems)}
//                   placeholder="Select states"
//                   className="mt-1"
//                 />
//                 {errors.states && <p className="text-red-500 text-sm mt-1">{errors.states.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="locationText">Location Text (e.g., "All India", "Delhi NCR")</Label>
//                 <Input id="locationText" {...register('locationText')} className="mt-1" />
//               </div>
//             </div>

//             {/* <div>
//               <Label htmlFor="closingDate">Closing Date</Label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant={"outline"}
//                     className={`w-full justify-start text-left font-normal mt-1 ${!watch('closingDate') && "text-muted-foreground"}`}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {watch('closingDate') ? format(watch('closingDate'), "PPP") : <span>Pick a date</span>}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={watch('closingDate')}
//                     onSelect={(date) => setValue('closingDate', date!)}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//               {errors.closingDate && <p className="text-red-500 text-sm mt-1">{errors.closingDate.message}</p>}
//             </div> */}
//           </CardContent>
//         </Card>

//         {/* Section: Links */}
//         <Card className="shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg">Important Links</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="officialwebsite">Official Website Link</Label>
//               <Input id="officialWebsite" {...register('officialWebsite')} className="mt-1" type="url" placeholder="https://example.com" />
//               {errors.officialWebsite && <p className="text-red-500 text-sm mt-1">{errors.officialWebsite.message}</p>}
//             </div>
//             <div>
//               <Label htmlFor="notificationPdf">Notification PDF Link</Label>
//               <Input id="notificationPdf" {...register('notificationPdf')} className="mt-1" type="url" placeholder="https://example.com/notification.pdf" />
//               {errors.notificationPdf && <p className="text-red-500 text-sm mt-1">{errors.notificationPdf.message}</p>}
//             </div>
//             <div>
//               <Label htmlFor="applyLink">Apply Link</Label>
//               <Input id="applyLink" {...register('applyLink')} className="mt-1" type="url" placeholder="https://example.com/apply" />
//               {errors.applyLink && <p className="text-red-500 text-sm mt-1">{errors.applyLink.message}</p>}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Section: Other Core Details */}
//         <Card className="shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg">Other Core Details</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="qualification">Qualification (e.g., "Graduate", "10th Pass")</Label>
//                 <Input id="qualification" {...register('qualification')} className="mt-1" />
//               </div>
//               <div>
//                 <Label htmlFor="applicants">Applicants (Number)</Label>
//                 <Input id="applicants" {...register('applicants', { valueAsNumber: true })} className="mt-1" type="number" />
//                 {errors.applicants && <p className="text-red-500 text-sm mt-1">{errors.applicants.message}</p>}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="salary">Salary (Comma-separated, e.g., "₹ 25000", "₹ 35000")</Label>
//                 <Input id="salary" {...register('salary')} className="mt-1" placeholder="e.g., ₹ 25000, ₹ 35000" />
//               </div>
//               <div>
//                 <Label htmlFor="ageLimitText">Age Limit Text (e.g., "18-30 years")</Label>
//                 <Input id="ageLimitText" {...register('ageLimitText')} className="mt-1" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Section: Visuals & Tags */}
//         <Card className="shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg">Visuals & Tags</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="logo">Logo (Text/Character for Placeholder)</Label>
//                 <Input id="logo" {...register('logo')} className="mt-1" placeholder="e.g., SBI, RRB" />
//               </div>
//               <div>
//                 <Label htmlFor="bgColor">Background Color (Tailwind class, e.g., "bg-blue-500")</Label>
//                 <Input id="bgColor" {...register('bgColor')} className="mt-1" placeholder="e.g., bg-blue-500" />
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="tags">Tags (Comma-separated, e.g., "SSC, Banking, Railway")</Label>
//                 <Input id="tags" {...register('tags')} className="mt-1" placeholder="e.g., SSC, Banking" />
//               </div>
//               <div>
//                 <Label htmlFor="tagColors">Tag Colors (Comma-separated Tailwind classes, e.g., "bg-blue-100, bg-green-100")</Label>
//                 <Input id="tagColors" {...register('tagColors')} className="mt-1" placeholder="e.g., bg-blue-100, bg-green-100" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Section: Advanced Details (JSON Input) */}
//         <Card className="shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg">Advanced Details (JSON Input)</CardTitle>
//             <p className="text-sm text-gray-600">
//               Please enter valid JSON for these fields. Use `null` or `{}` for empty objects.
//             </p>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="importantDates">Important Dates (JSON)</Label>
//               <Textarea id="importantDates" {...register('importantDates')} className="mt-1" rows={4} placeholder='{"startDate": "2025-01-01", "examDate": "2025-03-15"}' />
//               {errors.importantDates && <p className="text-red-500 text-sm mt-1">{errors.importantDates.message}</p>}
//             </div>
//             <div>
//               <Label htmlFor="vacancyDetails">Vacancy Details (JSON)</Label>
//               <Textarea id="vacancyDetails" {...register('vacancyDetails')} className="mt-1" rows={4} placeholder='{"totalVacancies": 1200, "breakdown": {"UR": 500, "OBC": 300}}' />
//               {errors.vacancyDetails && <p className="text-red-500 text-sm mt-1">{errors.vacancyDetails.message}</p>}
//             </div>
//             <div>
//               <Label htmlFor="eligibility">Eligibility (JSON)</Label>
//               <Textarea id="eligibility" {...register('eligibility')} className="mt-1" rows={4} placeholder='{"education": "Any Graduate", "ageLimit": {"min": 18, "max": 30}}' />
//               {errors.eligibility && <p className="text-red-500 text-sm mt-1">{errors.eligibility.message}</p>}
//             </div>
//             <div>
//               <Label htmlFor="applicationFee">Application Fee (JSON)</Label>
//               <Textarea id="applicationFee" {...register('applicationFee')} className="mt-1" rows={4} placeholder='{"general_ews": 100, "sc_st": 50}' />
//               {errors.applicationFee && <p className="text-red-500 text-sm mt-1">{errors.applicationFee.message}</p>}
//             </div>
//             <div>
//               <Label htmlFor="contactDetails">Contact Details (JSON)</Label>
//               <Textarea id="contactDetails" {...register('contactDetails')} className="mt-1" rows={4} placeholder='{"email": "info@example.com", "phone": "1234567890"}' />
//               {errors.contactDetails && <p className="text-red-500 text-sm mt-1">{errors.contactDetails.message}</p>}
//             </div>
//             <div>
//               <Label htmlFor="examPattern">Exam Pattern (JSON)</Label>
//               <Textarea id="examPattern" {...register('examPattern')} className="mt-1" rows={6} placeholder='{"Paper 1": {"subject": "General Awareness", "marks": 50}}' />
//               {errors.examPattern && <p className="text-red-500 text-sm mt-1">{errors.examPattern.message}</p>}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Section: List Details (Comma-separated) */}
//         <Card className="shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg">List Details (Comma-separated)</CardTitle>
//             <p className="text-sm text-gray-600">
//               Enter items separated by commas (e.g., "Item 1, Item 2").
//             </p>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="selectionProcess">Selection Process</Label>
//               <Textarea id="selectionProcess" {...register('selectionProcess')} className="mt-1" rows={3} placeholder="e.g., Written Exam, Interview, Document Verification" />
//             </div>
//             <div>
//               <Label htmlFor="howToApply">How To Apply</Label>
//               <Textarea id="howToApply" {...register('howToApply')} className="mt-1" rows={3} placeholder="e.g., Visit official website, Fill online form, Upload documents" />
//             </div>
//             <div>
//               <Label htmlFor="syllabus">Syllabus</Label>
//               <Textarea id="syllabus" {...register('syllabus')} className="mt-1" rows={3} placeholder="e.g., General Knowledge, Reasoning, Quantitative Aptitude" />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Section: SEO Details */}
//         <Card className="shadow-md">
//           <CardHeader>
//             <CardTitle className="text-lg">SEO Details</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="metaTitle">Meta Title</Label>
//               <Input id="metaTitle" {...register('metaTitle')} className="mt-1" />
//             </div>
//             <div>
//               <Label htmlFor="metaDescription">Meta Description</Label>
//               <Textarea id="metaDescription" {...register('metaDescription')} className="mt-1" rows={3} />
//             </div>
//             <div className="flex items-center space-x-2">
//               <Checkbox id="isNew" checked={watch('isNew')} onCheckedChange={(checked) => setValue('isNew', !!checked)} />
//               <Label htmlFor="isNew">Mark as New Job</Label>
//             </div>
//           </CardContent>
//         </Card>

//         <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white hover:text-white py-2 rounded-sm transition-colors" disabled={isSubmitting}>
//           {isSubmitting ? 'Adding Job...' : 'Add Job Posting'}
//         </Button>
//       </form>
//     </div>
//   );
// }
