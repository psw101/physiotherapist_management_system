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