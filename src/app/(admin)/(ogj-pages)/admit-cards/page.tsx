"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  ChevronLeft,
  ChevronRight,
  Edit,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn/ui/alert-dialog";
import { useSelector } from "react-redux";

import { RootState } from "@/state/store";
import { getPaginatedEntity } from "@/lib/api/global/Generic";
import { IAdmitCard } from "@/app/helper/interfaces/IAdmitCard";
import { ADMIT_CARDS_API } from "@/app/envConfig";

const ADMIT_CARDS_PER_PAGE = 10;

export default function AdminAdmitCardsPage() {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.authentication);
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const listQuery = useQuery({
    queryKey: ["admit-cards-list", currentPage, debouncedSearchQuery],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const query = `type=admit-cards&search=${encodeURIComponent(debouncedSearchQuery)}&page=${currentPage}&limit=${ADMIT_CARDS_PER_PAGE}`;
      return getPaginatedEntity<IAdmitCard>(query, ADMIT_CARDS_API, { entityName: "admit-cards" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${ADMIT_CARDS_API}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const message =
          response.status === 401 || response.status === 403
            ? "Unauthorized to delete admit card."
            : "Failed to delete admit card.";
        throw new Error(message);
      }
    },
    onSuccess: async (_, id) => {
      toast.success("Admit card deleted successfully.");

      const admitCards = listQuery.data?.data ?? [];
      const isLastItemOnPage = admitCards.length === 1 && currentPage > 1;
      if (isLastItemOnPage) {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else {
        await queryClient.invalidateQueries({ queryKey: ["admit-cards-list"] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Network error during deletion.");
    },
  });

  const admitCards = listQuery.data?.data ?? [];
  const totalPages = listQuery.data?.totalPages || 1;
  const loading = listQuery.isLoading || listQuery.isFetching;
  const error = listQuery.error instanceof Error ? listQuery.error.message : null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-100px)]">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BellRing className="w-6 h-6" /> Manage Admit Cards
        </h1>
        <Link href="/admit-cards/new" passHref>
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Add New Admit Card
          </Button>
        </Link>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Admit Card Listings</CardTitle>
          <div className="relative mt-4 max-w-sm">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search admit cards by title..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
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
          ) : admitCards.length === 0 ? (
            <div className="text-center py-10 text-red-600">No admit cards found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admitCards.map((admitCard) => (
                    <TableRow key={admitCard.id}>
                      <TableCell className="font-medium">{admitCard.title}</TableCell>
                      <TableCell>{admitCard.slug}</TableCell>
                      <TableCell>{new Date(admitCard.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Link href={`/admit-cards/${admitCard.slug}/edit`} passHref>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Edit ${admitCard.title}`}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              disabled={deleteMutation.isPending}
                              aria-label={`Delete ${admitCard.title}`}
                              title="Delete"
                            >
                              {deleteMutation.isPending && deleteMutation.variables === admitCard.id ? (
                                <span className="animate-spin">...</span>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete admit card?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete "{admitCard.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(admitCard.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
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

          {totalPages > 1 && !loading && admitCards.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
