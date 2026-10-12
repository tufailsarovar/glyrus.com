// Glyrus — orderService.js
import Product from "../models/Product.js";
import Settings from "../models/Settings.js";
import generateTrackingNumber from "../utils/generateTrackingNumber.js";

const DEFAULT_SHIPPING_CHARGE = 79;
const DEFAULT_FREE_SHIPPING_THRESHOLD = 999;
const DEFAULT_COD_CHARGE = 0;

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Customization",
  "Production",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

const PAYMENT_METHODS = ["COD", "RAZORPAY"];

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const roundMoney = (value) => Math.round(toNumber(value) * 100) / 100;

const normalizePaymentMethod = (value) => {
  const method = String(value || "COD")
    .trim()
    .toUpperCase();

  return PAYMENT_METHODS.includes(method) ? method : null;
};

const getSettings = async () => {
  const databaseSettings = await Settings.findOne({
    key: "store",
  }).lean();

  return {
    shippingCharge: Math.max(
      0,
      toNumber(databaseSettings?.shippingCharge, DEFAULT_SHIPPING_CHARGE),
    ),

    freeShippingThreshold: Math.max(
      0,
      toNumber(
        databaseSettings?.freeShippingThreshold,
        DEFAULT_FREE_SHIPPING_THRESHOLD,
      ),
    ),

    codCharge: Math.max(
      0,
      toNumber(databaseSettings?.codCharge, DEFAULT_COD_CHARGE),
    ),

    codEnabled: databaseSettings?.codEnabled !== false,

    razorpayEnabled: databaseSettings?.razorpayEnabled !== false,
  };
};

const cleanString = (value, maxLength = 500) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
};

const normalizeCustomer = (customer = {}, address = {}) => {
  const source = Object.keys(customer).length > 0 ? customer : address;

  return {
    name: cleanString(source.name, 100),
    email: cleanString(source.email, 150).toLowerCase(),
    mobile: cleanString(source.mobile, 20),
  };
};

const normalizeAddress = (address = {}, customer = {}) => ({
  name: cleanString(address.name, 100) || cleanString(customer.name, 100),

  email:
    cleanString(address.email, 150).toLowerCase() ||
    cleanString(customer.email, 150).toLowerCase(),

  mobile: cleanString(address.mobile, 20) || cleanString(customer.mobile, 20),

  house: cleanString(address.house || address.houseFlat, 200),

  street: cleanString(address.street, 250),

  area: cleanString(address.area, 250),

  city: cleanString(address.city, 100),

  state: cleanString(address.state, 100),

  pincode: cleanString(address.pincode, 10),
});

const normalizeCustomization = (customization) => {
  if (customization === null || customization === undefined) {
    return undefined;
  }

  if (typeof customization === "string") {
    return cleanString(customization, 2000);
  }

  if (typeof customization !== "object") {
    return undefined;
  }

  const result = {};

  Object.entries(customization).forEach(([key, value]) => {
    if (key.startsWith("$") || key.includes(".")) {
      return;
    }

    if (typeof value === "string") {
      result[key] = cleanString(value, 500);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      result[key] = value;
    } else if (typeof value === "boolean") {
      result[key] = value;
    }
  });

  return result;
};


const getProductPrice = (product) => {
  const regularPrice = toNumber(product?.price, 0);
  const discountPrice = toNumber(product?.discountPrice, 0);
  const sellingPrice = toNumber(
    product?.itemPrices?.sellingPrice,
    0
  );
  const itemPrice = toNumber(
    product?.itemPrices?.price,
    0
  );

  // Use a valid discounted price when available.
  if (
    discountPrice > 0 &&
    (regularPrice <= 0 || discountPrice < regularPrice)
  ) {
    return discountPrice;
  }

  if (regularPrice > 0) {
    return regularPrice;
  }

  if (sellingPrice > 0) {
    return sellingPrice;
  }

  if (itemPrice > 0) {
    return itemPrice;
  }

  return 0;
};


const getProductName = (product) =>
  cleanString(product?.title || product?.name || "Glyrus Product", 150);

const getProductImage = (product) => {
  if (typeof product?.image === "string") {
    return product.image;
  }

  if (typeof product?.imageUrl === "string") {
    return product.imageUrl;
  }

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const first = product.images[0];

    if (typeof first === "string") {
      return first;
    }

    if (first && typeof first.url === "string") {
      return first.url;
    }
  }

  return "";
};

const getProductStock = (product) => {
  if (product?.stock === undefined || product?.stock === null) {
    return null;
  }

  const stock = Number(product.stock);

  return Number.isFinite(stock) ? stock : null;
};

const generateUniqueOrderNumber = async () => {
  let orderNumber;

  const Order = (await import("../models/Order.js")).default;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const timestamp = Date.now().toString(36).toUpperCase();

    const random = Math.floor(1000 + Math.random() * 9000);

    orderNumber = `Glyrus-${timestamp}-${random}`;

    const exists = await Order.exists({
      orderNumber,
    });

    if (!exists) {
      return orderNumber;
    }
  }

  throw new Error("Unable to generate a unique order number.");
};

const generateUniqueTrackingNumber = async () => {
  const Order = (await import("../models/Order.js")).default;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const trackingNumber = generateTrackingNumber();

    const exists = await Order.exists({
      trackingNumber,
    });

    if (!exists) {
      return trackingNumber;
    }
  }

  throw new Error("Unable to generate a unique tracking number.");
};

export const calculateOrderPricing = async ({
  items = [],
  couponCode = "",
  paymentMethod = "COD",
  settings = {},
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("At least one product is required.");

    error.statusCode = 400;

    throw error;
  }

  const configured = await getSettings();

  const mergedSettings = {
    ...configured,
    ...settings,
  };

  const normalizedMethod = normalizePaymentMethod(paymentMethod);

  if (!normalizedMethod) {
    const error = new Error("Invalid payment method.");

    error.statusCode = 400;

    throw error;
  }

  if (normalizedMethod === "COD" && !mergedSettings.codEnabled) {
    const error = new Error("Cash on Delivery is currently unavailable.");

    error.statusCode = 400;

    throw error;
  }

  if (normalizedMethod === "RAZORPAY" && !mergedSettings.razorpayEnabled) {
    const error = new Error("Razorpay payment is currently unavailable.");

    error.statusCode = 400;

    throw error;
  }

  const productIds = [
    ...new Set(
      items
        .map((item) => item?.productId || item?._id || item?.id)
        .filter(Boolean),
    ),
  ];

  if (productIds.length === 0) {
    const error = new Error("No valid products were provided.");

    error.statusCode = 400;

    throw error;
  }

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).lean();

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  const normalizedItems = [];

  let subtotal = 0;

  for (const requestedItem of items) {
    const productId =
      requestedItem?.productId || requestedItem?._id || requestedItem?.id;

    if (!productId) {
      const error = new Error("A cart item is missing its product ID.");

      error.statusCode = 400;

      throw error;
    }

    const product = productMap.get(String(productId));

    if (!product) {
      const error = new Error("One or more products are no longer available.");

      error.statusCode = 404;

      throw error;
    }

    if (product.isActive === false) {
      const error = new Error(
        `${getProductName(product)} is currently unavailable.`,
      );

      error.statusCode = 400;

      throw error;
    }

    const quantity = Math.floor(Number(requestedItem.quantity));

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      const error = new Error(
        `Invalid quantity for ${getProductName(product)}.`,
      );

      error.statusCode = 400;

      throw error;
    }

    const stock = getProductStock(product);

    if (stock !== null && quantity > stock) {
      const error = new Error(
        `${getProductName(product)} has only ${stock} item(s) available.`,
      );

      error.statusCode = 400;

      throw error;
    }

    const price = roundMoney(getProductPrice(product));

    if (price < 0) {
      const error = new Error(
        `Invalid price configured for ${getProductName(product)}.`,
      );

      error.statusCode = 500;

      throw error;
    }

    const itemTotal = roundMoney(price * quantity);

    subtotal = roundMoney(subtotal + itemTotal);

    normalizedItems.push({
      product: product._id,

      name: getProductName(product),

      image: getProductImage(product),

      price,

      quantity,

      customization: normalizeCustomization(requestedItem.customization),

      total: itemTotal,
    });
  }

  let discount = 0;

  // Coupon validation should be performed
  // against a dedicated coupon system when one
  // is introduced. Never trust a discount sent
  // from the client.
  if (couponCode && typeof couponCode === "string") {
    // Currently no coupon collection is part
    // of the Glyrus specification, so a client
    // supplied coupon cannot reduce the price.
    discount = 0;
  }

  const taxableSubtotal = Math.max(0, roundMoney(subtotal - discount));

  const shipping =
    taxableSubtotal >= Number(mergedSettings.freeShippingThreshold)
      ? 0
      : roundMoney(mergedSettings.shippingCharge);

 const codCharge =
  normalizedMethod === "COD"
    ? roundMoney(mergedSettings.codCharge)
    : 0;

const total = roundMoney(
  taxableSubtotal +
    shipping +
    codCharge
);

  return {
    items: normalizedItems,
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discount),
    shipping: roundMoney(shipping),
    codCharge,
    total,
    paymentMethod: normalizedMethod,
  };
};

export const createOrderData = async ({
  customer = {},
  address = {},
  items = [],
  paymentMethod = "COD",
  couponCode = "",
  notes = "",
}) => {
  const normalizedCustomer = normalizeCustomer(customer, address);

  const normalizedAddress = normalizeAddress(address, normalizedCustomer);

  const pricing = await calculateOrderPricing({
    items,
    couponCode,
    paymentMethod,
  });

  const orderNumber = await generateUniqueOrderNumber();

  const trackingNumber = await generateUniqueTrackingNumber();

  return {
    orderNumber,
    trackingNumber,

    customer: {
      name: normalizedCustomer.name,
      email: normalizedCustomer.email,
      mobile: normalizedCustomer.mobile,
    },

    address: normalizedAddress,

    items: pricing.items,

    pricing: {
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      shipping: pricing.shipping,
      codCharge: pricing.codCharge,
      total: pricing.total,
    },

    paymentMethod: pricing.paymentMethod,

    payment: {
      status: pricing.paymentMethod === "COD" ? "Pending" : "Pending",
      method: pricing.paymentMethod,
    },

    orderStatus: "Pending",

    shippingInformation: {
      courier: "",
      trackingId: "",
      trackingUrl: "",
      estimatedDelivery: null,
      notes: "",
    },

    notes: cleanString(notes, 2000),
  };
};

export const isValidOrderStatus = (status) => ORDER_STATUSES.includes(status);

export const isValidPaymentMethod = (method) =>
  PAYMENT_METHODS.includes(String(method || "").toUpperCase());

export const getOrderStatuses = () => [...ORDER_STATUSES];

export const getPaymentMethods = () => [...PAYMENT_METHODS];

export const getCustomerFromOrder = (order) =>
  normalizeCustomer(order?.customer || {}, order?.address || {});

export const getOrderEmail = (order) => getCustomerEmailFromOrder(order);

const getCustomerEmailFromOrder = (order) =>
  cleanString(
    order?.customer?.email || order?.address?.email || order?.email || "",
    150,
  ).toLowerCase();

export const getOrderTotal = (order) =>
  roundMoney(order?.pricing?.total ?? order?.totalAmount ?? order?.total ?? 0);

export const getTrackingNumber = (order) =>
  cleanString(order?.trackingNumber || "", 50);

export const canTransitionOrderStatus = (currentStatus, nextStatus) => {
  if (!isValidOrderStatus(currentStatus) || !isValidOrderStatus(nextStatus)) {
    return false;
  }

  if (currentStatus === nextStatus) {
    return true;
  }

  const terminalStatuses = ["Delivered", "Cancelled", "Returned", "Refunded"];

  if (terminalStatuses.includes(currentStatus)) {
    return false;
  }

  if (["Cancelled", "Returned", "Refunded"].includes(nextStatus)) {
    return true;
  }

  const currentIndex = ORDER_STATUSES.indexOf(currentStatus);

  const nextIndex = ORDER_STATUSES.indexOf(nextStatus);

  const normalStatuses = [
    "Pending",
    "Confirmed",
    "Customization",
    "Production",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  if (
    !normalStatuses.includes(currentStatus) ||
    !normalStatuses.includes(nextStatus)
  ) {
    return false;
  }

  return nextIndex === currentIndex + 1;
};

export const createTrackingPayload = (order) => ({
  orderNumber: order?.orderNumber || "",
  trackingNumber: order?.trackingNumber || "",
  orderStatus: order?.orderStatus || "Pending",
  customer: {
    name: order?.customer?.name || "",
  },
  shippingInformation: {
    courier: order?.shippingInformation?.courier || "",
    trackingId: order?.shippingInformation?.trackingId || "",
    trackingUrl: order?.shippingInformation?.trackingUrl || "",
    estimatedDelivery: order?.shippingInformation?.estimatedDelivery || null,
  },
  createdAt: order?.createdAt || null,
  updatedAt: order?.updatedAt || null,
});

export default {
  calculateOrderPricing,
  createOrderData,
  isValidOrderStatus,
  isValidPaymentMethod,
  getOrderStatuses,
  getPaymentMethods,
  getCustomerFromOrder,
  getOrderEmail,
  getOrderTotal,
  getTrackingNumber,
  canTransitionOrderStatus,
  createTrackingPayload,
};
