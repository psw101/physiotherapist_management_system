// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// !impotant do not change
//Follwing are the prisma schemas from nextauth for authentication purposes
model User {
  id             String          @id @default(cuid())
  name           String?
  username       String?         @unique
  email          String?         @unique
  emailVerified  DateTime?
  hashedPassword String?
  image          String?
  accounts       Account[]
  sessions       Session[]
  // Optional for WebAuthn support
  Authenticator  Authenticator[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  role      UserRole? @default(PATIENT)
}

enum UserRole {
  ADMIN
  PHYSIOTHERAPIST
  PATIENT
  RECEPTIONIST
}

model Account {
  id                       String  @id @default(cuid())
  userId                   String  @unique
  type                     String
  provider                 String
  providerAccountId        String
  refresh_token            String? @db.Text
  access_token             String? @db.Text
  expires_at               Int?
  token_type               String?
  scope                    String?
  id_token                 String? @db.Text
  session_state            String?
  refresh_token_expires_in Int?
  user                     User?   @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

// Optional for WebAuthn support
model Authenticator {
  credentialID         String  @unique
  userId               String
  providerAccountId    String
  credentialPublicKey  String
  counter              Int
  credentialDeviceType String
  credentialBackedUp   Boolean
  transports           String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, credentialID])
}

//folloing are for application
model Patient {
  id            Int      @id @default(autoincrement())
  name          String
  username      String   @unique
  password      String
  age           Int
  contactNumber String
  email         String   @unique
  area          String
  nic           String   @unique
  address       String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relationships
  appointments Appointment[]
  payments     Payment[]
}

model Product {
  id            Int     @id @default(autoincrement())
  name          String?
  price         Int?
  description   String?
  specification Json?
  imageUrl      String?
  videoUrl      String?
}

// Appointment management
model Appointment {
  id              Int      @id @default(autoincrement())
  patientId       Int
  appointmentDate String // Format: "YYYY-MM-DD"
  startTime       String // Format: "HH:MM"
  duration        Int // Duration in minutes
  status          String   @default("scheduled") // scheduled, completed, cancelled, no-show
  notes           String?  @db.Text
  reason          String
  paymentStatus   String   @default("unpaid") // unpaid, partially_paid, paid
  paymentAmount   Int?
  createdAt       DateTime @default(now())

  // Relationships
  patient Patient  @relation(fields: [patientId], references: [id])
  payment Payment?
}

model Payment {
  id            Int      @id @default(autoincrement())
  patientId     Int
  appointmentId Int?     @unique
  amount        Int
  method        String // cash, card, bank transfer, etc.
  status        String   @default("completed") // pending, completed, refunded, failed
  paymentDate   DateTime @default(now())
  reference     String?
  notes         String?

  // Relationships
  patient     Patient      @relation(fields: [patientId], references: [id])
  appointment Appointment? @relation(fields: [appointmentId], references: [id])
}
