import { useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { flyToCart } from '../animations/fly';

export default function useAddToBag() {
  const { addToCart, open } = useStore();
  return useCallback(async (product, { size, qty = 1, imgEl, openDrawer = true } = {}) => {
    const s = size || product.sizes[0];
    await flyToCart(imgEl);
    addToCart(product.id, s, qty);
    if (openDrawer) setTimeout(() => open('cartOpen', true), 120);
  }, [addToCart, open]);
}
