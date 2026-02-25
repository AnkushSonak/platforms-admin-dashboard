"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shadcn/ui/button";
import { ArrowLeft } from "lucide-react";
import { getEntityBySlug } from "@/lib/api/global/Generic";
import { AdmitCardFormDTO } from "@/app/helper/dto/AdmitCardFormDTO";
import { GET_ADMIT_CARDS_FOR_FORMS_API } from "@/app/envConfig";
import { AdmitCardForm } from "../../new/AdmitCardForm";

export default function EditAdmitCardPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [initialData, setInitialData] = useState<AdmitCardFormDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {

        const data = await getEntityBySlug<AdmitCardFormDTO>(GET_ADMIT_CARDS_FOR_FORMS_API, slug, { entityName: "admit-cards",});
        console.log("Fetched admit card data:", data);
        if (!data ) {
          setError("Admit card not found");
          setInitialData(null);
        } else {
          setInitialData(data);
        }
        
      } catch (e: any) {
        console.error("Error fetching admit card by slug:", e);
        setError(e.message || "Failed to fetch admit card");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!initialData) return <div>Admit card not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admit-cards" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Admit Card</h1>
      </div>
      
      <AdmitCardForm
        isAdmin={true}
        initialValues={initialData}
        isEditMode={true}
      />

    </div>

  );
}
