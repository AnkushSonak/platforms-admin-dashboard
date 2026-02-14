// Edit Exam Event Page
"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
export default function EditExamEventPage() {
  const params = useParams();
  const examEventSlug = params?.slug as string;
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  useEffect(() => {
    setFetching(true);
    setTimeout(() => {
      setForm({ examEventTitle: 'Sample Exam Event', examEventSlug, examEventDescription: 'Sample description', examEventName: '', examEventOrganization: '', examEventType: '', examEventTag: '', examEventTagColor: '', examEventLocation: '', examEventApplicants: '', examEventImage: '', examEventDate: '', examEventPattern: '', examEventVacancies: '', examEventEligibility: '', examEventApplicationFee: '', examEventImportantDates: '', examEventDownloadLink: '', examEventOfficialLink: '', isExamEventNew: false, examEventViewCount: 0 });
      setFetching(false);
    }, 800);
  }, [examEventSlug]);
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    setTimeout(() => {
      setSuccess('Exam Event updated (mock)!');
      setLoading(false);
    }, 1000);
  };
  if (fetching || !form) {
    return <div className="flex justify-center items-center h-screen">Loading exam event...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/exam-events" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Exam Event: {examEventSlug}</h1>
      </div>
      <Card className="shadow-md">
        <CardHeader><CardTitle>Edit Exam Event Details</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block font-medium">Title *</label><input name="examEventTitle" value={form.examEventTitle} onChange={handleChange} className="w-full border rounded p-2" required /></div>
              <div><label className="block font-medium">Slug *</label><input name="examEventSlug" value={form.examEventSlug} onChange={handleChange} className="w-full border rounded p-2" required /></div>
              <div className="md:col-span-2"><label className="block font-medium">Description *</label><textarea name="examEventDescription" value={form.examEventDescription} onChange={handleChange} className="w-full border rounded p-2" required /></div>
              <div><label className="block font-medium">Name</label><input name="examEventName" value={form.examEventName} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Organization</label><input name="examEventOrganization" value={form.examEventOrganization} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Type</label><input name="examEventType" value={form.examEventType} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Tag</label><input name="examEventTag" value={form.examEventTag} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Tag Color</label><input name="examEventTagColor" value={form.examEventTagColor} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Location</label><input name="examEventLocation" value={form.examEventLocation} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Applicants (comma separated)</label><input name="examEventApplicants" value={form.examEventApplicants} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Image URL</label><input name="examEventImage" value={form.examEventImage} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Date</label><input name="examEventDate" value={form.examEventDate} onChange={handleChange} className="w-full border rounded p-2" placeholder="YYYY-MM-DD" /></div>
              <div><label className="block font-medium">Pattern (JSON)</label><textarea name="examEventPattern" value={form.examEventPattern} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Vacancies (JSON)</label><textarea name="examEventVacancies" value={form.examEventVacancies} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Eligibility (JSON)</label><textarea name="examEventEligibility" value={form.examEventEligibility} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Application Fee (JSON)</label><textarea name="examEventApplicationFee" value={form.examEventApplicationFee} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Important Dates (JSON)</label><textarea name="examEventImportantDates" value={form.examEventImportantDates} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Download Link</label><input name="examEventDownloadLink" value={form.examEventDownloadLink} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="block font-medium">Official Link</label><input name="examEventOfficialLink" value={form.examEventOfficialLink} onChange={handleChange} className="w-full border rounded p-2" /></div>
              <div><label className="flex items-center gap-2 font-medium"><input type="checkbox" name="isExamEventNew" checked={form.isExamEventNew} onChange={handleChange} />New</label></div>
              <div><label className="block font-medium">View Count</label><input name="examEventViewCount" value={form.examEventViewCount} onChange={handleChange} className="w-full border rounded p-2" type="number" /></div>
            </div>
            {error && <div className="text-red-500 font-medium">{error}</div>}
            {success && <div className="text-green-600 font-medium">{success}</div>}
            <Button type="submit" className="mt-2" disabled={loading}>{loading ? 'Saving...' : 'Update Exam Event'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}