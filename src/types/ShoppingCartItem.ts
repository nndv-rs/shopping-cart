import type { Product } from '@/types/Product';

export type ShoppingCartItem = {
    product: Product;
    amount: number;
}
