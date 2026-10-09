// Glyrus — uploadMiddleware.js
import multer from "multer";

const MAX_FILE_SIZE =
  Number(process.env.MAX_UPLOAD_SIZE) ||
  5 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(
      new Error(
        "Only JPG, PNG, WEBP, and GIF images are allowed."
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
});

export const uploadSingleImage = (
  fieldName = "image"
) => upload.single(fieldName);

export const uploadProductImages =
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "image",
      maxCount: 1,
    },
  ]);

export default upload;