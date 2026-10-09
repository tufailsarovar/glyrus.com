// Glyrus — generateTrackingNumber.js
const generateTrackingNumber = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < 6; i += 1) {
    const randomIndex = Math.floor(
      Math.random() * characters.length
    );

    code += characters[randomIndex];
  }

  return `Glyrus-${code}`;
};

export default generateTrackingNumber;