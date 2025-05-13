"use client";
import ImageUploader from "@/app/components/UploadImage";
import { Button, Text, TextArea, TextField } from "@radix-ui/themes";
import React, { useState } from "react";
import { Label } from "radix-ui";
import SpecificationAdder from "@/app/components/SpecificationAdder";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import MediaUploader from "@/app/components/MediaUploader";

interface Specification {
  key: string;
  value: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  videoUrl: string;
  specification: Specification[];
}

const ProductFormPage = () => {
  const router = useRouter();
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  //For media uplaods
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [publicId, setPublicId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductForm>();

  const onSubmit = async (data: ProductForm) => {
    data.imageUrl = imageUrl;
    data.videoUrl = videoUrl;
    console.log("Form submitted:", data);
    try {
      setSubmitting(true);
      await axios.post("/api/products", data);
      router.push("/products/test2");
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitting(false);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-8">
      <Text>Product Name</Text>
      <TextField.Root placeholder="Search the docs…" {...register("name")} />
      <Text>Description</Text>
      <TextArea placeholder="Reply to comment…" {...register("description")} />
      <Text>Product Price</Text>
      <TextField.Root placeholder="Search the docs…" type="number" {...register("price")} />


      <div className="mb-8">
        <Text>Upload Image</Text>
        <MediaUploader mediaType="image" setUrl={setImageUrl} setPublicId={setPublicId} />
      </div>

      <div>
        <Text>Upload Video</Text>
        <MediaUploader mediaType="video" setUrl={setVideoUrl} />
      </div>

      <SpecificationAdder
        initialSpecs={specs}
        onChange={(newSpecs) => {
          setSpecs(newSpecs);
          setValue("specification", newSpecs);
        }}
      />
      <Button >Submit New Issue</Button>
    </form>
  );
};

export default ProductFormPage;
