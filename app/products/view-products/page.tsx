"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import ProductCard from "./new/ProductCard";
import { Product } from "../add-products/page";
// export interface ProductDetails {
//   id: number;
//   productName: string;
//   price: number;
//   description: string;
//   specification: Record<string, any>;
//   imageURL: string;
//   videoURL?: string;
// }

const ProductDetailPage = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState("standard");

  useEffect(() => {
    // In a real app, fetch the product data from your API
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get(`/api/products/19`);
        setProduct(response.data);

        // Using dummy data for demonstration
        // setProduct({
        //   name: "Professional Massage Table",
        //   price: 24999,
        //   description: "Our premium massage table is designed for professional therapists and clinics. It features an adjustable height mechanism, comfortable high-density foam padding, and a sturdy hardwood frame that can support up to 250kg. The table comes with a face cradle, arm shelf, and carrying case for easy transportation. Perfect for both clinic use and mobile therapy services.",
        //   specification: [
        //     {
        //       key: "Material",
        //       value: "Natural latex rubber",
        //     },
        //     {
        //       key: "Resistance Level",
        //       value: "Medium (10-15 lbs)",
        //     },
        //   ],
        //   imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2748&auto=format&fit=crop",
        //   videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Example video URL
        // });
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
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
        <div className="text-red-500 font-medium text-lg">{error || "Product not found"}</div>
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
    alert(`Added to cart: ${selectedQuantity} ${product.name} (${selectedOption})`);
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
          <li className="text-gray-800 font-medium truncate">{product.name}</li>
        </ol>
      </nav>

      <ProductCard  name={product.name} price={product.price} description={product.description} specification={product.specification} imageUrl={product.imageUrl} videoUrl={product.videoUrl} selectedQuantity={selectedQuantity} setSelectedQuantity={setSelectedQuantity} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
    </div>
  );
};

export default ProductDetailPage;
