"use client";
import { Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Spinner from "@/app/components/Spinner";

export default function ProductForm() {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDesc] = useState("");
  const [attr, setAttr] = useState({ key: "", value: "" });
  const [specs, setSpecs] = useState([{ key: "weight", value: "15 kg" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAddSpec = () => {
    if (!attr.key || !attr.value) return;
    setSpecs([...specs, attr]);
    setAttr({ key: "", value: "" });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form data
    if (!productName || !price) {
      setError("Product name and price are required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare the data to be sent to the API
      const productData = {
        productName,
        price: parseFloat(price),
        description,
        specification: specs,
      };

      console.log("Submitting product data:", productData);

      // Send the data to your API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const result = await response.json();
      console.log("Product created successfully:", result);

      // Show success message
      setSuccess(true);

      // Reset the form
      setProductName("");
      setPrice("");
      setDesc("");
      setSpecs([{ key: "weight", value: "15 kg" }]);
      setAttr({ key: "", value: "" });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/products"); // Redirect to products list
      }, 1500);
    } catch (error) {
      console.error("Error creating product:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col w-full max-w-2xl mx-5 space-y-8">
      <h2 className="text-xl font-semibold">Products</h2>
      {/* Product name */}
      <div className="space-y-3 max-w-xs">
        <label className="block text-lg font-medium" htmlFor="productName">
          Product name
        </label>
        <input id="productName" type="text" placeholder="Product" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={productName} onChange={(e) => setProductName(e.target.value)} />
      </div>

      {/* Product image */}
      <div className="space-y-3">
        <label className="block text-lg font-medium">Product image</label>
        <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer">
          <Plus size={48} />
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>

      {/* Product video */}
      <div className="space-y-3">
        <label className="block text-lg font-medium">Product video</label>
        <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer">
          <Plus size={48} />
          <input type="file" accept="video/*" className="hidden" />
        </label>
      </div>

      {/* Price */}
      <div className="space-y-3 max-w-xs">
        <label className="block text-lg font-medium" htmlFor="price">
          Product price
        </label>
        <input id="price" type="number" placeholder="24,000" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>

      {/* Product description */}
      <div className="space-y-3 max-w-xs">
        <label className="block text-lg font-medium" htmlFor="description">
          Product description
        </label>
        <textarea id="description" placeholder="Enter product details and features" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={description} onChange={(e) => setDesc(e.target.value)} rows={4} />
      </div>

      {/* Specification */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Specification</h3>
        <div className="grid grid-cols-5 gap-4 max-w-xl items-end">
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-600">Attribute</label>
            <input type="text" placeholder="Height" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={attr.key} onChange={(e) => setAttr({ ...attr, key: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-600">Value</label>
            <input type="text" placeholder="16 inch" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={attr.value} onChange={(e) => setAttr({ ...attr, value: e.target.value })} />
          </div>
          <button type="button" onClick={handleAddSpec} className="h-10 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            + Add
          </button>
        </div>

        {/* Spec list */}
        <table className="mt-4 text-sm min-w-max">
          <tbody>
            {specs.map((s, i) => (
              <tr key={i} className="text-gray-700">
                <td className="pr-8 py-1 capitalize">{s.key}</td>
                <td className="py-1">{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-8 pt-8">
        <button type="submit" className="w-32 h-10 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">
          OK
        </button>
        <button
          type="button"
          className="w-32 h-10 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
          onClick={() => {
            setProductName("");
            setPrice("");
            setSpecs([]);
            setAttr({ key: "", value: "" });
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}









































// export default function ProductForm() {
//   const router = useRouter();
//   const [productName, setProductName] = useState("");
//   const [price, setPrice] = useState("");
//   const [description, setDesc] = useState("");
//   const [attr, setAttr] = useState({ key: "", value: "" });
//   const [specs, setSpecs] = useState([{ key: "weight", value: "15 kg" }]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const handleAddSpec = () => {
//     if (!attr.key || !attr.value) return;
//     setSpecs([...specs, attr]);
//     setAttr({ key: "", value: "" });
//   };

//   const onsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     // Validate form data
//     if (!productName || !price) {
//       setError("Product name and price are required");
//       return;
//     }

//     setIsSubmitting(true);
//     setError("");

//     try {
//       // Prepare the data to be sent to the API
//       const productData = {
//         productName,
//         price: parseFloat(price),
//         description,
//         specification: specs,
//       };

//       console.log("Submitting product data:", productData);

//       // Send the data to your API
//       const response = await fetch("/api/products", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(productData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to create product");
//       }

//       const result = await response.json();
//       console.log("Product created successfully:", result);

//       // Show success message
//       setSuccess(true);

//       // Reset the form
//       setProductName("");
//       setPrice("");
//       setDesc("");
//       setSpecs([{ key: "weight", value: "15 kg" }]);
//       setAttr({ key: "", value: "" });

//       // Redirect after a short delay
//       setTimeout(() => {
//         router.push("/products"); // Redirect to products list
//       }, 1500);
//     } catch (error) {
//       console.error("Error creating product:", error);
//       setError(error instanceof Error ? error.message : "An error occurred");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={onSubmit} className="flex flex-col w-full max-w-2xl mx-5 space-y-8">
//       <h2 className="text-xl font-semibold">Products</h2>
//       {/* Product name */}
//       <div className="space-y-3 max-w-xs">
//         <label className="block text-lg font-medium" htmlFor="productName">
//           Product name
//         </label>
//         <input id="productName" type="text" placeholder="Product" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={productName} onChange={(e) => setProductName(e.target.value)} />
//       </div>

//       {/* Product image */}
//       <div className="space-y-3">
//         <label className="block text-lg font-medium">Product image</label>
//         <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer">
//           <Plus size={48} />
//           <input type="file" accept="image/*" className="hidden" />
//         </label>
//       </div>

//       {/* Product video */}
//       <div className="space-y-3">
//         <label className="block text-lg font-medium">Product video</label>
//         <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer">
//           <Plus size={48} />
//           <input type="file" accept="video/*" className="hidden" />
//         </label>
//       </div>

//       {/* Price */}
//       <div className="space-y-3 max-w-xs">
//         <label className="block text-lg font-medium" htmlFor="price">
//           Product price
//         </label>
//         <input id="price" type="number" placeholder="24,000" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={price} onChange={(e) => setPrice(e.target.value)} />
//       </div>

//       {/* Product description */}
//       <div className="space-y-3 max-w-xs">
//         <label className="block text-lg font-medium" htmlFor="description">
//           Product description
//         </label>
//         <textarea id="description" placeholder="Enter product details and features" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={description} onChange={(e) => setDesc(e.target.value)} rows={4} />
//       </div>

//       {/* Specification */}
//       <div className="space-y-3">
//         <h3 className="text-lg font-medium">Specification</h3>
//         <div className="grid grid-cols-5 gap-4 max-w-xl items-end">
//           <div className="col-span-2 space-y-1">
//             <label className="text-sm font-medium text-gray-600">Attribute</label>
//             <input type="text" placeholder="Height" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={attr.key} onChange={(e) => setAttr({ ...attr, key: e.target.value })} />
//           </div>
//           <div className="col-span-2 space-y-1">
//             <label className="text-sm font-medium text-gray-600">Value</label>
//             <input type="text" placeholder="16 inch" className="w-full rounded-md bg-gray-100 border-gray-300 px-3 py-2 focus:ring-0 focus:border-indigo-500 text-sm" value={attr.value} onChange={(e) => setAttr({ ...attr, value: e.target.value })} />
//           </div>
//           <button type="button" onClick={handleAddSpec} className="h-10 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
//             + Add
//           </button>
//         </div>

//         {/* Spec list */}
//         <table className="mt-4 text-sm min-w-max">
//           <tbody>
//             {specs.map((s, i) => (
//               <tr key={i} className="text-gray-700">
//                 <td className="pr-8 py-1 capitalize">{s.key}</td>
//                 <td className="py-1">{s.value}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Action buttons */}
//       <div className="flex justify-center gap-8 pt-8">
//         <button type="submit" className="w-32 h-10 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">
//           OK
//         </button>
//         <button
//           type="button"
//           className="w-32 h-10 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
//           onClick={() => {
//             setProductName("");
//             setPrice("");
//             setSpecs([]);
//             setAttr({ key: "", value: "" });
//           }}
//         >
//           Cancel
//         </button>
//       </div>
//     </form>
//   );
// }
