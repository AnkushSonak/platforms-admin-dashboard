// app/admin/layout.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import AuthGuard from '../contexts/AuthGuard';
import { CookieUtils } from '../utils/CookieUtils/CookieUtils';

export default function AdminLayout({ children, }: { children: React.ReactNode; }) {

  const logout = () => {
    console.debug("admin/layout.tsx : logout() : Logging out user...");
    sessionStorage.removeItem('tokenid');
    CookieUtils.deleteCookie('tokenid');
    window.location.href = '/admin/login';
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Admin Sidebar */}
        <aside className="w-64 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            <nav>
              <ul className="space-y-3">
                <li><Link href="/admin" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Dashboard</Link></li>
                <li><Link href="/admin/jobs" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Manage Jobs</Link></li>
                <li><Link href="/admin/notifications" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Manage Notifications</Link></li>
                <li><Link href="/admin/categories" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Manage Categories</Link></li>
                <li><Link href="/admin/states" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Manage States</Link></li>
                <li><Link href="/admin/admit-cards" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Manage Admit Cards</Link></li>
                <li><Link href="/admin/answer-keys" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Manage Answer Keys</Link></li>
                <li><Link href="/admin/results" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Manage Results</Link></li>
                <li><Link href="/admin/exam-events" className="block py-2 px-3 rounded-md hover:bg-secondary transition-colors">Manage Exam Events</Link></li>
              </ul>
            </nav>
          </div>
          {/* Logout button */}
          <div className="mt-auto">
            <Button
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 font-semibold py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}

        <main className="flex-1 p-3">
          {children}
        </main>

      </div>
    </AuthGuard>
  );
}
