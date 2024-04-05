'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import Link from 'next/link'

export default function Form() {
  const router = useRouter();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    console.log({ response });
    if (!response?.error) {
      router.push('/');
      router.refresh();
    }
  };
  return (

    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 mx-auto max-w-md mt-10 items-center border rounded-[15px] bg-gray-900 p-[45px]"
    >
      <p className={"text-white font-bold"}>Log-In</p>
      <input
        name="email"
        className="border border-black text-black"
        type="text"
      />
      <input
        name="password"
        className="border border-black  text-black"
        type="password"
      />
      <div className={"flex flex-row gap-[20px] items-center justify-center mt-[20px]"}>
        <button type="submit" className={"px-[15px] border rounded-full bg-white"}>Login</button>
        <Link href={"/register"} className={"px-[25px] border rounded-full bg-white"}>Register</Link>
      </div>

    </form>
  );
}
