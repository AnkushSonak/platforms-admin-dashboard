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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/shadcn/ui/alert-dialog';
import { Result } from '@/app/helper/interfaces/Result';
// import { getResults } from '@/app/lib/api/Results';
import ClientLink from '@/components/form/existing/ClientLink';
import { getPaginatedEntity } from '@/lib/api/global/Generic';
import { RESULTS_API } from '@/app/envConfig';

export default function AdminAdmitCardsPage() {
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  // const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const RESULTS_PER_PAGE = 10;

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;


  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // const result = await getResults(searchQuery, currentPage, RESULTS_PER_PAGE);
      const result = await getPaginatedEntity<Result>(`type=results&search=${searchQuery}&page=${currentPage}&limit=${RESULTS_PER_PAGE}`, RESULTS_API,  { entityName: "results" });
      setResults(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  const handleDeleteResult = async (reslutId: string) => {
    setDeletingResultId(reslutId);
    try {
      const response = await fetch(`${API_BASE_URL}/result/${reslutId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        alert('Result deleted successfully!');
        fetchResults(); // Re-fetch to update the list and pagination
      } else if (response.status === 401 || response.status === 403) {
        setError("Unauthorized to delete. Please log in as an admin.");
        // checkAuth();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete result.');
      }
    } catch (err: any) {
      console.error("Error deleting result:", err);
      setError(err.message || 'Network error during deletion.');
    } finally {
      setDeletingResultId(null);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchResults();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between mt-4">
        <h1 className="text-2xl font-bold">Results</h1>
        <ClientLink href="/results/new">
          <Button className="ml-2" variant="default"><PlusCircle className="w-4 h-4 mr-1" />Add New</Button>
        </ClientLink>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>All Results</CardTitle>
          <form onSubmit={handleSearch} className="flex gap-2 mt-4">
            <Input
              placeholder="Search by title, exam name, etc."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" variant="outline"><Search className="w-4 h-4" /></Button>
          </form>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 font-medium mb-2">{error}</div>}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center">No Result found.</TableCell></TableRow>
                  ) : results.map(card => (
                    <TableRow key={card.id}>
                      <TableCell>{card.resultTitle}</TableCell>
                      <TableCell>{card.resultExamName}</TableCell>
                      <TableCell>{card.resultStatus}</TableCell>
                      <TableCell>{card.resultReleaseDate ? format(new Date(card.resultReleaseDate), 'yyyy-MM-dd') : '-'}</TableCell>
                      <TableCell className="flex gap-2">
                        {/* <Link href={`/admin/admit-cards/${card.admitCardSlug || card.id}/edit`}><Button size="icon" variant="outline"><Edit className="w-4 h-4" /></Button></Link> */}

                        <ClientLink href={`/results/${card.resultSlug}/edit`} passHref>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </ClientLink>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8" disabled={deletingResultId === card.id}>
                              {deletingResultId === card.id ? (
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
                                This action cannot be undone. This will permanently delete the Result posting &quot;{card.resultTitle}&quot;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteResult(card.id)} className="bg-red-600 hover:bg-red-700">
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
            </div>
          )}
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><ChevronLeft className="w-4 h-4" /></Button>
            <span>Page {currentPage} of {totalPages || 1}</span>
            <Button variant="outline" size="icon" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}