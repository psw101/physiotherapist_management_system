"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Heading, Text, Flex, Card, Box, Button, Table, Tabs, IconButton } from "@radix-ui/themes";
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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

  // Redirect to Add Product page instead of showing dialog
  const handleAddProductClick = () => {
    router.push("/admin/products/add-products");
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
        {/* Changed to redirect instead of dialog */}
        <Button color="indigo" onClick={handleAddProductClick}>
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
    </Box>
  );
}
