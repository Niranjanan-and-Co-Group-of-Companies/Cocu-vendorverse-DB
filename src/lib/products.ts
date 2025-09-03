

export type ProductStatus = 'Live' | 'Draft' | 'Archived' | 'Pending Review' | 'Declined';

export type CustomizationSide = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type AllowedCustomizationType = 'Text' | 'AI Image' | 'Image Upload' | 'QR Code' | 'Clipart';

export interface TieredPrice {
  quantity: number;
  price: string; // e.g., "$42.00"
}

export interface CustomizationArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rect' | 'ellipse';
  label?: string;
  defaultFont?: string;
  defaultFontSize?: number;
  defaultColor?: string;
}

export interface ProductSide {
  image: string | null;
  areas: CustomizationArea[];
}


export type Product = {
  id: number;
  name: string;
  vendor: string; // Vendor Name
  vendorId: string;
  price: string;
  tieredPricing?: TieredPrice[];
  image: string; // This will now be the 'front' image from customizationSides
  galleryImages: string[];
  videoUrl?: string;
  rating: number;
  stock: number;
  moq?: number; // Minimum Order Quantity
  customizable: boolean;
  featured?: boolean;
  description?: string;
  creatorStory?: string;
  category?: string;
  status: ProductStatus;
  customizationSides: Record<CustomizationSide, ProductSide>;
  allowedCustomizations: AllowedCustomizationType[];
  weight: number;
  dimensions: { l: number, w: number, h: number };
  inventoryBuffer: number;
  tags: string[];
  preparationTime: { min: number, max: number };
  preparationTimeUnit: 'days' | 'hours';
};

    
