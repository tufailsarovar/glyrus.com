// Glyrus — CartContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "Glyrus_cart";

const normalizeQuantity = (quantity) => {
  const value = Number(quantity);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
};

const getProductId = (product) =>
  product?._id ||
  product?.id ||
  product?.productId ||
  product?.product?._id ||
  product?.product?.id;

const getProductPrice = (product) =>
  Number(
    product?.finalPrice ??
      product?.salePrice ??
      product?.discountPrice ??
      product?.price ??
      0,
  );

const getImageUrl = (value) => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === "object") {
    return value.url || value.secure_url || value.src || value.imageUrl || "";
  }

  return "";
};

const getProductImage = (product) => {
  const candidates = [
    product?.image,
    product?.imageUrl,
    product?.thumbnail,
    product?.coverUrl,
    product?.coverImage,
    product?.images?.[0],
    product?.product?.image,
    product?.product?.imageUrl,
    product?.product?.thumbnail,
    product?.product?.images?.[0],
  ];

  for (const candidate of candidates) {
    const imageUrl = getImageUrl(candidate);

    if (imageUrl) {
      return imageUrl;
    }
  }

  return "";
};

const createCartItem = (product, quantity, customization) => {
  const productId = getProductId(product);
  const image = getProductImage(product);

  return {
    ...product,

    _id: product?._id || productId,
    id: product?.id || productId,
    productId,

    name: product?.name || product?.title || "Glyrus Product",
    title: product?.title || product?.name || "Glyrus Product",

    image,
    imageUrl: product?.imageUrl || image,
    thumbnail: product?.thumbnail || image,

    price: getProductPrice(product),
    quantity: normalizeQuantity(quantity),
    customization: customization || product?.customization || null,
  };
};

const getCustomizationKey = (customization) => {
  if (!customization) return "";

  try {
    return JSON.stringify(customization);
  } catch {
    return String(customization);
  }
};

const getCartItemKey = (item) => {
  const productId =
    item?.productId ||
    item?._id ||
    item?.id ||
    item?.product?._id ||
    item?.product?.id ||
    item?.name;

  return `${productId || "product"}-${getCustomizationKey(
    item?.customization,
  )}`;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);

      if (!storedCart) return [];

      const parsedCart = JSON.parse(storedCart);

      if (Array.isArray(parsedCart)) {
        return parsedCart.map((item) =>
          createCartItem(item, item?.quantity, item?.customization),
        );
      }

      if (Array.isArray(parsedCart?.items)) {
        return parsedCart.items.map((item) =>
          createCartItem(item, item?.quantity, item?.customization),
        );
      }

      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage errors.
    }
  }, [items]);

  const addToCart = useCallback(
    (product, quantity = null, customization = null) => {
      if (!product) return;

      const productId = getProductId(product);

      if (!productId) return;

      const requestedQuantity =
        quantity !== null && quantity !== undefined
          ? quantity
          : (product?.quantity ?? 1);

      const newQuantity = normalizeQuantity(requestedQuantity);

      const newItem = createCartItem(product, newQuantity, customization);

      const newKey = getCartItemKey(newItem);

      setItems((currentItems) => {
        const existingIndex = currentItems.findIndex(
          (item) => getCartItemKey(item) === newKey,
        );

        if (existingIndex === -1) {
          return [...currentItems, newItem];
        }

        return currentItems.map((item, index) => {
          if (index !== existingIndex) {
            return item;
          }

          return {
            ...item,
            quantity: normalizeQuantity(item.quantity) + newQuantity,
          };
        });
      });
    },
    [],
  );

  const removeFromCart = useCallback((productOrId, customization = null) => {
    const productId =
      typeof productOrId === "string" ? productOrId : getProductId(productOrId);

    const customizationKey = getCustomizationKey(customization);

    setItems((currentItems) =>
      currentItems.filter((item) => {
        const itemId =
          item?.productId ||
          item?._id ||
          item?.id ||
          item?.product?._id ||
          item?.product?.id;

        if (String(itemId) !== String(productId)) {
          return true;
        }

        if (!customizationKey) {
          return false;
        }

        return getCustomizationKey(item?.customization) !== customizationKey;
      }),
    );
  }, []);

  const updateQuantity = useCallback(
    (productOrId, quantity, customization = null) => {
      const productId =
        typeof productOrId === "string"
          ? productOrId
          : getProductId(productOrId);

      const nextQuantity = normalizeQuantity(quantity);
      const customizationKey = getCustomizationKey(customization);

      setItems((currentItems) =>
        currentItems
          .map((item) => {
            const itemId =
              item?.productId ||
              item?._id ||
              item?.id ||
              item?.product?._id ||
              item?.product?.id;

            if (String(itemId) !== String(productId)) {
              return item;
            }

            if (
              customizationKey &&
              getCustomizationKey(item?.customization) !== customizationKey
            ) {
              return item;
            }

            return {
              ...item,
              quantity: nextQuantity,
            };
          })
          .filter((item) => normalizeQuantity(item.quantity) > 0),
      );
    },
    [],
  );

  const increaseQuantity = useCallback(
    (productOrId, amount = 1, customization = null) => {
      const productId =
        typeof productOrId === "string"
          ? productOrId
          : getProductId(productOrId);

      const customizationKey = getCustomizationKey(customization);

      setItems((currentItems) =>
        currentItems.map((item) => {
          const itemId =
            item?.productId ||
            item?._id ||
            item?.id ||
            item?.product?._id ||
            item?.product?.id;

          if (String(itemId) !== String(productId)) {
            return item;
          }

          if (
            customizationKey &&
            getCustomizationKey(item?.customization) !== customizationKey
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              normalizeQuantity(item.quantity) + normalizeQuantity(amount),
          };
        }),
      );
    },
    [],
  );

  const decreaseQuantity = useCallback(
    (productOrId, amount = 1, customization = null) => {
      const productId =
        typeof productOrId === "string"
          ? productOrId
          : getProductId(productOrId);

      const customizationKey = getCustomizationKey(customization);

      setItems((currentItems) =>
        currentItems
          .map((item) => {
            const itemId =
              item?.productId ||
              item?._id ||
              item?.id ||
              item?.product?._id ||
              item?.product?.id;

            if (String(itemId) !== String(productId)) {
              return item;
            }

            if (
              customizationKey &&
              getCustomizationKey(item?.customization) !== customizationKey
            ) {
              return item;
            }

            return {
              ...item,
              quantity: Math.max(
                0,
                normalizeQuantity(item.quantity) - normalizeQuantity(amount),
              ),
            };
          })
          .filter((item) => normalizeQuantity(item.quantity) > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const emptyCart = clearCart;
  const clear = clearCart;
  const removeAll = clearCart;

  const cartItems = items;

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + normalizeQuantity(item?.quantity),
        0,
      ),
    [items],
  );

  const totalItems = itemCount;

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const price = getProductPrice(item);
        const quantity = normalizeQuantity(item?.quantity);

        return total + price * quantity;
      }, 0),
    [items],
  );

  const totalPrice = subtotal;
  const cartTotal = subtotal;

  const getCartItem = useCallback(
    (productOrId, customization = null) => {
      const productId =
        typeof productOrId === "string"
          ? productOrId
          : getProductId(productOrId);

      const customizationKey = getCustomizationKey(customization);

      return items.find((item) => {
        const itemId =
          item?.productId ||
          item?._id ||
          item?.id ||
          item?.product?._id ||
          item?.product?.id;

        if (String(itemId) !== String(productId)) {
          return false;
        }

        if (!customizationKey) {
          return true;
        }

        return getCustomizationKey(item?.customization) === customizationKey;
      });
    },
    [items],
  );

  const isInCart = useCallback(
    (productOrId, customization = null) =>
      Boolean(getCartItem(productOrId, customization)),
    [getCartItem],
  );

  const value = useMemo(
    () => ({
      items,
      cartItems,

      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,

      clearCart,
      emptyCart,
      clear,
      removeAll,

      itemCount,
      totalItems,

      subtotal,
      totalPrice,
      cartTotal,

      getCartItem,
      isInCart,
    }),
    [
      items,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      emptyCart,
      clear,
      removeAll,
      itemCount,
      totalItems,
      subtotal,
      totalPrice,
      cartTotal,
      getCartItem,
      isInCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider.");
  }

  return context;
};

export default CartContext;
