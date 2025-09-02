
export type Product = {
  id: number;
  name: string;
  vendor: string;
  price: string;
  image: string;
  rating: number;
  customizable: boolean;
  featured?: boolean;
  description?: string;
  category?: string;
};
