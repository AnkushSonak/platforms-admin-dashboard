import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthGuard from '@/context/AuthGuard';
import ReduxProvider from '@/context/ReduxProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <ReduxProvider>
            {/* <AuthGuard> */}
              <SidebarProvider>{children}</SidebarProvider>
            {/* </AuthGuard> */}
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
