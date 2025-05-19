// "use client";

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useSession } from 'next-auth/react';
// import axios from 'axios';

// // Define cart item interface
// export interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   imageUrl?: string;
//   option: string;
// }

// // Define cart context type
// interface CartContextType {
//   cart: CartItem[];
//   addToCart: (item: CartItem) => void;
//   removeFromCart: (id: string, option: string) => void;
//   updateQuantity: (id: string, option: string, quantity: number) => void;
//   clearCart: () => void;
//   totalItems: number;
//   totalPrice: number;
//   isLoading: boolean;
//   error: string | null;
// }

// // Create context with default values
// const CartContext = createContext<CartContextType>({
//   cart: [],
//   addToCart: () => {},
//   removeFromCart: () => {},
//   updateQuantity: () => {},
//   clearCart: () => {},
//   totalItems: 0,
//   totalPrice: 0,
//   isLoading: true,
//   error: null
// });

// // Custom hook to use the cart context
// export const useCart = () => useContext(CartContext);

// // Provider component
// export const CartProvider = ({ children }: { children: ReactNode }) => {
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { data: session, status } = useSession();
  
//   // Calculate totals 
//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//   // Load cart data when session changes
//   useEffect(() => {
//     const loadCart = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         if (status === "authenticated" && session?.user?.id) {
//           // User is logged in, try to load cart from API
//           try {
//             const { data } = await axios.get('/api/cart');
//             setCart(data.cart || []);
//           } catch (apiError) {
//             console.error('API error loading cart:', apiError);
            
//             // Fallback to localStorage if API fails
//             const savedCart = localStorage.getItem('guestCart');
//             if (savedCart) {
//               setCart(JSON.parse(savedCart));
//             }
            
//             setError("Could not load your saved cart. Using local data instead.");
//           }
//         } else if (status === "unauthenticated") {
//           // User is not logged in, load from localStorage
//           const savedCart = localStorage.getItem('guestCart');
//           if (savedCart) {
//             setCart(JSON.parse(savedCart));
//           } else {
//             setCart([]);
//           }
//         }
//       } catch (error) {
//         console.error('Error loading cart:', error);
//         // Fallback to empty cart on error
//         setCart([]);
//         setError("There was a problem loading your cart.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Only load cart when session status is determined
//     if (status !== "loading") {
//       loadCart();
//     }
//   }, [session, status]);

//   // Save cart when it changes
//   useEffect(() => {
//     if (isLoading) return;
    
//     const saveCart = async () => {
//       if (status === "authenticated" && session?.user?.id) {
//         // User is logged in, save to API
//         try {
//           await axios.post('/api/cart', { cart });
//         } catch (error) {
//           console.error('Failed to save cart to server:', error);
//           // Still save to localStorage as backup
//           localStorage.setItem('guestCart', JSON.stringify(cart));
//         }
//       } else if (status === "unauthenticated") {
//         // User is not logged in, save to localStorage
//         localStorage.setItem('guestCart', JSON.stringify(cart));
//       }
//     };
    
//     saveCart();
//   }, [cart, session, status, isLoading]);

//   // Merge guest cart with user cart on login
//   useEffect(() => {
//     if (status === "authenticated" && session?.user) {
//       const mergeGuestCart = async () => {
//         const guestCartJSON = localStorage.getItem('guestCart');
//         if (guestCartJSON) {
//           try {
//             // Explicitly type the guest cart items
//             const guestCart = JSON.parse(guestCartJSON) as CartItem[];
            
//             if (guestCart.length > 0) {
//               // Add guest items to user's cart
//               setCart(prevCart => {
//                 // Combine carts, avoiding duplicates
//                 const combinedCart = [...prevCart];
                
//                 guestCart.forEach((guestItem: CartItem) => {
//                   const existingItemIndex = combinedCart.findIndex(
//                     item => item.id === guestItem.id && item.option === guestItem.option
//                   );
                  
//                   if (existingItemIndex >= 0) {
//                     // Update quantity if item exists
//                     combinedCart[existingItemIndex] = {
//                       ...combinedCart[existingItemIndex],
//                       quantity: combinedCart[existingItemIndex].quantity + guestItem.quantity
//                     };
//                   } else {
//                     // Add new item if it doesn't exist
//                     combinedCart.push(guestItem);
//                   }
//                 });
                
//                 return combinedCart;
//               });
              
//               // Clear guest cart after merging
//               localStorage.removeItem('guestCart');
//             }
//           } catch (error) {
//             console.error('Error parsing guest cart:', error);
//             // Clear invalid guest cart data
//             localStorage.removeItem('guestCart');
//           }
//         }
//       };
      
//       mergeGuestCart();
//     }
//   }, [status, session]);

//   // Add item to cart
//   const addToCart = (item: CartItem) => {
//     setCart(prevCart => {
//       // Check if item already exists in cart
//       const existingItemIndex = prevCart.findIndex(
//         cartItem => cartItem.id === item.id && cartItem.option === item.option
//       );

//       if (existingItemIndex >= 0) {
//         // Item exists, update quantity
//         const updatedCart = [...prevCart];
//         updatedCart[existingItemIndex] = {
//           ...updatedCart[existingItemIndex],
//           quantity: updatedCart[existingItemIndex].quantity + item.quantity
//         };
//         return updatedCart;
//       } else {
//         // Item doesn't exist, add new item
//         return [...prevCart, item];
//       }
//     });
//   };

//   // Remove item from cart
//   const removeFromCart = (id: string, option: string) => {
//     setCart(prevCart => 
//       prevCart.filter(item => !(item.id === id && item.option === option))
//     );
//   };

//   // Update item quantity
//   const updateQuantity = (id: string, option: string, quantity: number) => {
//     if (quantity <= 0) return removeFromCart(id, option);
    
//     setCart(prevCart => 
//       prevCart.map(item => 
//         item.id === id && item.option === option 
//           ? { ...item, quantity } 
//           : item
//       )
//     );
//   };

//   // Clear entire cart
//   const clearCart = () => {
//     setCart([]);
//   };

//   return (
//     <CartContext.Provider 
//       value={{ 
//         cart, 
//         addToCart, 
//         removeFromCart, 
//         updateQuantity, 
//         clearCart, 
//         totalItems, 
//         totalPrice,
//         isLoading,
//         error
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };