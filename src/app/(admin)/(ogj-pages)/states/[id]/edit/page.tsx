// Edit State Page
"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { State } from '@/app/helper/interfaces/State';

export default function EditStatePage() {
  const params = useParams();
  const stateId = params?.id as string;
  const [form, setForm] = useState<Omit<State, 'id' | 'deletedAt'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    setTimeout(() => {
      setForm({ stateName: 'Sample State', slug: 'sample-state', isActive: true });
      setFetching(false);
    }, 800);
  }, [stateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : prev);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    setTimeout(() => {
      setSuccess('State updated (mock)!');
      setLoading(false);
    }, 1000);
  };

  if (fetching || !form) {
    return <div className="flex justify-center items-center h-screen">Loading state...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/states" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit State: {stateId}</h1>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Edit State Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">State Name *</label>
                <input
                  name="stateName"
                  value={form.stateName}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Slug *</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  Active
                </label>
              </div>
            </div>
            {error && <div className="text-red-500 font-medium">{error}</div>}
            {success && <div className="text-green-600 font-medium">{success}</div>}
            <Button type="submit" className="mt-2" disabled={loading}>
              {loading ? 'Saving...' : 'Update State'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}