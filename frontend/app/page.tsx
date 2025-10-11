"use client";

import Tabs from '@/components/Tabs/tabs';

export interface User {
  id: number;
  name: string;
  lineStatus: 'online' | 'offline';
}

export default function Home() {

  return (
    <>
      <div>
        <h1>Home</h1>
        <Tabs></Tabs>
      </div>
    </>
  );
}


