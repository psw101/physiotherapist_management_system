"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { useCart } from "@/context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Specification {
  key: string;
  value: string;
}

interface Product {
  id: number; // This is a number
  name: string;
  price: number;
  description: string;
  specification: Specification[];
  imageUrl?: string;
  videoUrl?: string;
}

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  option: string;
}

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const { addToCart } = useCart(); // Use the cart context

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState("standard");
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    // Calculate correct price based on option
    const priceWithOption = getOptionPrice(selectedOption);

    // Add product to cart - convert ID to string to match CartItem interface
    addToCart({
      id: String(product.id), // Convert number to string
      name: product.name,
      price: priceWithOption,
      quantity: selectedQuantity,
      option: selectedOption,
      imageUrl: product.imageUrl,
    });

    // Show success message using toast
    toast.success(`Added ${selectedQuantity} ${product.name} to cart!`, {
      position: "bottom-right",
      autoClose: 3000,
    });

    // Update state to show cart notification
    setAddedToCart(true);

    // Hide notification after 5 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 5000);
  };

  const getOptionPrice = (option: string) => {
    if (!product) return 0; // Add null check

    switch (option) {
      case "premium":
        return product.price + 5000;
      case "professional":
        return product.price + 10000;
      default:
        return product.price;
    }
  };

  // Add null check for totalPrice calculation
  const totalPrice = product ? getOptionPrice(selectedOption) * selectedQuantity : 0;

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
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">(24 reviews)</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900">Rs. {product.price.toLocaleString()}</div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {/* Customizable Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity Selector */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <select id="quantity" className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none" value={selectedQuantity} onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Options Selector */}
              <div>
                <label htmlFor="options" className="block text-sm font-medium text-gray-700">
                  Options
                </label>
                <select id="options" className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium (+Rs. 5,000)</option>
                  <option value="professional">Professional (+Rs. 10,000)</option>
                </select>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Price:</span>
                <span className="text-xl font-bold text-blue-600">Rs. {totalPrice.toLocaleString()}</span>
              </div>
              {product && selectedQuantity > 1 && <div className="text-sm text-gray-500 text-right mt-1">(Rs. {getOptionPrice(selectedOption).toLocaleString()} each)</div>}
            </div>

            {/* Add to Cart Button */}
            <button onClick={handleAddToCart} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Add to Cart
            </button>
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
      </div>

      {/* Added to Cart Notification */}
      {addedToCart && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-green-500 max-w-sm">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Added to Cart!</h4>
              <p className="text-sm text-gray-600">
                {selectedQuantity} x {product?.name} ({selectedOption})
              </p>
            </div>
            <button onClick={() => setAddedToCart(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="mt-3 flex justify-between">
            <button onClick={() => router.push("/products/view-products")} className="text-blue-600 hover:text-blue-800 text-sm">
              Continue Shopping
            </button>
            <button onClick={() => router.push("/cart")} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
