// Glyrus — Product.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },

    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "NFC Products",
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      index: true,
    },

    images: {
      type: [imageSchema],
      default: [],
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    video: {
      url: {
        type: String,
        trim: true,
        default: "",
      },
      publicId: {
        type: String,
        trim: true,
        default: "",
      },
    },

    techStack: {
      type: [String],
      default: [],
    },

    features: {
      type: [String],
      default: [],
    },

    customizationEnabled: {
      type: Boolean,
      default: true,
    },

    customizationOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

/* -------------------------------------------------------
   NORMALIZE PRODUCT DATA
------------------------------------------------------- */

productSchema.pre("save", async function () {
  if (this.isNew || this.isModified("title") || !this.slug) {
    const baseSlug = (this.title || "product")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug || "product";
    let count = 1;

    while (
      await this.constructor.exists({
        slug,
        _id: { $ne: this._id },
      })
    ) {
      slug = `${baseSlug || "product"}-${count++}`;
    }

    this.slug = slug;
  }

  if (this.images?.length > 0 && !this.image) {
    this.image = this.images[0].url || "";
  }

  if (this.compareAtPrice && this.compareAtPrice < this.price) {
    this.compareAtPrice = 0;
  }
});

/* -------------------------------------------------------
   INDEXES
------------------------------------------------------- */

productSchema.index({
  title: "text",
  description: "text",
  category: "text",
});

productSchema.index({
  isActive: 1,
  isFeatured: 1,
  sortOrder: 1,
});

productSchema.index({
  category: 1,
  isActive: 1,
});

/* -------------------------------------------------------
   JSON TRANSFORM
------------------------------------------------------- */

productSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;

    delete returnedObject._id;
    delete returnedObject.__v;

    return returnedObject;
  },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
