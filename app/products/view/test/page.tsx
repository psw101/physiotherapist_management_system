"use client";
import { Button, Card, Flex, Heading, Text, Badge, AspectRatio, Box } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

// Define product type
interface Product {
  id: number;
  productName: string;
  price: number;
  description: string;
  specification: any;
  imageURL: string | null;
}

const ViewProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/products");
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Sample products for development
  const sampleProducts: Product[] = [
    {
      id: 1,
      productName: "Professional Massage Table",
      price: 24999,
      description: "Premium quality massage table with adjustable height and comfortable padding.",
      specification: { dimensions: "185 x 70 cm", weight: "12kg" },
      imageURL: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2748&auto=format&fit=crop",
    },
    {
      id: 2,
      productName: "Therapeutic Exercise Ball",
      price: 2999,
      description: "Anti-burst exercise ball for balance training and physiotherapy exercises.",
      specification: { diameter: "65 cm", material: "PVC" },
      imageURL: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2940&auto=format&fit=crop",
    },
    {
      id: 3,
      productName: "TENS Unit & Muscle Stimulator",
      price: 7999,
      description: "Electrical nerve stimulation device for pain relief and muscle rehabilitation.",
      specification: { modes: "8 programs", battery: "Rechargeable" },
      imageURL: "https://images.pexels.com/photos/6823517/pexels-photo-6823517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 4,
      productName: "Manual Therapy Tools Set",
      price: 12999,
      description: "Complete set of high-quality tools for soft tissue mobilization.",
      specification: { includes: "5 tools", material: "Stainless steel" },
      imageURL: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2748&auto=format&fit=crop",
    },
    {
      id: 5,
      productName: "Advanced Ultrasound Therapy Device",
      price: 89999,
      description: "Clinical-grade ultrasound device for deep tissue treatment and accelerated healing.",
      specification: { frequency: "1 MHz & 3 MHz", modes: "Continuous & Pulsed" },
      imageURL: "https://plus.unsplash.com/premium_photo-1661281366900-2fdcaf90aec2?q=80&w=2752&auto=format&fit=crop",
    },
    {
      id: 6,
      productName: "Balance Board",
      price: 4999,
      description: "Wooden balance board for proprioception training and rehabilitation.",
      specification: { material: "Premium wood", maxWeight: "150kg" },
      imageURL: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1926&auto=format&fit=crop",
    },
  ];

  // Use sample products during development, switch to actual products when API is ready
  const displayProducts = products.length > 0 ? products : sampleProducts;

  if (loading && products.length === 0) {
    return <div className="flex justify-center p-12">Loading products...</div>;
  }

  if (error) {
    return <div className="flex justify-center p-12 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Heading size="6" className="mb-8 text-center">
        Physical Therapy Products
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProducts.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id} className="no-underline">
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <AspectRatio ratio={16 / 9}>
                {product.imageURL ? (
                  <div className="relative h-full w-full">
                    <Image src={product.imageURL} alt={product.productName} fill className="object-cover rounded-t-md" />
                  </div>
                ) : (
                  <div className="bg-gray-200 flex items-center justify-center h-full">
                    <Text color="gray">No image available</Text>
                  </div>
                )}
              </AspectRatio>

              <Box className="p-4">
                <Flex justify="between" align="center">
                  <Heading size="3" className="line-clamp-1">
                    {product.productName}
                  </Heading>
                  <Badge size="1" variant="soft" color="green">
                    In Stock
                  </Badge>
                </Flex>

                <Text as="p" className="mt-2 text-gray-600 line-clamp-2" size="2">
                  {product.description}
                </Text>

                <Flex className="mt-4" justify="between" align="center">
                  <Text weight="bold" size="5">
                    Rs. {product.price.toLocaleString()}
                  </Text>
                  <Button size="2" variant="soft">
                    View Details
                  </Button>
                </Flex>
              </Box>
            </Card>
          </Link>
        ))}
      </div>
    </div>
    
  );
};

export default ViewProductsPage;
