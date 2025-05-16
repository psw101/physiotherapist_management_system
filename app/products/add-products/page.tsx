"use client";
import React, { useState, useEffect } from "react"; // Add useEffect
import { Button, Text, TextArea, TextField, Callout } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "../../api/validationSchemas";
import { z } from "zod";
import MediaUploader from "@/components/MediaUploader";
import SpecificationAdder from "@/components/SpecificationAdder";

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
    trigger, // Add trigger to validate on demand
  } = useForm<Product>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
  });

  // Update form values when media URLs change
  useEffect(() => {
    // Register these values with react-hook-form
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
    console.log("Form submitted:", data);
    try {
      setSubmitting(true);

      await axios.post("/api/products", data);

      setError("Successfully added product");
      setImageUrl("");
      setVideoUrl("");
      setSpecs([]);
      reset(); // Clear form after successful submission
      router.push("/products/add-products");
    } catch (error) {
      console.error("Error submitting product data:", error);
      setError("An unexpected error occurred while saving product data.");
    } finally {
      setSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation failed:", errors);
  };

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

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
          {/* Use the custom handler */}
          <MediaUploader mediaType="image" setUrl={handleImageUrlChange} setPublicId={setPublicId} />
          {errors.imageUrl && (
            <Text color="red" size="1">
              {errors.imageUrl.message}
            </Text>
          )}
        </div>

        <div>
          <Text as="div" size="2" mb="1" weight="medium">
            Product Video
          </Text>
          {/* Use the custom handler */}
          <MediaUploader mediaType="video" setUrl={handleVideoUrlChange} />
          {errors.videoUrl && (
            <Text color="red" size="1">
              {errors.videoUrl.message}
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
