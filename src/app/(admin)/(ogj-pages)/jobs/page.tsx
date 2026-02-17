// app/admin/jobs/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusCircle, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import type { Job } from '@/app/helper/interfaces/Job'; // Import your Job entity type
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/shadcn/ui/alert-dialog';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';

export default function AdminJobsPage() {
  const { user, loading: authLoading, logout } = useSelector((state: RootState) => state.authentication);
  // const { user, isLoading: authLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;
  const JOBS_PER_PAGE = 10;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/jobs?page=${currentPage}&limit=${JOBS_PER_PAGE}&search=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Fetched jobs:", result.data);
        setJobs(result.data.items || []);
        setTotalPages(result.data.meta?.totalPages || 0);
      } else if (response.status === 401 || response.status === 403) {
        setError("Authentication failed. Please log in again.");
        // checkAuth();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch jobs.');
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || 'Network error while fetching jobs.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, API_BASE_URL /*, checkAuth */]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [fetchJobs, user, authLoading]);



  const handleDeleteJob = async (jobId: string) => {
    setDeletingJobId(jobId);
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        alert('Job deleted successfully!');
        fetchJobs(); // Re-fetch to update the list and pagination
      } else if (response.status === 401 || response.status === 403) {
        setError("Unauthorized to delete. Please log in as an admin.");
        // checkAuth();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete job.');
      }
    } catch (err: any) {
      console.error("Error deleting job:", err);
      setError(err.message || 'Network error during deletion.');
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signin");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center m-3">
        <h1 className="text-2xl font-normal">Manage Jobs</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader className="p-6 flex flex-row justify-between">
          {/* <CardTitle className="text-lg font-semibold">Job Listings</CardTitle> */}
          <div className="relative w-1/3 flex justify-center items-center">
            <Input
              placeholder="Search jobs by title, organization..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
          </div>
          <div className=''>
            <Link href="/jobs/new" passHref>
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Add New Job
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: JOBS_PER_PAGE }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-2 border-b animate-pulse">
                  <div className="h-8 w-8 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-3/4"></div>
                    <div className="h-3 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-20 rounded-md"></div>
                  <div className="h-8 w-8 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : jobs?.length === 0 ? (
            <div className="text-center py-10">No jobs found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className=''>
                  <TableHead className=' rounded-l-sm'>Title</TableHead>
                  <TableHead className=''>Organization</TableHead>
                  <TableHead className=''>Category</TableHead> {/* Added Category */}
                  <TableHead className=''>States</TableHead>    {/* Added States */}
                  <TableHead className=''>Location</TableHead> {/* Renamed for clarity */}
                  <TableHead className=''>Closing Date</TableHead>
                  <TableHead className="text-right rounded-r-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs?.map((job) => (
                  <TableRow className='rounded-sm' key={job.id}>
                    <TableCell className="font-medium  rounded-l-sm">{job.title}</TableCell>
                    <TableCell className="">{job.organization?.fullName}</TableCell>
                    <TableCell className="">{job.category?.categoryName || 'N/A'}</TableCell>
                    <TableCell className="">{job.states && job.states.length > 0 ? job.states.map((state) => state.stateName).join(", ") : "N/A"}</TableCell>
                    <TableCell className="">{job.locationText || 'N/A'}</TableCell>
                    <TableCell className="">{job.expiryDate && !isNaN(Date.parse(job?.expiryDate.toString())) ? format(new Date(job.expiryDate), "PPP") : 'N/A'}</TableCell>
                    <TableCell className="text-right flex gap-4 justify-end rounded-r-sm">
                      <Link href={`/jobs/${job.slug}/edit`} passHref>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8" disabled={deletingJobId === job.id}>
                            {deletingJobId === job.id ? (
                              <span className="animate-spin">🌀</span>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the job posting &quot;{job.title}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && jobs.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button onClick={handlePreviousPage} disabled={currentPage === 1} variant="outline" size="sm" className=''>
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button onClick={handleNextPage} disabled={currentPage === totalPages} size="sm" className=''>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
