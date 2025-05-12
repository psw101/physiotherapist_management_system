"use client";
import ImageUploader from "@/app/components/UploadImage";
import { Button, Text, TextArea, TextField } from "@radix-ui/themes";
import React, { useState } from "react";
import { Label } from "radix-ui";
import SpecificationAdder from "@/app/components/SpecificationAdder";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Specification {
  key: string;
  value: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  image: File | null;
  video: File | null;
  specification: Specification[];
}

const ProductFormPage = () => {
  const router = useRouter();
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [specs, setSpecs] = useState<Specification[]>([{ key: "weight", value: "15 kg" }]);
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductForm>();

  const onSubmit = async (data: ProductForm) => {
    data.image = productImage;
    data.video = productVideo;
    console.log("Form submitted:", data);
    try {
      setSubmitting(true);
      await axios.post("/api/products", data);
      router.push("/products");
    } catch (error) {
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
      <TextField.Root placeholder="Search the docs…" {...register("price")} />

      <Text>Product Image</Text>
      <ImageUploader onChange={setProductImage} acceptedFileTypes="image/*" maxSizeMB={5} />

      <Text>Product Video</Text>
      <ImageUploader onChange={setProductVideo} acceptedFileTypes="video/*" maxSizeMB={20} />

      <SpecificationAdder
        initialSpecs={specs}
        onChange={(newSpecs) => {
          setSpecs(newSpecs);
          setValue("specification", newSpecs);
        }}
      />
      <Button>Submit New Issue</Button>
    </form>
  );
};

export default ProductFormPage;
