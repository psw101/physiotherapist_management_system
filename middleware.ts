import { NextRequest, NextResponse } from "next/server";
import middleware from "next-auth/middleware";

export default middleware;

export const config = {
    matcher: ['/users:id*']
}

// middleware functions *zeror or more +one or more ? zero or one
// always start with forwardslash