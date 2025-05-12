import { Avatar, Box, Card, Flex, Grid, Inset, Strong, Text } from "@radix-ui/themes";
import React from "react";

type Props = {};

const ViewProductsPage = (props: Props) => {
  return (
    <div className="grid grid-cols-3 gap-7 p-6">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Product Image */}
        <div className="h-48 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2748&auto=format&fit=crop" alt="Product" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">In Stock</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 truncate">Professional Massage Table</h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">Premium quality massage table with adjustable height and comfortable padding for professional therapists.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold text-xl text-gray-900">Rs. 24,999</span>
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm font-medium transition-colors">View Details</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Product Image */}
        <div className="h-48 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2748&auto=format&fit=crop" alt="Product" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">In Stock</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 truncate">Professional Massage Table</h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">Premium quality massage table with adjustable height and comfortable padding for professional therapists.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold text-xl text-gray-900">Rs. 24,999</span>
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm font-medium transition-colors">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductsPage;
