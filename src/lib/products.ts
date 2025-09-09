

export type ProductStatus = 'Live' | 'Draft' | 'Archived' | 'Pending Review' | 'Declined';

export type CustomizationSide = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type AllowedCustomizationType = 'Text' | 'AI Image' | 'Image Upload' | 'QR Code' | 'Clipart';
export type Platform = 'Personalized' | 'Corporate';

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
  // Areas are now defined at the top level
}

export interface ProductVariant {
    id: string;
    colorName: string;
    colorHex: string;
    image: string | null; // The main image for this variant
    customizationSides: Record<CustomizationSide, ProductSide>;
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
  maxQuantityPerOrder?: number; // Max quantity a customer can buy in a single order
  customizable: boolean;
  featured?: boolean;
  description?: string;
  creatorStory?: string;
  category?: string;
  status: ProductStatus;
  // Shared customization area definitions
  customizationAreas: Record<CustomizationSide, CustomizationArea[]>;
  variants: ProductVariant[];
  allowedCustomizations: AllowedCustomizationType[];
  weight: number;
  dimensions: { l: number, w: number, h: number };
  inventoryBuffer: number;
  tags: string[];
  preparationTime: { min: number, max: number };
  preparationTimeUnit: 'days' | 'hours';
  platform: Platform;
};

    
