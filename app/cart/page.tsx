"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { IoChevronBackOutline, IoTrashOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react"; // Or use any icon library you prefer

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, removeFromCart, updateQuantity, totalPrice, isLoading, error } = useCart();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Show error banner if there's an error
  const errorBanner = error ? (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 flex items-start">
      <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">There was a problem with your cart</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  ) : null;
  
  // Prompt login for checkout
  const handleCheckout = () => {
    if (status === "unauthenticated") {
      router.push("/Login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };
  
  // Show empty cart message if cart is empty
  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        {errorBanner}
        <h1 className="text-2xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="mb-8">You haven't added any products to your cart yet.</p>
        <Link 
          href="/products/view-products"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <IoChevronBackOutline className="mr-2" />
          Browse Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {errorBanner}
      <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
      
      {/* Cart contents section */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart items display */}
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={`${item.id}-${item.option}`} className="bg-white rounded-lg shadow p-4 grid grid-cols-[100px_1fr] gap-4">
              <div className="w-24 h-24 rounded overflow-hidden">
                <img 
                  src={item.imageUrl || "https://via.placeholder.com/100?text=No+Image"} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-gray-500 text-sm">Option: {item.option}</p>
                <p className="text-blue-600 font-medium mt-1">Rs. {item.price.toLocaleString()}</p>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center border rounded">
                    <button 
                      onClick={() => updateQuantity(item.id, item.option, Math.max(1, item.quantity - 1))}
                      className="px-2 py-1 text-gray-600"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-l border-r">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.option, item.quantity + 1)}
                      className="px-2 py-1 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id, item.option)}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <IoTrashOutline className="mr-1" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order summary panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Order Summary</h3>
          
          <div className="space-y-2 pb-4 border-b">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          
          <div className="flex justify-between py-4 font-bold text-lg">
            <span>Total</span>
            <span>Rs. {totalPrice.toLocaleString()}</span>
          </div>
          
          {/* Display login notice for guests */}
          {status === "unauthenticated" && (
            <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded border">
              You'll need to log in to complete your purchase
            </div>
          )}
          
          <button
            onClick={handleCheckout}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition"
          >
            {status === "unauthenticated" ? "Sign In to Checkout" : "Proceed to Checkout"}
          </button>
          
          <Link href="/products/view-products">
            <div className="text-center mt-4 text-blue-600 hover:underline">
              Continue Shopping
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}