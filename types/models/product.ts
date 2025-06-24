export interface Specification {
  key: string;
  value: string;
}

export interface CustomOption {
  label: string;
  placeholder?: string;
  required?: boolean;
}

// Base product interface (for shared properties)
// Base product interface (for shared properties)
export interface BaseProduct {
  name: string;
  price: number;
  description: string;
  specification: Specification[];
  customOptions?: CustomOption[]; // Making this optional to match schema
}

// Complete stored product (with required ID)
export interface Product extends BaseProduct {
  id: number;
  imageUrl?: string;
  videoUrl?: string;
  feedback?: any[];
}

// New product being created (no ID yet) - matches validation schema
export interface CreateProductDto extends Omit<BaseProduct, 'customOptions'> {
  id?: number;
  imageUrl: string;  // Required when creating
  videoUrl: string;  // Required when creating
  customOptions?: CustomOption[]; // Optional to match schema
}

// For forms and partial updates
export interface UpdateProductDto extends Partial<BaseProduct> {
  id?: number;
  imageUrl?: string;
  videoUrl?: string;
}
