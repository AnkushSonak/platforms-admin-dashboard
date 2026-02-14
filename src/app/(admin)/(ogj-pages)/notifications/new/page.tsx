import Link from "next/link"
import { NotificationForm } from "./NotificationForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Page() {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/notifications" passHref>
          <Button variant="outline" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Add News And Notification</h1>
      </div>
      <NotificationForm isAdmin={true} />
    </div>
    )
}