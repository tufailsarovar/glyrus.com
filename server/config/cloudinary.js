// Glyrus — cloudinary.js

import { v2 as cloudinary } from "cloudinary";

const requiredVariables = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVariables =
  requiredVariables.filter(
    (variable) =>
      !process.env[variable]
  );

if (
  missingVariables.length > 0
) {
  console.warn(
    `Cloudinary configuration is incomplete. Missing: ${missingVariables.join(
      ", "
    )}`
  );
}

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

  secure: true,
});

/* =======================================================
   UPLOAD BUFFER TO CLOUDINARY
======================================================= */

export const uploadToCloudinary = (
  buffer,
  options = {}
) => {
  return new Promise(
    (resolve, reject) => {
      if (!buffer) {
        return reject(
          new Error(
            "Image buffer is required."
          )
        );
      }

      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              options.folder ||
              "Glyrus",

            resource_type:
              options.resource_type ||
              "image",

            ...options,
          },
          (
            error,
            result
          ) => {
            if (error) {
              return reject(error);
            }

            resolve(result);
          }
        );

      uploadStream.end(buffer);
    }
  );
};

/* =======================================================
   DELETE FILE FROM CLOUDINARY
======================================================= */

export const deleteFromCloudinary =
  async (
    publicId,
    options = {}
  ) => {
    if (!publicId) {
      return null;
    }

    const result =
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type:
            options.resource_type ||
            "image",

          invalidate:
            options.invalidate !==
            false,
        }
      );

    if (
      result.result ===
      "not found"
    ) {
      return result;
    }

    if (
      result.result !==
        "ok" &&
      result.result !==
        "not found"
    ) {
      throw new Error(
        `Cloudinary deletion failed for ${publicId}.`
      );
    }

    return result;
  };

/* =======================================================
   DEFAULT EXPORT
======================================================= */

export default cloudinary;