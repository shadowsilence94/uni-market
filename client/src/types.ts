// This file contains shared type definitions for the application.
// Updated for Vercel deployment

export interface User {
  id: number;
  name: string;
  email: string;
  nationality: string;
  is_ait_certified: boolean;
  role: string;
  is_verified: boolean;
  profile_picture?: string;
}

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
