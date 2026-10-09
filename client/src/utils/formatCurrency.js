// Glyrus — formatCurrency.js
const formatCurrency = (amount = 0, currency = "INR") => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return currency === "INR" ? "₹0" : "0";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return currency === "INR"
      ? `₹${Math.round(numericAmount).toLocaleString("en-IN")}`
      : `${Math.round(numericAmount).toLocaleString("en-IN")}`;
  }
};

export default formatCurrency;