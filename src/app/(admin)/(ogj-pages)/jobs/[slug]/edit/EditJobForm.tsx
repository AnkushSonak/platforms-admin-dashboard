"use client";

import { useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, JobFormData } from "@/app/lib/schemas/JobSchema";
import FullJobFieldsSection from "../../sections/FullJobFieldsSection";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;

export default function EditJobForm({ job }: { job: JobFormData }) {
  const latestHtmlRef = useRef("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState("");

  const methods = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: job,
    mode: "onSubmit",
  });

  const { handleSubmit, setValue, watch, formState: { errors }} = methods;

  const onValidSubmit = async (values: JobFormData) => {
    let payload = { ...values };

    // Normalize dates like in Create Job
    const dateFields = [
      "expiryDate",
      "autoPublishAt",
    ] as const;

    for (const field of dateFields) {
      const val = payload[field];
      if (val instanceof Date) {
        payload[field] = val.toISOString() as any;
      }
    }

    try {
      if (logoFile) {
        // ---------- multipart PUT ----------
        const formData = new FormData();

        Object.entries(payload).forEach(([k, v]) => {
          formData.append(
            k,
            typeof v === "object" ? JSON.stringify(v) : (v ?? "")
          );
        });

        formData.append("logoFile", logoFile);

        const res = await fetch(`${API_BASE_URL}/job/${job.id}/file`, {
          method: "PUT",
          body: formData,
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to update Job");
      } else {
        // ---------- JSON PUT ----------
        const res = await fetch(`${API_BASE_URL}/job/${job.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Update failed");
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6">
        <FullJobFieldsSection
          onLogoFileChange={(file) => {
            setLogoFile(file);
            if (file) {
              const allowed = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
              ];
              if (!allowed.includes(file.type)) setLogoError("Invalid file");
              else if (file.size > 1024 * 1024) setLogoError("Max 1MB");
              else setLogoError("");
            } else setLogoError("");
          }}
          onHtmlChange={(html) => { latestHtmlRef.current = html; }}
        />

        {logoError && <p className="text-red-500 text-xs">{logoError}</p>}

        <Button type="submit" disabled={!!logoError}>
          Update Job
        </Button>
      </form>
    </FormProvider>
  );
}


