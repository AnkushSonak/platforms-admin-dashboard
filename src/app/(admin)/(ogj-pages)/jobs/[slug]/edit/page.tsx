"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/state/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditJobForm from "./EditJobForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Job } from "@/helper/interfaces/Job";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;

export default function EditJobPage() {
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.authentication
  );
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [job, setJob] = useState<Job>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/job/slug/${slug}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setJob(data);
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to load job");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (user && !authLoading) fetchJob();
  }, [user, authLoading, fetchJob]);

  if (authLoading || loading) return <div>Loading...</div>;

  if (!user?.role || user.role !== "admin")
    return <div className="text-red-500">Access Denied</div>;

  if (error)
    return (
      <div className="text-red-500">
        {error}
        <Button onClick={fetchJob}>Retry</Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Edit Job: {job?.title}</h1>
      </div>

      {job ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <EditJobForm job={job} />
          </CardContent>
        </Card>
      ) : (
        <p>Loading job data...</p>
      )}
    </div>
  );
}
