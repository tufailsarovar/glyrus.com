// Glyrus — ProductVideo.jsx
import React, { useState } from "react";
import {
  PlayArrowRounded,
  PauseRounded,
  VolumeOffRounded,
  VolumeUpRounded,
  FullscreenRounded,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const ProductVideo = ({ product }) => {
  const videoUrl =
    product?.video ||
    product?.videoUrl ||
    product?.productVideo ||
    "";

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!videoUrl) return null;

  const handlePlayPause = (event) => {
    event.stopPropagation();

    const video = event.currentTarget
      .closest("[data-product-video]")
      ?.querySelector("video");

    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleMute = (event) => {
    event.stopPropagation();

    const video = event.currentTarget
      .closest("[data-product-video]")
      ?.querySelector("video");

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleFullscreen = (event) => {
    event.stopPropagation();

    const wrapper = event.currentTarget.closest(
      "[data-product-video]"
    );

    const video = wrapper?.querySelector("video");

    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }

    if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {});
    } else if (wrapper?.requestFullscreen) {
      wrapper.requestFullscreen().catch(() => {});
    }
  };

  return (
    <MotionBox
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      sx={{
        width: "100%",
        minWidth: 0,
        mt: {
          xs: 2,
          sm: 2.5,
          md: 3,
        },
      }}
    >
      <Box
        data-product-video
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          borderRadius: {
            xs: "17px",
            sm: "21px",
            md: "24px",
          },
          backgroundColor: "#111111",
          boxShadow:
            "0 12px 38px rgba(17,17,17,0.10)",
          "&:hover .video-controls": {
            opacity: 1,
          },
        }}
      >
        {/* Video */}
        <Box
          component="video"
          src={videoUrl}
          muted
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={(event) =>
            setIsMuted(event.currentTarget.muted)
          }
          sx={{
            display: "block",
            width: "100%",
            maxHeight: {
              xs: 280,
              sm: 380,
              md: 500,
            },
            aspectRatio: "16 / 9",
            objectFit: "cover",
            backgroundColor: "#111111",
          }}
        />

        {/* Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.14) 0%, transparent 35%, rgba(0,0,0,0.58) 100%)",
          }}
        />

        {/* Top Label */}
        <Box
          sx={{
            position: "absolute",
            top: {
              xs: 11,
              sm: 15,
            },
            left: {
              xs: 11,
              sm: 15,
            },
            px: {
              xs: 1,
              sm: 1.25,
            },
            py: {
              xs: 0.5,
              sm: 0.65,
            },
            borderRadius: "999px",
            backgroundColor:
              "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography
            sx={{
              color: "#171717",
              fontSize: {
                xs: 9,
                sm: 10,
              },
              fontWeight: 850,
              letterSpacing: "0.3px",
            }}
          >
            PRODUCT VIDEO
          </Typography>
        </Box>

        {/* Center Play Button */}
        {!isPlaying && (
          <IconButton
            aria-label="Play product video"
            onClick={handlePlayPause}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: 54,
                sm: 64,
                md: 72,
              },
              height: {
                xs: 54,
                sm: 64,
                md: 72,
              },
              color: "#111111",
              background:
                "linear-gradient(135deg, #FFD900, #F1AA00)",
              boxShadow:
                "0 12px 30px rgba(0,0,0,0.20)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #FFD900, #F1AA00)",
                transform:
                  "translate(-50%, -50%) scale(1.06)",
              },
            }}
          >
            <PlayArrowRounded
              sx={{
                ml: 0.4,
                fontSize: {
                  xs: 28,
                  sm: 34,
                  md: 38,
                },
              }}
            />
          </IconButton>
        )}

        {/* Controls */}
        <Stack
          className="video-controls"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            position: "absolute",
            left: {
              xs: 9,
              sm: 13,
            },
            right: {
              xs: 9,
              sm: 13,
            },
            bottom: {
              xs: 8,
              sm: 11,
            },
            opacity: {
              xs: 1,
              md: 0,
            },
            transition: "opacity 180ms ease",
          }}
        >
          <Stack direction="row" spacing={0.5}>
            <IconButton
              aria-label={
                isPlaying
                  ? "Pause video"
                  : "Play video"
              }
              onClick={handlePlayPause}
              sx={controlButtonStyles}
            >
              {isPlaying ? (
                <PauseRounded />
              ) : (
                <PlayArrowRounded />
              )}
            </IconButton>

            <IconButton
              aria-label={
                isMuted
                  ? "Unmute video"
                  : "Mute video"
              }
              onClick={handleMute}
              sx={controlButtonStyles}
            >
              {isMuted ? (
                <VolumeOffRounded />
              ) : (
                <VolumeUpRounded />
              )}
            </IconButton>
          </Stack>

          <IconButton
            aria-label="Fullscreen video"
            onClick={handleFullscreen}
            sx={controlButtonStyles}
          >
            <FullscreenRounded />
          </IconButton>
        </Stack>
      </Box>

      {/* Caption */}
      <Typography
        sx={{
          mt: 1,
          color: "#858585",
          fontSize: {
            xs: 10.5,
            sm: 11.5,
            md: 12,
          },
          lineHeight: 1.5,
        }}
      >
        See the product design and details before placing
        your order.
      </Typography>
    </MotionBox>
  );
};

const controlButtonStyles = {
  width: {
    xs: 34,
    sm: 38,
  },
  height: {
    xs: 34,
    sm: 38,
  },
  color: "#FFFFFF",
  backgroundColor: "rgba(17,17,17,0.72)",
  backdropFilter: "blur(8px)",
  "&:hover": {
    backgroundColor: "rgba(17,17,17,0.9)",
  },
  "& svg": {
    fontSize: {
      xs: 18,
      sm: 20,
    },
  },
};

export default ProductVideo;