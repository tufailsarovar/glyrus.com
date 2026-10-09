// Glyrus — useCart.js

import { useCallback, useMemo } from "react";
import {
  useCart as useCartContext,
} from "../context/CartContext";

const useCart = () => {
  const cart = useCartContext();

  const {
    items = [],
    cartItems = [],
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    emptyCart,
    clear,
    removeAll,
    itemCount = 0,
    totalItems = 0,
    subtotal = 0,
    totalPrice = 0,
    cartTotal = 0,
    getCartItem,
    isInCart,
  } = cart || {};

  const products = useMemo(
    () =>
      Array.isArray(items)
        ? items
        : Array.isArray(cartItems)
          ? cartItems
          : [],
    [items, cartItems]
  );

  const getQuantity = useCallback(
    (
      productOrId,
      customization = null
    ) => {
      if (
        typeof getCartItem !==
        "function"
      ) {
        return 0;
      }

      const item =
        getCartItem(
          productOrId,
          customization
        );

      return Number(
        item?.quantity || 0
      );
    },
    [getCartItem]
  );

  const hasItem = useCallback(
    (
      productOrId,
      customization = null
    ) => {
      if (
        typeof isInCart ===
        "function"
      ) {
        return isInCart(
          productOrId,
          customization
        );
      }

      return (
        getQuantity(
          productOrId,
          customization
        ) > 0
      );
    },
    [isInCart, getQuantity]
  );

  const safeClearCart =
    clearCart ||
    emptyCart ||
    clear ||
    removeAll ||
    (() => {});

  return {
    ...cart,

    items: products,
    cartItems: products,

    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,

    clearCart: safeClearCart,

    itemCount:
      Number(itemCount) || 0,

    totalItems:
      Number(totalItems) || 0,

    subtotal:
      Number(subtotal) || 0,

    totalPrice:
      Number(totalPrice) || 0,

    cartTotal:
      Number(cartTotal) || 0,

    getCartItem,
    isInCart: hasItem,
    getQuantity,
  };
};

/* Named export — required by Cart.jsx and ProductDetails.jsx */
export { useCart };

/* Default export */
export default useCart;