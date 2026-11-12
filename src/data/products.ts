import type { Product } from "@/types";

export const products: Product[] = [
  {
    productId: "full-cream-milk",
    name: "Full Cream Milk",
    category: "milk",
    unit: "litres",
    shelfLifeDays: 3,
  },
  {
    productId: "toned-milk",
    name: "Toned Milk",
    category: "milk",
    unit: "litres",
    shelfLifeDays: 3,
  },
  {
    productId: "butter",
    name: "Butter",
    category: "butter",
    unit: "kg",
    shelfLifeDays: 180,
  },
  {
    productId: "cheese",
    name: "Cheese",
    category: "cheese",
    unit: "kg",
    shelfLifeDays: 90,
  },
  {
    productId: "ice-cream",
    name: "Ice Cream",
    category: "ice-cream",
    unit: "packs",
    shelfLifeDays: 180,
  },
  {
    productId: "ghee",
    name: "Ghee",
    category: "ghee",
    unit: "kg",
    shelfLifeDays: 365,
  },
];
