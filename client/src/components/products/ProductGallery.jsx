import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeftRounded,
  ChevronRightRounded,
  ZoomInRounded,
} from "@mui/icons-material";
import { Box, IconButton, Stack } from "@mui/material";

const MotionBox = motion(Box);

const ProductGallery = ({ product }) => {
  const getImageUrl = (image) => {
    if (!image) return "";

    if (typeof image === "string") {
      return image;
    }

    return (
      image?.url ||
      image?.secure_url ||
      image?.src ||
      image?.image ||
      ""
    );
  };

  const images = Array.isArray(product?.images)
    ? product.images
        .map(getImageUrl)
        .filter(Boolean)
    : [];

  const fallbackImage =
    getImageUrl(product?.image) ||
    getImageUrl(product?.thumbnail) ||
    "/placeholder-product.png";

  const galleryImages =
    images.length > 0
      ? [...new Set(images)]
      : [fallbackImage];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setActiveIndex(0);
    setZoom(false);
    setDirection(1);
  }, [product]);

  const activeImage =
    galleryImages[activeIndex] || fallbackImage;

  const previousImage = () => {
    if (galleryImages.length <= 1) return;

    setZoom(false);
    setDirection(-1);

    setActiveIndex((current) =>
      current === 0
        ? galleryImages.length - 1
        : current - 1
    );
  };

  const nextImage = () => {
    if (galleryImages.length <= 1) return;

    setZoom(false);
    setDirection(1);

    setActiveIndex((current) =>
      current === galleryImages.length - 1
        ? 0
        : current + 1
    );
  };

  const handleDragEnd = (_, info) => {
    const distance = info.offset.x;
    const velocity = info.velocity.x;

    if (
      distance < -55 ||
      velocity < -450
    ) {
      nextImage();
    } else if (
      distance > 55 ||
      velocity > 450
    ) {
      previousImage();
    }
  };

  const slideVariants = {
    enter: (slideDirection) => ({
      x:
        slideDirection > 0
          ? "100%"
          : "-100%",
      opacity: 0,
      scale: 0.985,
    }),

    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },

    exit: (slideDirection) => ({
      x:
        slideDirection > 0
          ? "-100%"
          : "100%",
      opacity: 0,
      scale: 0.985,
    }),
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
           {/* =====================================================
          MAIN GALLERY
      ===================================================== */}

      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: {
            xs: "1 / 1",
            sm: "1 / 0.96",
            md: "1 / 0.92",
          },
          overflow: "hidden",
          borderRadius: {
            xs: "16px",
            sm: "20px",
            md: "25px",
          },
          background:
            "linear-gradient(145deg,#FAFAFA 0%,#F2F2F2 100%)",
          border: "1px solid rgba(17,17,17,.065)",
          boxShadow: "0 10px 32px rgba(17,17,17,.055)",
          cursor: galleryImages.length > 1 ? "grab" : "default",
          touchAction: "pan-y",
          isolation: "isolate",
        }}
      >
        {/* IMAGE */}
        <AnimatePresence
          initial={false}
          custom={direction}
          mode="sync"
        >
          <motion.img
            key={`${activeImage}-${activeIndex}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: "spring",
                stiffness: 330,
                damping: 34,
                mass: 0.75,
              },
              opacity: {
                duration: 0.18,
              },
              scale: {
                duration: 0.24,
              },
            }}
            drag={galleryImages.length > 1 ? "x" : false}
            dragConstraints={{
              left: 0,
              right: 0,
            }}
            dragElastic={0.72}
            onDragEnd={handleDragEnd}
            src={activeImage}
            alt={
              product?.title ||
              product?.name ||
              "Glyrus product"
            }
            onError={(event) => {
              if (
                event.currentTarget.src !==
                `${window.location.origin}/placeholder-product.png`
              ) {
                event.currentTarget.src =
                  "/placeholder-product.png";
              }
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding:
                typeof window !== "undefined" &&
                window.innerWidth < 600
                  ? "10px"
                  : "26px",
              transform: "none",
              cursor: galleryImages.length > 1 ? "grab" : "default",
              userSelect: "none",
              WebkitUserDrag: "none",
            }}
          />
        </AnimatePresence>

        {/* PREVIOUS */}
        {galleryImages.length > 1 && (
          <MotionBox
            whileHover={{
              scale: 1.06,
              x: -1,
            }}
            whileTap={{
              scale: 0.9,
            }}
            sx={{
              position: "absolute",
              left: {
                xs: 7,
                sm: 11,
              },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 8,
            }}
          >
            <IconButton
              aria-label="Previous product image"
              onClick={(event) => {
                event.stopPropagation();
                previousImage();
              }}
              sx={{
                width: {
                  xs: 33,
                  sm: 39,
                },
                height: {
                  xs: 33,
                  sm: 39,
                },
                color: "#111",
                bgcolor: "rgba(255,255,255,.94)",
                border: "1px solid rgba(17,17,17,.07)",
                boxShadow: "0 5px 18px rgba(0,0,0,.09)",
                backdropFilter: "blur(10px)",
                transition:
                  "background-color .18s ease,box-shadow .18s ease",
                "&:hover": {
                  bgcolor: "#FFD000",
                  boxShadow: "0 8px 22px rgba(0,0,0,.12)",
                },
              }}
            >
              <ChevronLeftRounded
                sx={{
                  fontSize: {
                    xs: 20,
                    sm: 24,
                  },
                }}
              />
            </IconButton>
          </MotionBox>
        )}

        {/* NEXT */}
        {galleryImages.length > 1 && (
          <MotionBox
            whileHover={{
              scale: 1.06,
              x: 1,
            }}
            whileTap={{
              scale: 0.9,
            }}
            sx={{
              position: "absolute",
              right: {
                xs: 7,
                sm: 11,
              },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 8,
            }}
          >
            <IconButton
              aria-label="Next product image"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              sx={{
                width: {
                  xs: 33,
                  sm: 39,
                },
                height: {
                  xs: 33,
                  sm: 39,
                },
                color: "#111",
                bgcolor: "rgba(255,255,255,.94)",
                border: "1px solid rgba(17,17,17,.07)",
                boxShadow: "0 5px 18px rgba(0,0,0,.09)",
                backdropFilter: "blur(10px)",
                transition:
                  "background-color .18s ease,box-shadow .18s ease",
                "&:hover": {
                  bgcolor: "#FFD000",
                  boxShadow: "0 8px 22px rgba(0,0,0,.12)",
                },
              }}
            >
              <ChevronRightRounded
                sx={{
                  fontSize: {
                    xs: 20,
                    sm: 24,
                  },
                }}
              />
            </IconButton>
          </MotionBox>
        )}

        {/* COUNTER */}
        {galleryImages.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              bottom: {
                xs: 9,
                sm: 12,
              },
              transform: "translateX(-50%)",
              px: {
                xs: 1,
                sm: 1.25,
              },
              py: {
                xs: 0.35,
                sm: 0.45,
              },
              borderRadius: "999px",
              bgcolor: "rgba(17,17,17,.68)",
              color: "#fff",
              backdropFilter: "blur(10px)",
              fontSize: {
                xs: 8.5,
                sm: 10,
              },
              fontWeight: 800,
              lineHeight: 1.2,
              pointerEvents: "none",
              zIndex: 7,
            }}
          >
            {activeIndex + 1} / {galleryImages.length}
          </Box>
        )}

        {/* DISCOUNT STYLE ACCENT */}
        <Box
          sx={{
            position: "absolute",
            left: {
              xs: 10,
              sm: 14,
            },
            top: {
              xs: 10,
              sm: 14,
            },
            width: {
              xs: 5,
              sm: 6,
            },
            height: {
              xs: 28,
              sm: 34,
            },
            borderRadius: "999px",
            background:
              "linear-gradient(180deg,#FFD000,#EAA600)",
            zIndex: 6,
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* =====================================================
          THUMBNAILS
      ===================================================== */}

      {galleryImages.length > 1 && (
        <Stack
          direction="row"
          spacing={{
            xs: 0.7,
            sm: 1,
          }}
          sx={{
            mt: {
              xs: 1,
              sm: 1.3,
            },
            width: "100%",
            overflowX: "auto",
            pb: 0.4,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {galleryImages.map(
            (image, index) => {
              const active =
                index === activeIndex;

              return (
                <MotionBox
                  key={`${image}-${index}`}
                  component="button"
                  type="button"
                  aria-label={`View product image ${
                    index + 1
                  }`}
                  onClick={() => {
                    setDirection(
                      index > activeIndex
                        ? 1
                        : -1
                    );
                    setActiveIndex(index);
                    setZoom(false);
                  }}
                  whileTap={{
                    scale: 0.94,
                  }}
                  whileHover={{
                    y: -2,
                  }}
                  sx={{
                    position:
                      "relative",
                    flex:
                      "0 0 auto",
                    width: {
                      xs: 52,
                      sm: 64,
                      md: 72,
                    },
                    height: {
                      xs: 52,
                      sm: 64,
                      md: 72,
                    },
                    p: 0,
                    overflow:
                      "hidden",
                    cursor:
                      "pointer",
                    borderRadius: {
                      xs: "9px",
                      sm: "11px",
                    },
                    border: active
                      ? "2px solid #F2B000"
                      : "1px solid rgba(17,17,17,.08)",
                    bgcolor:
                      "#F7F7F7",
                    opacity: active
                      ? 1
                      : 0.65,
                    boxShadow: active
                      ? "0 5px 15px rgba(242,176,0,.16)"
                      : "none",
                    transition:
                      "opacity .18s ease,border-color .18s ease,box-shadow .18s ease",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    alt={`Product thumbnail ${
                      index + 1
                    }`}
                    onError={(event) => {
                      event.currentTarget.src =
                        "/placeholder-product.png";
                    }}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit:
                        "cover",
                      display: "block",
                    }}
                  />

                  {active && (
                    <Box
                      sx={{
                        position:
                          "absolute",
                        left: "50%",
                        bottom: 2,
                        transform:
                          "translateX(-50%)",
                        width: 18,
                        height: 2,
                        borderRadius:
                          "999px",
                        bgcolor:
                          "#F2B000",
                      }}
                    />
                  )}
                </MotionBox>
              );
            }
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ProductGallery;