// app/admin/login/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/state/store';
import { loginUserAsync } from '@/app/state/authentication/AuthenticationSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, loading: isLoading } = useSelector((state: RootState) => state.authentication);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redirect if already logged in and not loading
  if (!isLoading && user) {
    router.replace('/admin'); // Redirect to admin dashboard
    return null; // Don't render login form if already logged in
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const credentials = { email, password}
    const success = dispatch(loginUserAsync(credentials));

    if (success) {
      // Login successful, AuthContext will handle user state and redirect
      // No need to explicitly push here, as checkAuth in context will trigger redirect
    } else {
      setError('Login failed. Please check your email and password.');
    }
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Access the content management system</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">email</Label>
              <Input
                id="email"
                type="text"
                placeholder="adminuser"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
