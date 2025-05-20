"use client";

import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { 
  Dialog, 
  DialogPanel, 
  DialogTitle,
  Transition, 
  TransitionChild 
} from '@headlessui/react';
import { loadStripe } from "@stripe/stripe-js";
import { FiInfo, FiStar, FiPlay, FiBox } from "react-icons/fi";

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
  customOptions: CustomOption[];
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isPayingAdvance, setIsPayingAdvance] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [activeTab, setActiveTab] = useState("details");
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
        
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

  const handlePlaceOrder = () => {
    if (status !== "authenticated") {
      toast.info("Please login to place an order", {
        position: "bottom-right"
      });
      
      router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }
    
    if (!validateForm()) return;

    setConfirmDialogOpen(true);
  };

  const handleConfirmOrder = async (payAdvance = false) => {
    if (!product) return;

    try {
      setSubmitting(true);
      setIsPayingAdvance(payAdvance);
      
      const totalPrice = product.price * selectedQuantity;
      const advanceAmount = Math.round(totalPrice * 0.1);
      
      const response = await axios.post('/api/checkout', {
        items: [{
          name: product.name,
          price: payAdvance ? advanceAmount : totalPrice,
          quantity: 1,
          description: `${product.name} x ${selectedQuantity}${payAdvance ? ' (10% Advance)' : ''}`
        }],
        orderDetails: {
          type: "product",
          productId: product.id,
          quantity: selectedQuantity,
          totalPrice: totalPrice,
          customizations: customValues,
          advancePayment: payAdvance
        }
      });
      
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe && response.data.id) {
        await stripe.redirectToCheckout({ sessionId: response.data.id });
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error("Error processing order:", error);
      setOrderError("Failed to process your order. Please try again.");
    } finally {
      setSubmitting(false);
      setConfirmDialogOpen(false);
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      <ToastContainer position="bottom-right" />

      <button 
        onClick={() => router.push("/products/view-products")} 
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <IoChevronBackOutline className="mr-1 text-gray-500" /> Back to Products
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button 
            onClick={() => router.push("/products/view-products")} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      ) : product ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Product title bar for mobile only */}
          <div className="lg:hidden p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900 line-clamp-2">{product.name}</h1>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                {product.feedback && product.feedback.length > 0 && (
                  <div className="flex items-center text-sm">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.round(
                            product.feedback!.reduce((acc, curr) => acc + curr.rating, 0) / product.feedback!.length
                          ) ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-gray-600">({product.feedback.length})</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-blue-600">Rs. {product.price.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Left: Media column (3/5 width on large screens) */}
            <div className="lg:col-span-3 p-4 lg:p-6">
              {/* Product title for desktop */}
              <div className="hidden lg:block mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    {product.feedback && product.feedback.length > 0 && (
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.round(
                                product.feedback!.reduce((acc, curr) => acc + curr.rating, 0) / product.feedback!.length
                              ) ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-600">({product.feedback.length} reviews)</span>
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">Rs. {product.price.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Media Gallery - More elegant layout */}
              <div className="space-y-6">
                {/* Product Image with improved styling */}
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain p-4"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FiBox className="w-16 h-16 mb-2" />
                        <p className="text-sm">No image available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Video Section - More professional styling */}
                {product.videoUrl && (
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <div className="bg-gray-800 px-4 py-3 flex items-center">
                      <FiPlay className="w-4 h-4 text-white mr-2" />
                      <h3 className="text-sm font-medium text-white">
                        Product Demonstration Video
                      </h3>
                    </div>
                    <div className="relative pb-[56.25%] h-0 bg-black">
                      <iframe 
                        src={product.videoUrl} 
                        className="absolute top-0 left-0 w-full h-full border-0"
                        title={`${product.name} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews tab content - Always visible if available */}
              {product.feedback && product.feedback.length > 0 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Customer Reviews ({product.feedback.length})</h3>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.round(
                              product.feedback!.reduce((acc, curr) => acc + curr.rating, 0) / product.feedback!.length
                            ) ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {(product.feedback.reduce((acc, curr) => acc + curr.rating, 0) / product.feedback.length).toFixed(1)} out of 5
                      </span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200 max-h-[250px] overflow-y-auto p-4">
                    {product.feedback.map((review, index) => (
                      <div key={index} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900 text-sm">{review.userName}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex mt-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 text-xs">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right: Details & Purchase column (2/5 width on large screens) */}
            <div className="lg:col-span-2 p-4 lg:p-6 bg-gray-50 lg:bg-white lg:border-l border-gray-200">
              <div className="lg:sticky lg:top-6">
                {/* MOVED: Tabs for product specs and details now at top of right column */}
                <div className="mb-6">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`px-4 py-2 text-sm font-medium ${activeTab === "details" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      Details
                    </button>
                    {product.specification && product.specification.length > 0 && (
                      <button
                        onClick={() => setActiveTab("specifications")}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "specifications" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        Specifications
                      </button>
                    )}
                  </div>
                  
                  {/* Tab content */}
                  <div className="mt-4 bg-white p-4 rounded-md shadow-sm border border-gray-100">
                    {/* Details tab */}
                    {activeTab === "details" && (
                      <div className="text-gray-600 text-sm leading-relaxed space-y-3 max-h-[200px] overflow-y-auto pr-2">
                        {product.description.split('\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    
                    {/* Specifications tab */}
                    {activeTab === "specifications" && (
                      <div className="rounded-md max-h-[200px] overflow-y-auto pr-2">
                        {product.specification.map((spec, index) => (
                          <div key={index} className={`py-2 ${index !== product.specification.length - 1 ? 'border-b border-gray-100' : ''} flex justify-between`}>
                            <span className="text-sm text-gray-500">{spec.key}</span>
                            <span className="text-sm font-medium text-gray-900 ml-4 text-right">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order section with quantity selector and customization */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    {/* Quantity selector */}
                    <div className="mb-4">
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <select 
                        id="quantity" 
                        className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                        value={selectedQuantity} 
                        onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    {/* Customization options */}
                    {product.customOptions && product.customOptions.length > 0 && (
                      <div className="mb-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Customization Options</h4>
                        
                        <div className="space-y-3">
                          {product.customOptions.map((option, index) => (
                            <div key={index}>
                              <label htmlFor={`custom-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                                {option.label}
                                {option.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <input
                                type="text"
                                id={`custom-${index}`}
                                placeholder={option.placeholder || `Enter ${option.label}`}
                                className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={customValues[option.label] || ""}
                                onChange={(e) => handleCustomValueChange(option.label, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Price calculation */}
                    <div className="mb-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price per item:</span>
                        <span className="text-sm font-medium">Rs. {product.price.toLocaleString()}</span>
                      </div>
                      
                      {selectedQuantity > 1 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <span className="text-sm font-medium">{selectedQuantity}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                        <span className="text-base font-medium text-gray-700">Total:</span>
                        <span className="text-lg font-bold text-blue-600">Rs. {(product.price * selectedQuantity).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Advance payment info */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <div className="flex">
                        <FiInfo className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-blue-800">
                            Advanced Payment Option
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Secure your order with a 10% deposit (Rs. {Math.round(product.price * selectedQuantity * 0.1).toLocaleString()}) and pay the remainder on delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Place order button */}
                    <button 
                      onClick={handlePlaceOrder} 
                      disabled={submitting || orderPlaced}
                      className={`w-full flex justify-center items-center py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                        submitting || orderPlaced 
                          ? "bg-gray-400 cursor-not-allowed text-white" 
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
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500">
                          Please <button className="text-blue-600 hover:underline" onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${productId}`)}`)}>login</button> to place an order
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Order Confirmation Dialog - Keep existing code */}
      <Transition appear show={confirmDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setConfirmDialogOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                  <div className="px-6 pt-6 pb-4">
                    <DialogTitle as="h3" className="text-lg font-medium text-gray-900">
                      Confirm Your Order
                    </DialogTitle>
                    
                    <div className="mt-4">
                      {/* Product summary with fixed-size image */}
                      <div className="flex items-start mb-4">
                        <div className="w-16 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {product?.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-image.jpg";
                              }}
                            />
                          ) : (
                            <FiBox className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="ml-3 flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{product?.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {product?.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Order details */}
                      <div className="bg-gray-50 p-3 rounded-md mb-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Item Price:</span>
                            <span className="font-medium">Rs. {product?.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium">{selectedQuantity}</span>
                          </div>
                          {Object.entries(customValues).filter(([_, v]) => v).length > 0 && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="font-medium mb-1">Customizations:</p>
                              {Object.entries(customValues).map(([key, value]) => 
                                value ? (
                                  <div key={key} className="flex justify-between text-xs">
                                    <span className="text-gray-600">{key}:</span>
                                    <span className="font-medium">{value}</span>
                                  </div>
                                ) : null
                              )}
                            </div>
                          )}
                          
                          <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                            <span>Total:</span>
                            <span>Rs. {(product?.price! * selectedQuantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment options info */}
                      <div className="p-3 bg-blue-50 rounded-md">
                        <div className="flex">
                          <FiInfo className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-blue-800 text-sm">
                              Pay 10% Advance: Rs. {Math.round(product?.price! * selectedQuantity * 0.1).toLocaleString()}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Pay advance to secure your order, remaining on delivery
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      onClick={() => setConfirmDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      onClick={() => handleConfirmOrder(true)}
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Pay 10% Advance"}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900"
                      onClick={() => handleConfirmOrder(false)}
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Pay Full Amount"}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ProductDetailPage;

