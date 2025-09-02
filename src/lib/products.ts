
export type Product = {
  id: number;
  name: string;
  vendor: string;
  price: string;
  image: string;
  galleryImages?: string[];
  videoUrl?: string;
  rating: number;
  stock: number;
  customizable: boolean;
  featured?: boolean;
  description?: string;
  creatorStory?: string;
  category?: string;
};
