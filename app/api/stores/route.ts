import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
) {
  try {
    const session = await getServerSession(authOptions) || undefined;
    const userId = session?.user?.id ?? undefined;
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      }
    });
  
    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
