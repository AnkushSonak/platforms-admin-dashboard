"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/shadcn/ui/button";
import { getEntityBySlug } from "@/lib/api/global/Generic";
import { AdmitCardFormDTO } from "@/app/helper/dto/AdmitCardFormDTO";
import { GET_ADMIT_CARDS_FOR_FORMS_API } from "@/app/envConfig";
import { AdmitCardForm } from "../../new/AdmitCardForm";

export default function EditAdmitCardPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const isDev = process.env.NODE_ENV !== "production";

  const detailsQuery = useQuery({
    queryKey: ["admit-card-details", slug],
    enabled: !!slug,
    queryFn: () =>
      getEntityBySlug<AdmitCardFormDTO>(GET_ADMIT_CARDS_FOR_FORMS_API, slug, {
        entityName: "admit-cards",
      }),
  });

  if (detailsQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (detailsQuery.isError) {
    if (isDev) {
      console.error("Error fetching admit card by slug:", detailsQuery.error);
    }
    return <div className="text-red-500">Failed to fetch admit card</div>;
  }

  if (!detailsQuery.data) {
    return <div>Admit card not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admit-cards" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Back to admit cards list" title="Back to admit cards list">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Admit Card</h1>
      </div>

      <AdmitCardForm
        isAdmin={true}
        initialValues={detailsQuery.data}
        isEditMode={true}
      />
    </div>
  );
}
