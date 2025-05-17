physiotherapist_management_system/
│
├── app/
│   ├── cart/
│   │   └── page.tsx              # Cart page to display and manage cart items
│   │
│   ├── checkout/
│   │   ├── page.tsx              # Checkout form page
│   │   └── success/
│   │       └── page.tsx          # Order confirmation page
│   │
│   ├── products/
│   │   └── view-products/
│   │       └── [id]/
│   │           └── page.tsx      # Product detail page (already implemented)
│   │
│   └── layout.tsx                # Root layout (update to include CartProvider)
│
├── components/
│   └── CartIcon.tsx              # Cart icon component with item count badge
│
├── context/
│   └── CartContext.tsx           # Cart context provider and hooks
│
└── types/
    └── index.ts                  # Type definitions for cart items, etc.





physiotherapist_management_system/
│
├── app/
│   ├── appointments/
│   │   ├── page.tsx                        # My Appointments page with cancellation
│   │   ├── make-appointments/
│   │   │   └── page.tsx                    # Appointment booking page
│   │   └── payment/
│   │       └── [id]/
│   │           └── page.tsx                # Payment processing for appointment
│   │
│   └── api/
│       ├── appointments/
│       │   ├── route.ts                    # Create appointments endpoint
│       │   └── [id]/
│       │       ├── route.ts                # Get/Update appointment endpoint
│       │       └── payment/
│       │           └── route.ts            # Process payment endpoint
│       │
│       └── patient/
│           └── appointments/
│               └── route.ts                # Get patient's appointments endpoint
│
├── components/
│   ├── AppointmentCard.tsx                 # Reusable appointment card component
│   └── PaymentForm.tsx                     # Reusable payment form component
│
├── lib/
│   └── prisma.ts                           # Prisma client
│
└── types/
    └── index.ts                            # Type definitions




    /app
  /admin
    layout.tsx                # Admin layout with navbar and auth protection
    page.tsx                  # Dashboard page
    /users
      page.tsx                # Users management page
    /patients
      page.tsx                # Patients management page
    /physiotherapists
      page.tsx                # Physiotherapists management page
    /appointments
      page.tsx                # Appointments management page
    /products
      page.tsx                # Products management page
    /orders
      page.tsx                # Orders management page
    /reports
      page.tsx                # Reports and analytics page
    /settings
      page.tsx                # System settings page
  /api
    /admin
      /stats
        route.ts              # Stats API endpoint
      /users
        route.ts              # Users API endpoint
        /[id]
          route.ts            # User by ID endpoint

/components
  /admin
    AdminNavbar.tsx           # Admin navigation component
    AdminTable.tsx            # Reusable admin table component (optional)
    AdminHeader.tsx           # Reusable page header (optional)
    AdminCard.tsx             # Styled admin card component (optional)



# adding timeslots multi physiotherapist

        physiotherapist_management_system/
    │
    ├── app/
    │   ├── admin/
    │   │   └── appointments/
    │   │       ├── page.tsx                           # Main admin appointments page
    │   │       ├── available-dates/
    │   │       │   └── page.tsx                       # Manage available dates 
    │   │       └── time-slots/
    │   │           └── [dateId]/
    │   │               └── page.tsx                   # Manage time slots for a date
    │   │
    │   └── api/
    │       ├── admin/
    │       │   └── appointments/
    │       │       ├── available-dates/
    │       │       │   ├── route.ts                   # CRUD for available dates
    │       │       │   └── [id]/
    │       │       │       └── route.ts               # Get/Update/Delete date
    │       │       └── time-slots/
    │       │           ├── route.ts                   # Create time slots
    │       │           └── [id]/
    │       │               └── route.ts               # Update/Delete time slot
    │       └── appointments/
    │           ├── available-dates/
    │           │   └── route.ts                       # Public API to get available dates
    │           └── available-slots/
    │               └── [dateId]/
    │                   └── route.ts                   # Get available slots for date


# timeslot adding

physiotherapist_management_system/
├── app/
│   ├── admin/
│   │   └── appointments/
│   │       ├── page.tsx                       # Admin appointments dashboard
│   │       └── slots/
│   │           └── page.tsx                   # Slot management UI
│   │
│   ├── appointments/
│   │   ├── page.tsx                           # My appointments page
│   │   └── book/
│   │       └── page.tsx                       # Appointment booking UI
│   │
│   └── api/
│       ├── admin/
│       │   └── slots/
│       │       ├── route.ts                   # Create/list slots
│       │       └── [id]/
│       │           └── route.ts               # Update/delete slot
│       │
│       ├── appointments/
│       │   ├── route.ts                       # Create appointment
│       │   └── [id]/
│       │       └── route.ts                   # Get/update appointment
│       │
│       └── slots/
│           └── available/
│               └── route.ts                   # Get available slots
│
├── prisma/
│   └── schema.prisma                          # Database schema definition
