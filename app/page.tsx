"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  Heart,
  Share2,
  Download,
  Star,
  Sparkles,
  QrCode,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Poppins, Dancing_Script } from "next/font/google";
import Image from "next/image";

// Font setup
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dancing",
});

export default function Home() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  // Only render floating elements on client-side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle navigation
  const handleClick = () => {
    try {
      router.push("/capture");
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = "/capture";
    }
  };

  // Track mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate floating elements only on client-side
  const renderFloatingElements = () => {
    if (!isClient) return null;

    return Array.from({ length: 20 }).map((_, i) => {
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
      ref={containerRef}
      onClick={handleClick}
      className={`${poppins.variable} ${dancingScript.variable} relative flex flex-col items-center justify-center min-h-screen cursor-pointer overflow-hidden`}
      style={{
        fontFamily: "var(--font-poppins)",
        backgroundColor: "#fff8f9",
        color: "#333",
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

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8">
        {/* Header with logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-12"
        >
          <div className="relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-cwIi6rhpSo5JmdsOkp6qYAOTgn7KBA.png"
              alt="Tanauan Clicks Logo"
              width={280}
              height={140}
              style={{
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
              }}
            />

            {/* Playful decorative elements */}
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: "easeInOut",
              }}
              className="absolute -top-6 -right-6"
              style={{ color: "#FF61D2" }}
            >
              <Sparkles size={24} />
            </motion.div>

            <motion.div
              animate={{
                rotate: [0, -10, 0, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                delay: 1,
                ease: "easeInOut",
              }}
              className="absolute -bottom-4 -left-6"
              style={{ color: "#0BA4E0" }}
            >
              <Heart size={20} fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>

        {/* Main content area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left side - Fun image collage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Image collage frame */}
            <div
              className="relative p-4 rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset",
              }}
            >
              {/* Collage grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Image 1 */}
                <div className="aspect-square rounded-2xl overflow-hidden group">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                    <Heart
                      size={40}
                      className="text-white group-hover:animate-spin animate-pulse"
                      fill="white"
                    />
                  </div>
                </div>

                {/* Image 2 */}
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                    <Camera size={40} className="text-white animate-bounce" />
                  </div>
                </div>

                {/* Image 3 */}
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                    <Star size={40} className="text-white" fill="white" />
                  </div>
                </div>

                {/* Image 4 with overlay text */}
                <div className="aspect-square rounded-2xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.8 }}
                      className="text-white/90 text-xs leading-tight"
                    >
                      Capture your special moments with
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                      className="text-white font-bold text-sm"
                      style={{ fontFamily: "var(--font-dancing)" }}
                    >
                      Tanauan Clicks
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div
                className="absolute top-2 left-2 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: "linear-gradient(135deg, #FF61D2, #FE9090)",
                  filter: "blur(20px)",
                }}
              ></div>
              <div
                className="absolute bottom-2 right-2 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: "linear-gradient(135deg, #0BA4E0, #7353E5)",
                  filter: "blur(20px)",
                }}
              ></div>
            </div>

            {/* Decorative stickers */}
            <motion.div
              animate={{
                rotate: [-10, 0, -10],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                ease: "easeInOut",
              }}
              className="absolute -top-6 -left-6 bg-white p-2 rounded-full shadow-lg"
              style={{
                transform: "rotate(-10deg)",
              }}
            >
              <Heart size={24} className="text-pink-500" fill="currentColor" />
            </motion.div>

            <motion.div
              animate={{
                rotate: [10, 0, 10],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: "easeInOut",
              }}
              className="absolute -bottom-6 -right-6 bg-white p-2 rounded-full shadow-lg group"
              style={{
                transform: "rotate(10deg)",
              }}
            >
              <Camera
                size={24}
                className="text-blue-500 group-hover:animate-spin"
              />
            </motion.div>
          </motion.div>

          {/* Right side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col"
          >
            {/* Main heading */}
            <h1
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #FF61D2, #7353E5)",
                fontFamily: "var(--font-dancing)",
              }}
            >
              Capture Your Special Moments
            </h1>

            {/* Description */}
            <p className="text-gray-700 mb-8 leading-relaxed">
              Create lasting memories with our fun and vibrant photobooth
              experience! Perfect for couples, friends, and anyone looking to
              celebrate life&apos;s special moments with style and creativity.
            </p>

            {/* Features with playful icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {[
                {
                  icon: <Camera size={18} />,
                  title: "Fun Filters",
                  desc: "Trendy photo effects",
                  color: "#FF61D2",
                },
                {
                  icon: <Download size={18} />,
                  title: "Instant Prints",
                  desc: "Take home memories",
                  color: "#0BA4E0",
                },
                {
                  icon: <QrCode size={18} />,
                  title: "Scan to Download",
                  desc: "Scan QR code and download your image",
                  color: "#7353E5",
                },
                {
                  icon: <Heart size={18} />,
                  title: "Couple Props",
                  desc: "Perfect for lovers",
                  color: "#FE9090",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="p-2 rounded-xl mt-1 shadow-md"
                    style={{
                      background: "white",
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative self-start"
            >
              {/* Button with fun gradient */}
              <div
                className="relative px-8 py-4 rounded-full text-white font-medium text-lg flex items-center gap-2 overflow-hidden shadow-lg"
                style={{
                  background: "linear-gradient(to right, #FF61D2, #7353E5)",
                }}
              >
                Start Your Experience
                <motion.div
                  animate={isHovering ? { x: [0, 5, 0] } : { x: 0 }}
                  transition={{
                    repeat: isHovering ? Number.POSITIVE_INFINITY : 0,
                    duration: 0.8,
                  }}
                >
                  <Heart size={18} fill="currentColor" />
                </motion.div>
                {/* Shine effect */}
                <motion.div
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={
                    isHovering
                      ? { x: "200%", opacity: [0, 0.5, 0] }
                      : { x: "-100%", opacity: 0 }
                  }
                  transition={{ duration: 1 }}
                  className="absolute inset-0 w-1/4 h-full opacity-30 skew-x-12"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, transparent, white, transparent)",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-center mt-16 text-gray-500 text-sm font-light"
        >
          Click anywhere to continue
        </motion.p>
      </div>

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
          <span>Made with ❤️ for you!</span>
        </div>
      </div>
    </div>
  );
}
