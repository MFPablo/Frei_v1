import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { ModalProvider } from '@/providers/modal-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import Link from 'next/link';
import Logout from './logout';
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav>
          {!!session && <Logout />}
          {!session && <Link href="/login" className={"px-[25px] border rounded-full bg-white"}>Login</Link>}
        </nav>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <ToastProvider/>
          <ModalProvider/>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
