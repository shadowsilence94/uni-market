// This file contains shared type definitions for the application.
// Updated for Vercel deployment

export interface Item {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  image_url?: string;
  views?: number;
  tags?: string[];
  seller_id?: number;
  sellerId?: number;
  created_at?: string;
  updated_at?: string;
  rating?: {
    rate: number;
    count: number;
  };
  seller?: {
    id: number;
    name: string;
    is_verified: boolean;
    nationality: string;
  };
}
