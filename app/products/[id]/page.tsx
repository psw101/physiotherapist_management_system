"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";

interface Specification {
  key: string;
  value: string;
}

interface CustomOption {
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  specification: Specification[];
  customOptions: CustomOption[]; // Add this new field
  imageUrl?: string;
  videoUrl?: string;
  feedback?: any[];
}

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
        
        // Initialize custom values with empty strings
        const initialValues: Record<string, string> = {};
        if (response.data.customOptions && Array.isArray(response.data.customOptions)) {
          response.data.customOptions.forEach((option: CustomOption) => {
            initialValues[option.label] = "";
          });
        }
        setCustomValues(initialValues);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleCustomValueChange = (label: string, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const validateForm = () => {
    if (!product?.customOptions) return true;
    
    let isValid = true;
    const requiredFields: string[] = [];
    
    product.customOptions.forEach(option => {
      if (option.required && !customValues[option.label]) {
        requiredFields.push(option.label);
        isValid = false;
      }
    });
    
    if (!isValid) {
      toast.error(`Please fill in the required fields: ${requiredFields.join(', ')}`, {
        position: "bottom-right"
      });
    }
    
    return isValid;
  };

  const handlePlaceOrder = async () => {
    // Check for authentication
    if (status !== "authenticated") {
      toast.info("Please login to place an order", {
        position: "bottom-right"
      });
      
      // Save current page to redirect back after login
      router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }
    
    // Validate required fields
    if (!validateForm()) return;

    if (!product) return;

    try {
      setSubmitting(true);
      
      // Calculate total price
      const totalPrice = product.price * selectedQuantity;
      
      // Create order
      const response = await axios.post("/api/orders", {
        productId: product.id,
        quantity: selectedQuantity,
        totalPrice: totalPrice,
        customizations: customValues
      });
      
      // Show success message
      toast.success("Order placed successfully! Waiting for admin approval.", {
        position: "bottom-right",
        autoClose: 5000
      });
      
      setOrderPlaced(true);
      
      // Redirect to orders page after a delay
      setTimeout(() => {
        router.push("/my-orders");
      }, 3000);
      
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.", {
        position: "bottom-right"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 font-medium text-lg mb-4">{error || "Product not found"}</div>
        <button onClick={() => router.push("/products/view-products")} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          <IoChevronBackOutline className="mr-2" /> Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Add ToastContainer for notifications */}
      <ToastContainer />

      {/* Back button */}
      <div className="mb-6">
        <button onClick={() => router.push("/products/view-products")} className="flex items-center text-blue-600 hover:text-blue-800">
          <IoChevronBackOutline className="mr-1" /> Back to Products
        </button>
      </div>

      {/* Product Overview */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Left: Media (Image & Video) */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img src={product.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"} alt={product.name} className="w-full h-auto object-cover" />
            </div>

            {/* Video (if available) */}
            {product.videoUrl && (
              <div className="border border-gray-200 rounded-lg overflow-hidden aspect-w-16 aspect-h-9">
                <iframe src={product.videoUrl} title={`${product.name} demo`} className="w-full h-64" allowFullScreen></iframe>
              </div>
            )}
          </div>

          {/* Right: Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
              
              {/* Show ratings from feedback if available */}
              {product.feedback && product.feedback.length > 0 && (
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(
                        product.feedback.reduce((acc, curr) => acc + curr.rating, 0) / product.feedback.length
                      ) ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">({product.feedback.length} reviews)</span>
                </div>
              )}
            </div>

            <div className="text-3xl font-bold text-gray-900">Rs. {product.price.toLocaleString()}</div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <select 
                id="quantity" 
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none" 
                value={selectedQuantity} 
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Customization Options */}
            {product.customOptions && product.customOptions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Customization Options</h3>
                
                {product.customOptions.map((option, index) => (
                  <div key={index} className="space-y-1">
                    <label htmlFor={`custom-${index}`} className="block text-sm font-medium text-gray-700">
                      {option.label}
                      {option.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      id={`custom-${index}`}
                      placeholder={option.placeholder || `Enter ${option.label}`}
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none"
                      value={customValues[option.label] || ""}
                      onChange={(e) => handleCustomValueChange(option.label, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Total Price */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Price:</span>
                <span className="text-xl font-bold text-blue-600">Rs. {(product.price * selectedQuantity).toLocaleString()}</span>
              </div>
              {selectedQuantity > 1 && <div className="text-sm text-gray-500 text-right mt-1">(Rs. {product.price.toLocaleString()} each)</div>}
            </div>

            {/* Place Order Button */}
            <button 
              onClick={handlePlaceOrder} 
              disabled={submitting || orderPlaced}
              className={`w-full py-3 px-6 rounded-md font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                submitting || orderPlaced 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submitting 
                ? "Processing..." 
                : orderPlaced 
                  ? "Order Placed!" 
                  : "Place Order"
              }
            </button>
            
            {/* Login prompt for unauthenticated users */}
            {status !== "authenticated" && (
              <p className="text-sm text-center text-gray-500">
                Please <button className="text-blue-600 underline" onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${productId}`)}`)}>login</button> to place an order
              </p>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.specification && product.specification.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {product.specification.map((spec, index) => (
                <div key={index} className="py-2 grid grid-cols-2">
                  <div className="font-medium text-gray-700">{spec.key}</div>
                  <div className="text-gray-600">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Customer Feedback */}
        {product.feedback && product.feedback.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h3>
            
            <div className="space-y-4">
              {product.feedback.map((review, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="font-medium">{review.userName}</div>
                      <div className="ml-2 text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
