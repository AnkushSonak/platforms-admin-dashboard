"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { PlusCircle, BellRing } from 'lucide-react';
import Link from 'next/link';
// import { useAuth } from '@/app/contexts/AuthContext'; // Adjust path
import { useEffect, useState, useCallback } from 'react';

import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import { INewsAndNtfn } from '@/app/helper/interfaces/INewsAndNtfn';
import { getPaginatedEntity } from '@/lib/api/global/Generic';
import { NEWS_AND_NTFN_API } from '@/app/envConfig';

export default function AdminNotificationsPage() {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.authentication);
  // const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<INewsAndNtfn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;

  // const fetchNotifications = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/notifications?page=${currentPage}&limit=10&search=${encodeURIComponent(searchQuery)}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //     });

  //     if (response.ok) {
  //       const result = await response.json();
  //       setNotifications(result.data);
  //       setTotalPages(result.meta.totalPages);
  //     } else if (response.status === 401 || response.status === 403) {
  //       setError("Authentication failed. Please log in again.");
  //     } else {
  //       const errorData = await response.json();
  //       setError(errorData.message || 'Failed to fetch notifications.');
  //     }
  //   } catch (err: any) {
  //     console.error("Error fetching notifications:", err);
  //     setError(err.message || 'Network error while fetching notifications.');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [currentPage, searchQuery, API_BASE_URL]);

  useEffect(() => {
    if (!authLoading && user) {
      // fetchNotifications();
      getPaginatedEntity<INewsAndNtfn>("type=news-and-notifications&page=1", NEWS_AND_NTFN_API,  { entityName: "news-and-notifications" }).then(result => {
        setNotifications(result.data);
        setLoading(false);
      });
    }
  }, [user, authLoading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-100px)]">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BellRing className="w-6 h-6" /> Manage Notifications
        </h1>
        <Link href="/news-and-notifications/new" passHref>
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Add New Notification
          </Button>
        </Link>
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Notification Listings</CardTitle>
          <Input
            placeholder="Search notifications by title, description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="mt-4 max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-2 border-b border-gray-100 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 text-red-600">No notifications found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>{notification.relatedEntityType}</TableCell>
                    <TableCell>{notification.slug}</TableCell>
                    <TableCell>{new Date(notification.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right flex justify-end space-x-2">
                      <Link href={`/news-and-notifications/${notification.slug}/edit`} passHref>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                        </Button>
                      </Link>
                      {/* Delete Notification Button - Add AlertDialog later */}
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && notifications.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg> Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
