// app/admin/notifications/[slug]/edit/page.tsx
"use client";


import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import { useEffect, useState } from 'react';

export default function EditNewsAndNotificationPage() {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.authentication);
  // const { user, isLoading: authLoading } = useAuth();

  const params = useParams();
  const newsAndNotificationSlug = params?.slug as string;

  // Form state
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Simulate fetch notification by slug (replace with real API call)
  useEffect(() => {
    setFetching(true);
    setTimeout(() => {
      // Mock data, replace with real fetch
      setForm({
        newsAndNotificationTitle: 'Sample Notification',
        newsAndNotificationSlug: newsAndNotificationSlug,
        newsAndNotificationDescription: 'Sample description',
        newsAndNotificationFullContent: 'Full content here',
        newsAndNotificationType: 'General',
        newsAndNotificationPublishedDateText: '2025-09-24',
        newsAndNotificationOfficialLink: '',
        newsAndNotificationDownloadLink: '',
        newsAndNotificationTags: 'tag1,tag2',
        newsAndNotificationMetaTitle: '',
        newsAndNotificationMetaDescription: '',
        newsAndNotificationIsFeatured: false,
        newsAndNotificationIsVerified: true,
        newsAndNotificationSourceName: '',
        newsAndNotificationSourceLogo: '',
        newsAndNotificationExtraInfo: '',
      });
      setFetching(false);
    }, 800);
  }, [newsAndNotificationSlug]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (!form.ntfnTitle || !form.ntfnSlug || !form.ntfnDescription) {
      setError('Title, Slug, and Description are required.');
      setLoading(false);
      return;
    }
    // TODO: Replace with real API call
    setTimeout(() => {
      setSuccess('Notification updated (mock)!');
      setLoading(false);
    }, 1000);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Access Denied. Only administrators can edit notifications.</div>;
  }

  if (fetching || !form) {
    return <div className="flex justify-center items-center h-screen">Loading notification...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/notifications" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Notification: {newsAndNotificationSlug}</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Edit NewsAndNotification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Title *</label>
                <input name="ntfnTitle" value={form.ntfnTitle} onChange={handleChange} className="w-full border rounded p-2" required />
              </div>
              <div>
                <label className="block font-medium">Slug *</label>
                <input name="ntfnSlug" value={form.ntfnSlug} onChange={handleChange} className="w-full border rounded p-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Description *</label>
                <textarea name="ntfnDescription" value={form.ntfnDescription} onChange={handleChange} className="w-full border rounded p-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Full Content</label>
                <textarea name="ntfnFullContent" value={form.ntfnFullContent} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Type</label>
                <input name="ntfnType" value={form.ntfnType} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Published Date</label>
                <input name="ntfnPublishedDateText" value={form.ntfnPublishedDateText} onChange={handleChange} className="w-full border rounded p-2" placeholder="YYYY-MM-DD" />
              </div>
              <div>
                <label className="block font-medium">Official Link</label>
                <input name="ntfnOfficialLink" value={form.ntfnOfficialLink} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Download Link</label>
                <input name="ntfnDownloadLink" value={form.ntfnDownloadLink} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Tags (comma separated)</label>
                <input name="ntfnTags" value={form.ntfnTags} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Meta Title</label>
                <input name="ntfnMetaTitle" value={form.ntfnMetaTitle} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Meta Description</label>
                <input name="ntfnMetaDescription" value={form.ntfnMetaDescription} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Source Name</label>
                <input name="ntfnSourceName" value={form.ntfnSourceName} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-medium">Source Logo URL</label>
                <input name="ntfnSourceLogo" value={form.ntfnSourceLogo} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Extra Info (JSON)</label>
                <textarea name="ntfnExtraInfo" value={form.ntfnExtraInfo} onChange={handleChange} className="w-full border rounded p-2" placeholder="{ &quot;key&quot;: &quot;value&quot; }" />
              </div>
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 font-medium">
                  <input type="checkbox" name="ntfnIsFeatured" checked={form.ntfnIsFeatured} onChange={handleChange} />
                  Featured
                </label>
                <label className="flex items-center gap-2 font-medium">
                  <input type="checkbox" name="ntfnIsVerified" checked={form.ntfnIsVerified} onChange={handleChange} />
                  Verified
                </label>
              </div>
            </div>
            {error && <div className="text-red-500 font-medium">{error}</div>}
            {success && <div className="text-green-600 font-medium">{success}</div>}
            <Button type="submit" className="mt-2" disabled={loading}>{loading ? 'Saving...' : 'Update Notification'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
