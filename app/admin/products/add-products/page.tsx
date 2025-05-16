"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Heading, Text, Flex, Card, Box, Button, IconButton } from "@radix-ui/themes";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/app/api/validationSchemas";
import SpecificationAdder from "@/components/SpecificationAdder";
import { z } from "zod";
import { useRouter } from "next/navigation";
import MediaUploader from "@/components/MediaUploader";

export default function AddProductPage() {
  const router = useRouter();
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [videoPublicId, setVideoPublicId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
  });

  // Update form values when media URLs change
  useEffect(() => {
    setValue("imageUrl", imageUrl);
    setValue("videoUrl", videoUrl);
  }, [imageUrl, videoUrl, setValue]);

  const handleAddProduct = async (data: z.infer<typeof productSchema>) => {
    try {
      setIsSubmitting(true);
      setFormError("");

      // Format the data as needed
      const productData = {
        ...data,
        specification: specs,
      };

      await axios.post("/api/products", productData);

      // Navigate back to the products page
      router.push("/admin/products");
    } catch (err) {
      console.error("Failed to add product:", err);
      setFormError("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImagePublicId("");
    setValue("imageUrl", "");
    trigger("imageUrl");
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setVideoPublicId("");
    setValue("videoUrl", "");
    trigger("videoUrl");
  };

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      <Heading size="5" mb="4">Add New Product</Heading>

      {formError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
          <Text color="red">{formError}</Text>
        </div>
      )}

      <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-6">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <Text size="2" weight="medium">
              Please correct the following errors:
            </Text>
            <ul className="list-disc ml-5 mt-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  <Text size="1">{(error as any).message}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <Text as="div" size="2" mb="1" weight="medium">
            Product Name
          </Text>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="Enter product name" 
            {...register("name")} 
          />
          {errors.name && (
            <Text color="red" size="1" className="mt-1">
              {errors.name.message as string}
            </Text>
          )}
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <Text as="div" size="2" mb="1" weight="medium">
            Description
          </Text>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            rows={3} 
            placeholder="Enter product description" 
            {...register("description")} 
          />
          {errors.description && (
            <Text color="red" size="1" className="mt-1">
              {errors.description.message as string}
            </Text>
          )}
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <Text as="div" size="2" mb="1" weight="medium">
            Product Price
          </Text>
          <input 
            type="number" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="Enter product price" 
            {...register("price", { valueAsNumber: true })} 
          />
          {errors.price && (
            <Text color="red" size="1" className="mt-1">
              {errors.price.message as string}
            </Text>
          )}
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <Text as="div" size="2" mb="1" weight="medium">
            Product Image
          </Text>
          
          {imageUrl ? (
            <div className="relative w-full">
              <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden mb-2">
                <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  type="button"
                  size="1"
                  variant="soft"
                  onClick={() => {
                    // Set imageUrl to null to show the uploader
                    setImageUrl("");
                    setImagePublicId("");
                    setValue("imageUrl", "");
                    // Important: Force browser to maintain scroll position
                    const scrollPos = window.scrollY;
                    setTimeout(() => window.scrollTo(0, scrollPos), 100);
                  }}
                  className="flex-1"
                >
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            <div key={`uploader-image-${Date.now()}`}>
              <MediaUploader 
                mediaType="image" 
                setUrl={(url) => {
                  setImageUrl(url);
                  setValue("imageUrl", url);
                  // Important: Force browser to maintain scroll position
                  const scrollPos = window.scrollY;
                  setTimeout(() => window.scrollTo(0, scrollPos), 100);
                }}
                setPublicId={setImagePublicId} 
              />
            </div>
          )}
          
          {errors.imageUrl && (
            <Text color="red" size="1" className="mt-1">
              {errors.imageUrl.message as string}
            </Text>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <Text as="div" size="2" mb="1" weight="medium">
            Product Video (Optional)
          </Text>

          {videoUrl ? (
            <div className="relative w-full rounded-md overflow-hidden mb-2">
              <video src={videoUrl} controls className="w-full h-48 bg-black" />
            </div>
          ) : (
            <MediaUploader 
              mediaType="video" 
              setUrl={setVideoUrl} 
              setPublicId={setVideoPublicId} 
            />
          )}

          {errors.videoUrl && (
            <Text color="red" size="1" className="mt-1">
              {errors.videoUrl.message as string}
            </Text>
          )}
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <Text as="div" size="2" mb="1" weight="medium">
            Specifications
          </Text>
          <SpecificationAdder
            initialSpecs={specs}
            onChange={(newSpecs) => {
              setSpecs(newSpecs);
              setValue("specification", newSpecs);
            }}
          />
          {errors.specification && (
            <Text color="red" size="1" className="mt-1">
              {errors.specification?.message as string}
            </Text>
          )}
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 mt-6">
          <Flex gap="3" justify="end">
            <Button 
              variant="soft" 
              color="gray" 
              onClick={() => router.push('/admin/products')}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </Flex>
        </div>
      </form>
    </div>
  );
}
