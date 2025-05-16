"use client";

import React, { useState, useEffect } from "react";
import { Button, Text, TextArea, TextField, Callout } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/app/api/validationSchemas";
import { z } from "zod";
import MediaUploader from "@/components/MediaUploader";
import SpecificationAdder from "@/components/SpecificationAdder";

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  videoUrl: string;
  specification: {
    key: string;
    value: string;
  }[];
}

const EditProductPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  
  const [specs, setSpecs] = useState<Product["specification"]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // For media uploads
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [videoPublicId, setVideoPublicId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm<Product>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
  });

  // Fetch product data when component mounts
  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing");
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
        const product = response.data;

        // Populate form with product data
        reset({
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          videoUrl: product.videoUrl || "",
          specification: product.specification,
        });

        // Set state values
        setImageUrl(product.imageUrl);
        setVideoUrl(product.videoUrl || "");
        setSpecs(product.specification || []);

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product data");
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, reset]);

  // Update form values when media URLs change
  useEffect(() => {
    setValue("imageUrl", imageUrl);
    setValue("videoUrl", videoUrl);
  }, [imageUrl, videoUrl, setValue]);

  // Helper function to preserve scroll position
  const preserveScroll = (callback: () => void) => {
    // Get current scroll position
    const scrollPos = window.scrollY;
    
    // Execute the callback that changes the component state
    callback();
    
    // Force immediate scroll restoration and then again after a short delay
    window.scrollTo(0, scrollPos);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPos);
      setTimeout(() => window.scrollTo(0, scrollPos), 50);
      setTimeout(() => window.scrollTo(0, scrollPos), 100);
      setTimeout(() => window.scrollTo(0, scrollPos), 200);
    });
  };

  // Custom image URL setter that also updates the form
  const handleImageUrlChange = (url: string) => {
    preserveScroll(() => {
      setImageUrl(url);
      setValue("imageUrl", url);
      trigger("imageUrl");
    });
  };

  // Custom video URL setter that also updates the form
  const handleVideoUrlChange = (url: string) => {
    preserveScroll(() => {
      setVideoUrl(url);
      setValue("videoUrl", url);
      trigger("videoUrl");
    });
  };

  const onSubmit = async (data: Product) => {
    if (!productId) {
      setError("Product ID is missing");
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");

      // Create the updated product data
      const updatedProduct = {
        ...data,
        specification: specs,
      };

      await axios.put(`/api/products/${productId}`, updatedProduct);

      setError("Successfully updated product");
      // Navigate back to the products page
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (error) {
      console.error("Error updating product:", error);
      setError("An unexpected error occurred while updating the product.");
    } finally {
      setSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation failed:", errors);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="fixed left-64 top-0 right-0 bottom-0 pt-16 pb-6 px-6 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

          {error && (
            <Callout.Root variant="soft" color={error.includes("Successfully") ? "green" : "red"} className="mb-6">
              <Text size="2" weight="medium">
                {error}
              </Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit(onSubmit, onError)} className="max-w-xl space-y-6 pb-20">
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p>Please correct the following errors:</p>
                <ul className="list-disc ml-5">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{(error as any).message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <Text as="div" size="2" mb="1" weight="medium">
                Product Name
              </Text>
              <TextField.Root placeholder="Enter product name" {...register("name")} />
              {errors.name && (
                <Text color="red" size="1">
                  {errors.name.message as string}
                </Text>
              )}
            </div>

            <div>
              <Text as="div" size="2" mb="1" weight="medium">
                Description
              </Text>
              <TextArea placeholder="Enter product description" {...register("description")} />
              {errors.description && (
                <Text color="red" size="1">
                  {errors.description.message as string}
                </Text>
              )}
            </div>

            <div>
              <Text as="div" size="2" mb="1" weight="medium">
                Product Price
              </Text>
              <TextField.Root type="number" placeholder="Enter product price" {...register("price", { valueAsNumber: true })} />
              {errors.price && (
                <Text color="red" size="1">
                  {errors.price.message as string}
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Text as="div" size="2" mb="1" weight="medium">
                Product Image
              </Text>
              {!imageUrl ? (
                <div key="image-uploader-fixed">
                  <MediaUploader 
                    mediaType="image" 
                    setUrl={handleImageUrlChange}
                    setPublicId={setImagePublicId} 
                  />
                </div>
              ) : (
                <div className="relative w-full mb-2">
                  <img src={imageUrl} alt="Product" className="w-full h-48 object-cover rounded" />
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      size="1"
                      variant="soft"
                      onClick={() => {
                        preserveScroll(() => {
                          setImageUrl("");
                          setImagePublicId("");
                          setValue("imageUrl", "");
                        });
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              )}
              {errors.imageUrl && (
                <Text color="red" size="1">
                  {errors.imageUrl.message as string}
                </Text>
              )}
            </div>

            <div>
              <Text as="div" size="2" mb="1" weight="medium">
                Product Video
              </Text>
              {!videoUrl ? (
                <div key="video-uploader-fixed">
                  <MediaUploader 
                    mediaType="video" 
                    setUrl={handleVideoUrlChange}
                    setPublicId={setVideoPublicId} 
                  />
                </div>
              ) : (
                <div className="relative w-full mb-2">
                  <video src={videoUrl} controls className="w-full h-48 bg-black rounded" />
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      size="1"
                      variant="soft"
                      onClick={() => {
                        preserveScroll(() => {
                          setVideoUrl("");
                          setVideoPublicId("");
                          setValue("videoUrl", "");
                        });
                      }}
                    >
                      Change Video
                    </Button>
                  </div>
                </div>
              )}
              {errors.videoUrl && (
                <Text color="red" size="1">
                  {errors.videoUrl.message as string}
                </Text>
              )}
            </div>

            <div>
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
                <Text color="red" size="1">
                  {errors.specification?.message as string}
                </Text>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Update Product"}
              </Button>
              <Button type="button" variant="soft" color="gray" onClick={() => router.push("/admin/products")} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;
