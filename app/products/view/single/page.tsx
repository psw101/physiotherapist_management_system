'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

interface ProductDetails {
  id: number;
  productName: string;
  price: number;
  description: string;
  specification: Record<string, any>;
  imageURL: string;
  videoURL?: string;
}

const ProductDetailPage = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('standard');

  useEffect(() => {
    // In a real app, fetch the product data from your API
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        // const response = await axios.get(`/api/products/${productId}`);
        // setProduct(response.data);

        // Using dummy data for demonstration
        setProduct({
          id: 1,
          productName: "Professional Massage Table",
          price: 24999,
          description: "Our premium massage table is designed for professional therapists and clinics. It features an adjustable height mechanism, comfortable high-density foam padding, and a sturdy hardwood frame that can support up to 250kg. The table comes with a face cradle, arm shelf, and carrying case for easy transportation. Perfect for both clinic use and mobile therapy services.",
          specification: {
            "Dimensions": "185cm x 70cm x 60-85cm (adjustable height)",
            "Weight Capacity": "250kg",
            "Frame Material": "Beech hardwood",
            "Padding": "6cm high-density foam",
            "Upholstery": "Premium PU leather (waterproof)",
            "Accessories": "Face cradle, arm shelf, carrying case",
            "Warranty": "3 years"
          },
          imageURL: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2748&auto=format&fit=crop",
          videoURL: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Example video URL
        });
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 font-medium text-lg">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuantity(parseInt(e.target.value));
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleAddToCart = () => {
    alert(`Added to cart: ${selectedQuantity} ${product.productName} (${selectedOption})`);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <a href="/products/view" className="text-gray-500 hover:text-blue-600">
              Products
            </a>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className="text-gray-800 font-medium truncate">{product.productName}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Left: Media (Image & Video) */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img 
                src={product.imageURL} 
                alt={product.productName}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Video (if available) */}
            {product.videoURL && (
              <div className="border border-gray-200 rounded-lg overflow-hidden aspect-w-16 aspect-h-9">
                <iframe 
                  src={product.videoURL} 
                  title={`${product.productName} demo`}
                  className="w-full h-64"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
          
          {/* Right: Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.productName}</h1>
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
            
            <div className="text-3xl font-bold text-gray-900">
              Rs. {product.price.toLocaleString()}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>
            
            {/* Customizable Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity Selector */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                <select 
                  id="quantity" 
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={selectedQuantity}
                  onChange={handleQuantityChange}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              {/* Options Selector (e.g., color, size, etc.) */}
              <div>
                <label htmlFor="options" className="block text-sm font-medium text-gray-700">Options</label>
                <select 
                  id="options" 
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={selectedOption}
                  onChange={handleOptionChange}
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium (+Rs. 5,000)</option>
                  <option value="professional">Professional (+Rs. 10,000)</option>
                </select>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
        
        {/* Specifications */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(product.specification).map(([key, value]) => (
              <div key={key} className="py-2 grid grid-cols-2">
                <div className="font-medium text-gray-700">{key}</div>
                <div className="text-gray-600">{value as string}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;