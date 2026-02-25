import Link from "next/link"
import { Button } from "@/components/shadcn/ui/button"
import { ArrowLeft } from "lucide-react"
import { AdmitCardForm } from "./AdmitCardForm"

export default function Page() {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admit-cards" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Admit Card</h1>
      </div>
      <AdmitCardForm isAdmin={true} />
    </div>
    )
}