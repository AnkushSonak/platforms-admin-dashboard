// app/admin/notifications/[slug]/edit/page.tsx
"use client";


import { NotificationForm } from "../../new/NotificationForm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { INewsAndNtfnForm } from "../../../form-interfaces/INewsAndNtfnForm";
import { INewsAndNtfn } from "@/app/helper/interfaces/INewsAndNtfn";
import { getNewsAndNtfnBySlugForForms } from "@/app/lib/api/notifications";
import Link from "next/link";
import { Button } from "@/components/shadcn/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditNewsAndNotificationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [initialData, setInitialData] = useState<INewsAndNtfnForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getNewsAndNtfnBySlugForForms(slug);
        console.log("Fetched notification data:", data);
        if (!data) {
          setError("Notification not found");
        }
        setInitialData(data);
      } catch (e: any) {
        console.error("Error fetching notification by slug:", e);
        setError(e.message || "Failed to fetch notification");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!initialData) return <div>Notification not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/notifications" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit News And Notification</h1>
      </div>
      
      <NotificationForm
        isAdmin={true}
        initialValues={initialData}
        isEditMode={true}
      />

    </div>

  );
}
