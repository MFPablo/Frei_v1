import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar'
import { getServerSession } from "next-auth";
import prisma from "@/utils/prismaClient";

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const session = await getServerSession();

  console.log(session)

  if (!session?.user?.id) {
    redirect('/login');
  }

  const store = await prisma.store.findFirst({
    where: {
      id: params.storeId,
      userId: session?.user?.id,
    }
   });

  if (!store) {
    redirect('/');
  };

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};
