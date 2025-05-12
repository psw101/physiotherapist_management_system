import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Span } from "next/dist/trace";
import { Session } from "inspector/promises";


export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <h1>Hello { session && <span>{session.user!.name}</span>}</h1>
      
 
    </div>
  );
}
