"use client";

import React, { useState } from 'react';

interface Specification {
  key: string;
  value: string;
}

interface ProductCardProps {
  name: string;
  price: number;
  description: string;
  specification: Specification[];
  imageUrl?: string;
  videoUrl?: string;
  selectedQuantity: number;
  setSelectedQuantity: (quantity: number) => void;
  selectedOption: string;
  setSelectedOption: (option: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  description,
  specification,
  imageUrl,
  videoUrl,
  selectedQuantity,
  setSelectedQuantity,
  selectedOption,
  setSelectedOption
}) => {
  const handleAddToCart = () => {
    alert(`Added to cart: ${selectedQuantity} ${name} (${selectedOption})`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 p-6">
        {/* Left: Media (Image & Video) */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img 
              src={imageUrl || "https://via.placeholder.com/600x400?text=No+Image"} 
              alt={name} 
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Video (if available) */}
          {videoUrl && (
            <div className="border border-gray-200 rounded-lg overflow-hidden aspect-w-16 aspect-h-9">
              <iframe 
                src={videoUrl} 
                title={`${name} demo`} 
                className="w-full h-64" 
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>

        {/* Right: Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
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

          <div className="text-3xl font-bold text-gray-900">Rs. {price.toLocaleString()}</div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="mt-2 text-gray-600">{description}</p>
          </div>

          {/* Customizable Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Options Selector */}
            <div>
              <label htmlFor="options" className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <select 
                id="options" 
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none" 
                value={selectedOption} 
                onChange={(e) => setSelectedOption(e.target.value)}
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
      {specification && specification.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {specification.map((spec, index) => (
              <div key={index} className="py-2 grid grid-cols-2">
                <div className="font-medium text-gray-700">{spec.key}</div>
                <div className="text-gray-600">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
