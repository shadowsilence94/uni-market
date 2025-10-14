// This file contains shared type definitions for the application.

export interface Item {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string; // Changed from image_url
  rating: {
    rate: number;
    count: number;
  };
}