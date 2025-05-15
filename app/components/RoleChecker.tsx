"use client";

import { useSession } from "next-auth/react";

export default function RoleChecker() {
  const { data: session } = useSession();
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Session Data</h2>
      <pre className="mt-2 bg-gray-100 p-2 rounded">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}