import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthGuard from '@/context/AuthGuard';
import ReduxProvider from '@/context/ReduxProvider';
import { Toaster } from '@/components/shadcn/ui/sonner';
import ReactQueryProvider from '@/context/ReactQueryProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <ReactQueryProvider>
            <ReduxProvider>
              {/* <AuthGuard> */}
                <SidebarProvider>
                  {children}
                  <Toaster />
                </SidebarProvider>
              {/* </AuthGuard> */}
            </ReduxProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
