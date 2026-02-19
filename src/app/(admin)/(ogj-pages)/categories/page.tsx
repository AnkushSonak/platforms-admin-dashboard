// Admin Categories List Page
"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Link href="/categories/new">
          <Button className="ml-2" variant="default"><PlusCircle className="w-4 h-4 mr-1" />Add New</Button>
        </Link>
      </div>
      <Card className="shadow-md">
        <CardHeader><CardTitle>All Categories</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600">(Table of categories will go here.)</p>
        </CardContent>
      </Card>
    </div>
  );
}