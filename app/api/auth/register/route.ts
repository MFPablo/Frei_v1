import { NextResponse } from 'next/server';
import prisma from "@/utils/prismaClient";
import { encryptPassword } from "@/utils/security";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    // validate email and password
    console.log({ email, password });

    const hashedPassword =  await encryptPassword(password);
    const response = await prisma.user.create({
      data:{
        email,
        username: email,
        password:hashedPassword,
      }
    })
  } catch (e) {
    console.log({ e });
  }

  return NextResponse.json({ message: 'success' });
}
