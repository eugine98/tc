"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Heart, Star } from "lucide-react";

export default function Loading() {
  const [isClient, setIsClient] = useState(false);

  // Only render floating elements on client-side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate floating elements only on client-side
  const renderFloatingElements = () => {
    if (!isClient) return null;

    return Array.from({ length: 15 }).map((_, i) => {
      const isHeart = i % 2 === 0;
      const size = Math.random() * 15 + 10;
      const colors = [
        "#FF61D2", // Pink
        "#FE9090", // Coral
        "#FFD166", // Yellow
        "#0BA4E0", // Blue
        "#7353E5", // Purple
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;
      const xOffset = Math.random() * 50 - 25;

      return (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left,
            top,
            color,
            opacity: 0.6,
          }}
          animate={{
            y: [0, -100],
            x: [0, xOffset],
            rotate: [0, Math.random() * 360],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0.8],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration,
            delay,
            ease: "easeInOut",
          }}
        >
          {isHeart ? (
            <Heart size={size} fill="currentColor" />
          ) : (
            <Star size={size} fill="currentColor" />
          )}
        </motion.div>
      );
    });
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: "#fff8f9",
        fontFamily: "var(--font-poppins, sans-serif)",
      }}
    >
      {/* Fun background with blob shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Colorful blob shapes */}
        <div
          className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{
            background: "linear-gradient(135deg, #FF61D2, #FE9090)",
            filter: "blur(80px)",
          }}
        ></div>
        <div
          className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{
            background: "linear-gradient(135deg, #0BA4E0, #7353E5)",
            filter: "blur(80px)",
          }}
        ></div>
        <div
          className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full opacity-10"
          style={{
            background: "linear-gradient(135deg, #FFD166, #FF9B85)",
            filter: "blur(60px)",
          }}
        ></div>
      </div>

      {/* Playful pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle, #333 1px, transparent 1px), radial-gradient(circle, #333 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        }}
      ></div>

      {/* Floating hearts and stars - only rendered client-side */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {renderFloatingElements()}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10"
      >
        <div className="mb-6 flex justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            }}
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
            style={{
              background: "linear-gradient(to right, #FF61D2, #7353E5)",
            }}
          >
            <Camera size={40} className="text-white z-10" />
            {/* Shine effect */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "200%", opacity: [0, 0.5, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 1,
              }}
              className="absolute inset-0 w-1/4 h-full opacity-30 skew-x-12"
              style={{
                backgroundImage:
                  "linear-gradient(to right, transparent, white, transparent)",
              }}
            />
          </motion.div>
        </div>

        <h2
          className="text-3xl font-bold mb-4"
          style={{
            background: "linear-gradient(to right, #FF61D2, #7353E5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "var(--font-dancing, cursive)",
          }}
        >
          Initializing Camera
        </h2>

        <p className="text-gray-600 mb-6">
          Please wait while we set up your camera...
        </p>

        <div className="flex justify-center items-center space-x-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full"
              style={{
                background:
                  i === 0 ? "#FF61D2" : i === 1 ? "#7353E5" : "#0BA4E0",
                boxShadow: `0 0 10px ${
                  i === 0 ? "#FF61D2" : i === 1 ? "#7353E5" : "#0BA4E0"
                }`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
                y: [0, -5, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Fun footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <div
          className="h-1 w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, #FF61D2, #0BA4E0, #FFD166, #7353E5, #FE9090)",
          }}
        ></div>
        <div className="py-4 px-6 flex justify-between items-center text-gray-500 text-xs bg-white/80 backdrop-blur-sm">
          <span>© {new Date().getFullYear()} Tanauan Clicks</span>
          <span>Made with ❤️ for couples</span>
        </div>
      </div>
    </div>
  );
}
