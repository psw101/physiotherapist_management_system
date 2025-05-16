import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // For security, you might want to remove sensitive information
  return NextResponse.json({
    authenticated: !!session,
    session: session,
    user: session?.user,
    patientIdExists: session?.user ? 'patientId' in session.user : false,
    patientId: session?.user ? (session.user as any).patientId : null
  });
}