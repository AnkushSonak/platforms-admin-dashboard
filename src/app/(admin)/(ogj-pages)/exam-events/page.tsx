// Admin Exam Events List Page
"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
export default function AdminExamEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Exam Events</h1>
        <Link href="/admin/exam-events/new">
          <Button className="ml-2" variant="default"><PlusCircle className="w-4 h-4 mr-1" />Add New</Button>
        </Link>
      </div>
      <Card className="shadow-md">
        <CardHeader><CardTitle>All Exam Events</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600">(Table of exam events will go here.)</p>
        </CardContent>
      </Card>
    </div>
  );
}