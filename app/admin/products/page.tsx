"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Heading, Text, Flex, Card, Box, Button, Dialog, Table, Tabs, IconButton } from "@radix-ui/themes";
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/app/api/validationSchemas";
import SpecificationAdder from "@/components/SpecificationAdder";
import { z } from "zod";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  specification: any;
  imageUrl: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type for cloudinary upload result
interface CloudinaryResult {
  info: {
    secure_url: string;
    public_id: string;
    resource_type: string;
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form state for new product
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [videoPublicId, setVideoPublicId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/products");
      setProducts(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploadSuccess = (result: CloudinaryResult) => {
    const url = result.info.secure_url;
    const publicId = result.info.public_id;

    setImageUrl(url);
    setImagePublicId(publicId);
    setValue("imageUrl", url);
    trigger("imageUrl");
  };

  const handleVideoUploadSuccess = (result: CloudinaryResult) => {
    const url = result.info.secure_url;
    const publicId = result.info.public_id;

    setVideoUrl(url);
    setVideoPublicId(publicId);
    setValue("videoUrl", url);
    trigger("videoUrl");
  };

  const handleAddProduct = async (data: z.infer<typeof productSchema>) => {
    try {
      setIsSubmitting(true);
      setFormError("");

      // Format the data as needed
      const productData = {
        ...data,
        specification: specs,
      };

      const response = await axios.post("/api/products", productData);

      // Add new product to the state
      setProducts([...products, response.data]);

      // Reset form and close dialog
      resetForm();
      setShowAddDialog(false);
    } catch (err) {
      console.error("Failed to add product:", err);
      setFormError("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setImageUrl("");
    setVideoUrl("");
    setImagePublicId("");
    setVideoPublicId("");
    setSpecs([]);
    setFormError("");
  };

  const handleCloseDialog = () => {
    resetForm();
    setShowAddDialog(false);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter((product) => product.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Box className="py-6">
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="6">Products Management</Heading>
        <Button color="indigo" onClick={() => setShowAddDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </Flex>

      <Tabs.Root defaultValue="list">
        <Tabs.List className="mb-4">
          <Tabs.Trigger value="list">Product List</Tabs.Trigger>
          <Tabs.Trigger value="grid">Grid View</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="list">
          <Card>
            {error ? (
              <Box className="p-4 text-center">
                <Text color="red">{error}</Text>
              </Box>
            ) : products.length === 0 ? (
              <Box className="p-8 text-center">
                <Text color="gray">No products found. Add your first product to get started.</Text>
              </Box>
            ) : (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Image</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Price (Rs.)</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {products.map((product) => (
                    <Table.Row key={product.id}>
                      <Table.Cell>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <Box className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded">
                            <PhotoIcon className="h-6 w-6 text-gray-500" />
                          </Box>
                        )}
                      </Table.Cell>
                      <Table.Cell>{product.name}</Table.Cell>
                      <Table.Cell>{product.price.toLocaleString()}</Table.Cell>
                      <Table.Cell>
                        <Text className="truncate max-w-xs">{product.description}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="2">
                          <IconButton
                            variant="soft"
                            size="1"
                            onClick={() => router.push(`/admin/products/edit-products?id=${product.id}`)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton variant="soft" color="red" size="1" onClick={() => handleDeleteProduct(product.id)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Card>
        </Tabs.Content>

        <Tabs.Content value="grid">
          <Box>
            {error ? (
              <Card className="p-4 text-center">
                <Text color="red">{error}</Text>
              </Card>
            ) : products.length === 0 ? (
              <Card className="p-8 text-center">
                <Text color="gray">No products found. Add your first product to get started.</Text>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="h-40 bg-gray-100 relative">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <PhotoIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <IconButton
                          variant="soft"
                          size="1"
                          className="bg-white bg-opacity-70"
                          onClick={() => router.push(`/admin/products/edit-products?id=${product.id}`)}
                        >
                          <PencilIcon className="h-3 w-3" />
                        </IconButton>
                        <IconButton variant="soft" color="red" size="1" className="bg-white bg-opacity-70" onClick={() => handleDeleteProduct(product.id)}>
                          <TrashIcon className="h-3 w-3" />
                        </IconButton>
                      </div>
                    </div>
                    <Box className="p-3">
                      <Flex justify="between" align="center" className="mb-1">
                        <Text weight="bold" size="2">
                          {product.name}
                        </Text>
                        <Text weight="bold" size="2" color="indigo">
                          Rs. {product.price.toLocaleString()}
                        </Text>
                      </Flex>
                      <Text size="1" color="gray" className="line-clamp-2">
                        {product.description}
                      </Text>
                    </Box>
                  </Card>
                ))}
              </div>
            )}
          </Box>
        </Tabs.Content>
      </Tabs.Root>

      {/* Add Product Dialog with official next-cloudinary widget */}
      <Dialog.Root open={showAddDialog} onOpenChange={setShowAddDialog}>
        <Dialog.Content style={{ maxWidth: 650 }}>
          <Dialog.Title>Add New Product</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Fill out the form below to add a new product to your inventory.
          </Dialog.Description>

          {/* Form with Cloudinary Widget */}
          <Box className="max-h-[70vh] overflow-y-auto pr-4">
            {formError && (
              <Box className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <Text size="2">{formError}</Text>
              </Box>
            )}

            <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-5">
              {Object.keys(errors).length > 0 && (
                <Box className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
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
                </Box>
              )}

              <Box>
                <Text as="div" size="2" mb="1" weight="medium">
                  Product Name
                </Text>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter product name" {...register("name")} />
                {errors.name && (
                  <Text color="red" size="1" className="mt-1">
                    {errors.name.message as string}
                  </Text>
                )}
              </Box>

              <Box>
                <Text as="div" size="2" mb="1" weight="medium">
                  Description
                </Text>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} placeholder="Enter product description" {...register("description")} />
                {errors.description && (
                  <Text color="red" size="1" className="mt-1">
                    {errors.description.message as string}
                  </Text>
                )}
              </Box>

              <Box>
                <Text as="div" size="2" mb="1" weight="medium">
                  Product Price
                </Text>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter product price" {...register("price", { valueAsNumber: true })} />
                {errors.price && (
                  <Text color="red" size="1" className="mt-1">
                    {errors.price.message as string}
                  </Text>
                )}
              </Box>

              {/* Cloudinary Image Upload */}
              <Box>
                <Text as="div" size="2" mb="1" weight="medium">
                  Product Image
                </Text>

                {imageUrl ? (
                  <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden mb-2">
                    <img src={imageUrl} alt="Product image" className="w-full h-full object-cover" />
                    <IconButton className="absolute top-2 right-2 bg-white bg-opacity-80" size="1" color="red" variant="soft" onClick={handleRemoveImage}>
                      <TrashIcon className="h-3 w-3" />
                    </IconButton>
                  </div>
                ) : (
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default"}
                    options={{
                      maxFiles: 1,
                      resourceType: "image",
                      clientAllowedFormats: ["jpg", "jpeg", "png", "gif"],
                      sources: ["local", "url", "camera"],
                    }}
                    onSuccess={handleImageUploadSuccess as any}

                  >
                    {({ open }) => (
                      <Button type="button" variant="outline" onClick={() => open()} className="w-full h-24 flex flex-col items-center justify-center border-dashed">
                        <PhotoIcon className="h-6 w-6 mb-2" />
                        <Text size="2">Select Product Image</Text>
                      </Button>
                    )}
                  </CldUploadWidget>
                )}

                {errors.imageUrl && (
                  <Text color="red" size="1" className="mt-1">
                    {errors.imageUrl.message as string}
                  </Text>
                )}
              </Box>

              {/* Cloudinary Video Upload */}
              <Box>
                <Text as="div" size="2" mb="1" weight="medium">
                  Product Video (Optional)
                </Text>

                {videoUrl ? (
                  <div className="relative w-full rounded-md overflow-hidden mb-2">
                    <video src={videoUrl} controls className="w-full h-48 bg-black" />
                    <IconButton className="absolute top-2 right-2 bg-white bg-opacity-80" size="1" color="red" variant="soft" onClick={handleRemoveVideo}>
                      <TrashIcon className="h-3 w-3" />
                    </IconButton>
                  </div>
                ) : (
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default"}
                    options={{
                      maxFiles: 1,
                      resourceType: "video",
                      clientAllowedFormats: ["mp4", "mov", "avi", "webm"],
                      sources: ["local", "url", "camera"],
                    }}
                    onSuccess={handleVideoUploadSuccess as any}
                  >
                    {({ open }) => (
                      <Button type="button" variant="outline" onClick={() => open()} className="w-full h-16 flex flex-col items-center justify-center border-dashed">
                        <Text size="2">Select Product Video (Optional)</Text>
                      </Button>
                    )}
                  </CldUploadWidget>
                )}

                {errors.videoUrl && (
                  <Text color="red" size="1" className="mt-1">
                    {errors.videoUrl.message as string}
                  </Text>
                )}
              </Box>

              <Box>
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
              </Box>
            </form>
          </Box>

          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={handleCloseDialog}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSubmit(handleAddProduct)} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
