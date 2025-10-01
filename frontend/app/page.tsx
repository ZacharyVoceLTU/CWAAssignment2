"use client";

import Tabs from '@/components/Tabs/tabs';

const APIURL = "http://ec2-54-83-190-191.compute-1.amazonaws.com";

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


