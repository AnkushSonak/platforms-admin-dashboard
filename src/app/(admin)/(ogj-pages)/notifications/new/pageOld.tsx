// app/admin/notifications/new/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/state/store';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewsAndNotificationSchema } from '@/app/lib/schemas/NewsAndNtfnSchema';
import z from 'zod';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { FormField, FormLabel } from '@/components/ui/form';
import { FieldError } from 'react-aria-components';
// import { useAuth } from '../../../contexts/AuthContext'; // Adjust path

export default function AddNotificationPage() {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.authentication);
  // const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Access Denied. Only administrators can add notifications.</div>;
  }

  // export function form() {
  const form = useForm<z.infer<typeof NewsAndNotificationSchema>>({
    resolver: zodResolver(NewsAndNotificationSchema),
    defaultValues: {
        title: "",
    shortTitle: "",
    slug: "",

    descriptionHtml: "",
    descriptionJson: "",

    headlineImage: {
      url: "",
      altText: "",
      caption: "",
    },

    officialOrderNumber: "",

    version: 1,

    status: "published",
    priority: "medium",
    relatedEntityType: undefined,

    language: "en",

    translations: {},

    officialLink: "",
    downloadLink: "",

    isFeatured: false,
    isVerified: false,

    sourceLinks: [],

    organization: {
      id: "",
    },

    category: null,

    states: [],

    job: null,
    admitCard: null,
    result: null,
    answerKey: null,

    dynamicFields: [],

    aiMeta: {
      tldr: "",
      keyTakeaways: [],
      sentiment: "neutral",
      predictedPopularity: 50,
      semanticVector: [],
      readingTimeMinutes: 1,
    },

    seo: {
      metaTitle: "",
      metaDescription: "",
      schemaType: "NewsArticle",
      canonicalUrl: "",
      keywords: [],
    },

    minAge: undefined,
    maxAge: undefined,
    qualifications: [],

    engagement: {
      view_count: 0,
      save_count: 0,
      share_count: 0,
      heat_index: 0,
      live_viewers: 0,
    },

    reviewStatus: "draft",

    publishedAt: undefined,
    },
  })


  // Form state
  // const [form, setForm] = useState({

  //   title: "",
  //   shortTitle: "",
  //   slug: "",

  //   descriptionHtml: "",
  //   descriptionJson: "",

  //   headlineImage: {
  //     url: "",
  //     altText: "",
  //     caption: "",
  //   },

  //   officialOrderNumber: "",

  //   version: 1,

  //   status: "published",
  //   priority: "medium",
  //   relatedEntityType: undefined,

  //   language: "en",

  //   translations: {},

  //   officialLink: "",
  //   downloadLink: "",

  //   isFeatured: false,
  //   isVerified: false,

  //   sourceLinks: [],

  //   organization: {
  //     id: "",
  //   },

  //   category: null,

  //   states: [],

  //   job: null,
  //   admitCard: null,
  //   result: null,
  //   answerKey: null,

  //   dynamicFields: [],

  //   aiMeta: {
  //     tldr: "",
  //     keyTakeaways: [],
  //     sentiment: "neutral",
  //     predictedPopularity: 50,
  //     semanticVector: [],
  //     readingTimeMinutes: 1,
  //   },

  //   seo: {
  //     metaTitle: "",
  //     metaDescription: "",
  //     schemaType: "NewsArticle",
  //     canonicalUrl: "",
  //     keywords: [],
  //   },

  //   minAge: undefined,
  //   maxAge: undefined,
  //   qualifications: [],

  //   engagement: {
  //     view_count: 0,
  //     save_count: 0,
  //     share_count: 0,
  //     heat_index: 0,
  //     live_viewers: 0,
  //   },

  //   reviewStatus: "draft",

  //   publishedAt: undefined,
  // });

  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  // const handleChange = (e: any) => {
  //   const { name, value, type, checked } = e.target;
  //   setForm((prev) => ({
  //     ...prev,
  //     [name]: type === 'checkbox' ? checked : value,
  //   }));
  // };

  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   setError(null);
  //   setSuccess(null);
  //   setLoading(true);
  //   // Basic validation
  //   if (!form.title || !form.slug || !form.descriptionHtml) {
  //     setError('Title, Slug, and Description are required.');
  //     setLoading(false);
  //     return;
  //   }
  //   // TODO: Replace with real API call
  //   setTimeout(() => {
  //     setSuccess('Notification created (mock)!');
  //     setLoading(false);
  //     setForm({
  //       title: '', slug: '', descriptionHtml: '', descriptionJson: '', headlineImage: { url: "", altText: "", caption: "" },
  //       officialOrderNumber: "", version: 1, status: "published", priority: "medium", relatedEntityType: undefined,
  //       language: "en", translations: {}, officialLink: "", downloadLink: "", isFeatured: false, isVerified: false,
  //       sourceLinks: [], organization: { id: "" }, category: null, states: [], job: null, admitCard: null, result: null, answerKey:null,
  //       dynamicFields:[], aiMeta:{ tldr:"", keyTakeaways:[], sentiment:"neutral", predictedPopularity:50, semanticVector:[], readingTimeMinutes:1 },
  //       seo:{ metaTitle:"", metaDescription:"", schemaType:"NewsArticle", canonicalUrl:"", keywords:[""] },
  //       minAge : undefined, maxAge : undefined, qualifications:[],
  //       engagement:{ view_count:0, save_count:0, share_count:0, heat_index:0, live_viewers:0 },
  //       reviewStatus:"draft",
  //       publishedAt : undefined
  //     });
  //   }, 1000);
  // };

   function onSubmit(data: z.infer<typeof NewsAndNotificationSchema>) {
    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/notifications" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Notification</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Notification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Controller name="title" control={form.control} render={({ field, fieldState }) => (
                  <FormField data-invalid={fieldState.invalid}>
                    <FormLabel htmlFor="form-news-and-ntfn-title">
                      Title
                    </FormLabel>
                    <Input
                      {...field}
                      id="form-news-and-ntfn-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter the notification title"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FormField>
                )}
                />
              </div>
              <div>
                <label className="block font-medium">Slug *</label>
                <input name="slug" value={form.slug} onChange={handleChange} className="w-full border rounded p-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Description *</label>
                <textarea name="descriptionHtml" value={form.descriptionHtml} onChange={handleChange} className="w-full border rounded p-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Full Content</label>
                <textarea name="descriptionJson" value={form.descriptionJson} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Type</label>
                <input name="type" value={form.type} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Published Date</label>
                <input name="publishedAt" value={form.publishedAt} onChange={handleChange} className="w-full border rounded p-2" placeholder="YYYY-MM-DD" />
              </div>
              <div>
                <label className="block font-medium">Official Link</label>
                <input name="officialLink" value={form.officialLink} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Download Link</label>
                <input name="downloadLink" value={form.downloadLink} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Tags (comma separated)</label>
                <input name="tags" value={form.tags} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Meta Title</label>
                <input name="metaTitle" value={form.seo.metaTitle} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Meta Description</label>
                <input name="metaDescription" value={form.seo.metaDescription} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Source Name</label>
                <input name="SourceName" value={form.SourceName} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Source Logo URL</label>
                <input name="SourceLogo" value={form.SourceLogo} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Extra Info (JSON)</label>
                <textarea name="ExtraInfo" value={form.ExtraInfo} onChange={handleChange} className="w-full border rounded p-2" placeholder="{ &quot;key&quot;: &quot;value&quot; }" />
              </div>
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 font-medium">
                  <input type="checkbox" name="IsFeatured" checked={form.IsFeatured} onChange={handleChange} />
                  Featured
                </label>
                <label className="flex items-center gap-2 font-medium">
                  <input type="checkbox" name="IsVerified" checked={form.IsVerified} onChange={handleChange} />
                  Verified
                </label>
              </div>
            </div>
            {error && <div className="text-red-500 font-medium">{error}</div>}
            {success && <div className="text-green-600 font-medium">{success}</div>}
            <Button type="submit" className="mt-2" disabled={loading}>{loading ? 'Saving...' : 'Create Notification'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
