import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newAppointment = await prisma.appointments.create({
        data: {
            name: body.name,
            age: parseInt(body.age),
            contactNumber: body.contactNumber,
            email: body.email,
            nic: body.nic,
            address: body.address,   
        }
    });
    return NextResponse.json(newAppointment, { status: 201 });
}



