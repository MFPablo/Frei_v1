'use client';

import { FormEvent } from 'react';

export default function Form() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch(`/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
    console.log({ response });
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 mx-auto max-w-md mt-10 items-center border rounded-[15px] bg-gray-900 p-[45px]"
    >
      <p className={"text-white font-bold"}>Sign-Up</p>
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
      <button type="submit" className={"px-[15px] border rounded-full bg-white max-w-max"}>Register</button>
    </form>
  );
}
