# Important Project Dependencie; kk
ideally this should install but I didn't it give typescript error
npm install @prisma/client @auth/prisma-adapter
instead used this
npm i @next-auth/prisma-adapter


remove prisma schemas and get fresh start
npx prisma format
npx prisma db push --force-reset


to drop develpment database
npx prisma migrate reset

use bcrypt to encrypt password before enerring to a database

# bcrypt 
when installing bcrpt first it didn't show the types or import
npm i bcrypt
after that
npm i -D @type/bcrpt worked

Not sure this line will work in nextauth route
 const passwordsMatch = await bcrypt.compare(credentials!.password, user!.hashedPassword!)



200 OK: Request succeeded
201 Created: Resource created successfully
400 Bad Request: Client error (validation errors)
401 Unauthorized: Authentication required
403 Forbidden: Authenticated but not authorized
404 Not Found: Resource not found
422 Unprocessable Entity: Good for validation errors
500 Internal Server Error: Server-side error


/app
  /components
    /ui             # Reusable UI components (buttons, inputs, etc.)
    /layout         # Layout components (headers, footers, sidebars)
    /features       # Feature-specific components 
      /patients     # Patient-related components
      /products     # Product-related components
      /appointments # Appointment-related components
    /common         # Shared components used across multiple features
    /forms          # Form-related components
    /tables         # Table components like your PatientTable
    /modals         # Modal components
    /icons          # Icon components
  /lib             # Utility functions, hooks, contexts
  /api             # API routes
  /[feature]       # Route groups by feature


