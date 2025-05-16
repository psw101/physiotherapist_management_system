"use client";

import React, { useState, useEffect } from "react";
import { Button, Text, TextArea, TextField, Callout, Heading } from "@radix-ui/themes";
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

  // Custom image URL setter that also updates the form
  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setValue("imageUrl", url);
    // Trigger validation for this field
    trigger("imageUrl");
  };

  // Custom video URL setter that also updates the form
  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    setValue("videoUrl", url);
    // Trigger validation for this field
    trigger("videoUrl");
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
    <div className="p-6 max-w-xl">
      <Heading size="5" className="mb-6">Edit Product</Heading>

      {error && (
        <Callout.Root variant="soft" color={error.includes("Successfully") ? "green" : "red"} className="mb-6">
          <Text size="2" weight="medium">
            {error}
          </Text>
        </Callout.Root>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)} className="max-w-xl space-y-6">
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
          {imageUrl ? (
            <div className="relative w-full mb-2">
              <img src={imageUrl} alt="Product" className="w-full h-48 object-cover rounded" />
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  onClick={() => {
                    setImageUrl("");
                    setImagePublicId("");
                    setValue("imageUrl", "");
                  }}
                >
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            <MediaUploader mediaType="image" setUrl={handleImageUrlChange} setPublicId={setImagePublicId} />
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
          {videoUrl ? (
            <div className="relative w-full mb-2">
              <video src={videoUrl} controls className="w-full h-48 bg-black rounded" />
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  onClick={() => {
                    setVideoUrl("");
                    setVideoPublicId("");
                    setValue("videoUrl", "");
                  }}
                >
                  Change Video
                </Button>
              </div>
            </div>
          ) : (
            <MediaUploader mediaType="video" setUrl={handleVideoUrlChange} setPublicId={setVideoPublicId} />
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
  );
};

export default EditProductPage;
