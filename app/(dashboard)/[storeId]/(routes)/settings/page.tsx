import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

import { SettingsForm } from "./components/settings-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SettingsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {

  const session = await getServerSession(authOptions) || undefined;
  const userId = session?.user?.id ?? undefined;

  if (!userId) {
    redirect('/login');
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId: userId
    }
  });

  if (!store) {
    redirect('/');
  }

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={store} />
      </div>
    </div>
  );
}

export default SettingsPage;
