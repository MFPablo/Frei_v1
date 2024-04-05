import { redirect } from "next/navigation";
import StoreSwitcher from "@/components/store-switcher";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import prisma from "@/utils/prismaClient";
import { getServerSession } from "next-auth";

const Navbar = async () => {
  const session = await getServerSession() || undefined;
  const userId = session?.user?.id ?? undefined;
  if (!userId) {
    redirect('/login');
  }

  const stores = await prisma.store.findMany({
    where: {
      userId: userId
    }
  });

  return ( 
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores} />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
 
export default Navbar;
