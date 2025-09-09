
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
}

export interface ProductVariant {
    id: string;
    colorName: string;
    colorHex: string;
    image: string | null; // The main image for this variant, used if not customizable
    customizationSides: Record<CustomizationSide, ProductSide>;
}


export type Product = {
  id: number;
  name: string;
  vendor: string; // Vendor Name
  vendorId: string;
  price: string;
  mrp: number;
  vendorSP: number;
  platformBufferRate: number;
  vendorCommissionRate: number;
  discountType?: 'Percentage' | 'Fixed Amount';
  discountValue?: number;
  tieredPricing?: TieredPrice[];
  image: string; // Main display image for the product
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
  customizationAreas: Record<CustomizationSide, CustomizationArea[]>;
  variants: ProductVariant[];
  mainVariantId: string | null; // ID of the variant whose image should be the main product image
  allowedCustomizations: AllowedCustomizationType[];
  packaging: {
    weight: number; // in grams
    dimensions: { l: number, w: number, h: number }; // in cm
  };
  inventoryBuffer: number;
  tags: string[];
  preparationTime: number; // in days
  platform: Platform;
  shipsFromPincode: string; 
  sku: string;
  hsnSac: string;
  taxRate: number; // as a percentage
  createdAt: any; 
  updatedAt: any;
};
