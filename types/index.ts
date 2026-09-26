export interface CartLine {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface MenuItemDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  isHotSeller: boolean;
  isTopSelling: boolean;
  isRestaurantSpecial: boolean;
  specialDiscountPercent: number;
  specialDiscountDate: string | null;
  prepTime: number;
  categoryId: string;
  likeCount?: number;
  likedByVisitor?: boolean;
  dailyOrderCount?: number;
  isTopSellingToday?: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItemDTO[];
}
