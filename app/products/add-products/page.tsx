"use client";
import React, { useState } from "react";
import { Button, Text, TextArea, TextField, Callout } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "../../api/validationSchemas";
import { z } from "zod";
import MediaUploader from "@/app/components/MediaUploader";
import SpecificationAdder from "@/app/components/SpecificationAdder";

export interface Product {
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

const ProductFormPage = () => {
  const router = useRouter();
  const [specs, setSpecs] = useState<Product["specification"]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  // For media uploads
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [publicId, setPublicId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<Product>();

  const onSubmit = async (data: Product) => {
    // Add image and video URLs to the form data
    data.imageUrl = imageUrl;
    data.videoUrl = videoUrl;
    try {
      setSubmitting(true);
      console.log("Form submitted:", data);

      await axios.post("/api/products", data);

      setError("Successfully added product");
      reset(); // Clear form after successful submission
      router.push("/products/add-products");
    } catch (error) {
      console.error("Error submitting product data:", error);
      setError("An unexpected error occurred while saving product data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

      {/* {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>} */}
      {error && (
        <Callout.Root variant="soft" color={error.includes("Successfully") ? "green" : "red"} className="mb-6">
          <Text size="2" weight="medium">
            {error}
          </Text>
        </Callout.Root>
      )}

      {/* Form */}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Product Name
          </Text>
          <TextField.Root placeholder="Enter product name" {...register("name")} />
          {errors.name && (
            <Text color="red" size="1">
              {errors.name.message}
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
              {errors.description.message}
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
              {errors.price.message}
            </Text>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Text as="div" size="2" mb="1" weight="medium">
            Product Image
          </Text>
          <MediaUploader mediaType="image" setUrl={setImageUrl} setPublicId={setPublicId} />
          {!imageUrl && (
            <Text size="1">
              Please upload a product image
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Product Video
          </Text>
          <MediaUploader mediaType="video" setUrl={setVideoUrl} />
          {!videoUrl && (
            <Text size="1">
              Please upload a product video
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
              {errors.specification.message}
            </Text>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Product"}
          </Button>
          <Button type="button" variant="soft" color="gray" onClick={() => reset()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
