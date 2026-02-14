// app/admin/page.tsx
// This is the main dashboard page for the admin panel.
"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Briefcase, BellRing, LayoutDashboard, ListFilter, MapPin, Calendar } from 'lucide-react';
import { Separator } from '@/components/shadcn/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/shadcn/ui/button';
import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import { redirect } from 'next/navigation';
import statsHandler from '../lib/api/stats';

interface Stats {
  jobs: number;
  notifications: number;
  admitCards: number;
  results: number;
  examEvents: number;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.authentication);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  useEffect(() => {
    // Fetch stats only if user is logged in and not already loading auth
    if (!authLoading && user) {
      statsHandler().then(data => {
        setStats(data);
      }).catch(err => {
        setErrorStats(err.message || 'Failed to fetch dashboard statistics.');
      }).finally(() => {
        setLoadingStats(false);
      });
    }
  }, [user, authLoading, statsHandler]);


  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-100px)]">
        <p className="">Loading admin panel...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by AdminLayout redirecting to login,
    // but a fallback is good.
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-100px)]">
        <p className="">Access Denied. Please log in.</p>
        {redirect("/admin/login")};
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8" />
        Welcome, {user.profile.firstName}!
      </h1>
      <p className="">This is your central dashboard for managing the GovtJobs portal content.</p>

      <Separator className="my-6" />

      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => ( // Render 5 skeleton cards
            <Card key={i} className="shadow-md rounded-lg p-6 animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 rounded w-1/2"></div>
                <div className="h-5 w-5 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 rounded w-1/3 mb-2"></div>
                <div className="h-3 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : errorStats ? (
        <div className="text-center py-10 text-red-600">Error loading stats: {errorStats}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Total Jobs */}
          <Card className="shadow-md rounded-lg p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
              <Briefcase className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.jobs ?? 'N/A'}</div>
              <p className="text-xs">View all jobs</p>
            </CardContent>
          </Card>

          {/* Card: Total Notifications */}
          <Card className=" shadow-md rounded-lg p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <BellRing className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.notifications ?? 'N/A'}</div>
              <p className="text-xs ">View all notifications</p>
            </CardContent>
          </Card>

          {/* Card: Total Admit Cards */}
          <Card className="shadow-md rounded-lg p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admit Cards</CardTitle>
              <ListFilter className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.admitCards ?? 'N/A'}</div>
              <p className="text-xs">Manage admit cards</p>
            </CardContent>
          </Card>

          {/* Card: Total Results */}
          <Card className="shadow-md rounded-lg p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <MapPin className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.results ?? 'N/A'}</div>
              <p className="text-xs">Manage results</p>
            </CardContent>
          </Card>

          {/* Card: Total Exam Events */}
          <Card className="shadow-md rounded-lg p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exam Events</CardTitle>
              <Calendar className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.examEvents ?? 'N/A'}</div>
              <p className="text-xs">Manage exam events</p>
            </CardContent>
          </Card>

          {/* Card: Admin Users */}
          {/* <Card className="bg-white shadow-md rounded-lg p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Admin Users</CardTitle>
              <Users className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.adminUsers ?? 'N/A'}</div>
              <p className="text-xs text-gray-500">Manage admin accounts</p>
            </CardContent>
          </Card> */}
        </div>
      )}

      {/* Quick Actions Section */}
      <Card className="shadow-md rounded-lg p-6">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/jobs/new" passHref>
            <Button className="w-full py-2 rounded-md transition-colors">Add New Job</Button>
          </Link>
          <Link href="/admin/notifications/new" passHref>
            <Button className="w-full py-2 rounded-md">Add New Notification</Button>
          </Link>
          <Link href="/admin/jobs" passHref>
            <Button variant="outline" className="w-full py-2 rounded-md">View All Jobs</Button>
          </Link>
          <Link href="/admin/notifications" passHref>
            <Button variant="outline" className="w-full py-2 rounded-md">View All Notifications</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
