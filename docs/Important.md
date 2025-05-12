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