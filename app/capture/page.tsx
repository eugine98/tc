"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Settings,
  X,
  Sparkles,
  Heart,
  Star,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";
import { Poppins, Dancing_Script } from "next/font/google";

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

// Add type declarations for parameters
interface CameraError extends Error {
  message: string;
}

// Add JSX namespace declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export default function CapturePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [numShots, setNumShots] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(localStorage.getItem("numShots") || "4");
    }
    return 4;
  });
  const [timerDelay, setTimerDelay] = useState<number>(3);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Only render floating elements on client-side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNumShots = localStorage.getItem("numShots");
      const savedTimerDelay = localStorage.getItem("timerDelay");
      const savedCameraId = localStorage.getItem("selectedCamera");

      if (savedNumShots) setNumShots(Number.parseInt(savedNumShots));
      if (savedTimerDelay) setTimerDelay(Number.parseInt(savedTimerDelay));
      if (savedCameraId) setSelectedCamera(savedCameraId);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("numShots", numShots.toString());
      localStorage.setItem("timerDelay", timerDelay.toString());
      if (selectedCamera) {
        localStorage.setItem("selectedCamera", selectedCamera);
      }
    }
  }, [numShots, timerDelay, selectedCamera]);

  // Initialize camera
  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        // Check if MediaDevices API is supported
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.enumerateDevices
        ) {
          throw new Error("MediaDevices API not supported in this browser");
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );

        if (cameras.length === 0) {
          toast({
            title: "No Cameras Found",
            description:
              "We couldn't find any cameras connected to your device.",
            variant: "destructive",
          });
          return;
        }

        setAvailableCameras(cameras);

        // If we have a saved camera ID and it's in the list, use it
        // Otherwise use the first camera
        const savedCameraId = localStorage.getItem("selectedCamera");
        const cameraExists = cameras.some(
          (camera) => camera.deviceId === savedCameraId
        );

        if (savedCameraId && cameraExists) {
          setSelectedCamera(savedCameraId);
          initializeCamera(savedCameraId);
        } else if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId);
          initializeCamera(cameras[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting cameras:", error);
        toast({
          title: "Camera Error",
          description:
            typeof error === "object" && error !== null && "message" in error
              ? String(error.message)
              : "Could not access cameras. Please check permissions.",
          variant: "destructive",
        });
      }
    };

    // Only run if we're in the browser
    if (typeof window !== "undefined") {
      getAvailableCameras();
    }

    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const initializeCamera = async (deviceId: string) => {
    try {
      // Stop any existing stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }

      // Check if MediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920 }, // Higher resolution for DSLR
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
          // Add support for external cameras
          facingMode: "environment",
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!stream) {
        throw new Error("Failed to get camera stream");
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Make sure the video can play
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((e: CameraError) => {
              console.error("Error playing video:", e);
              toast({
                title: "Video Playback Error",
                description: "Could not play the camera stream.",
                variant: "destructive",
              });
            });
          }
        };
      }
    } catch (error) {
      console.error("Error initializing camera:", error);
      toast({
        title: "Camera Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Could not access the selected camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    initializeCamera(deviceId);
  };

  const captureImage = () => {
    try {
      if (!videoRef.current) {
        throw new Error("Video element not found");
      }

      if (!canvasRef.current) {
        throw new Error("Canvas element not found");
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not get canvas context");
      }

      // Make sure video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Video has invalid dimensions");
      }

      // Downscale to 400x300 for storage
      const targetWidth = 400;
      const targetHeight = 300;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context.drawImage(video, 0, 0, targetWidth, targetHeight);

      const imageDataUrl = canvas.toDataURL("image/png", 0.7);
      return imageDataUrl;
    } catch (error) {
      console.error("Error capturing image:", error);
      toast({
        title: "Capture Error",
        description: "Failed to capture image from camera.",
        variant: "destructive",
      });
      return null;
    }
  };

  const startCapturing = async () => {
    try {
      setIsCapturing(true);
      setCapturedImages([]);
      setCurrentShotIndex(0);

      const newCapturedImages = [];

      for (let i = 0; i < numShots; i++) {
        setCurrentShotIndex(i);

        // Start countdown
        for (let time = timerDelay; time > 0; time--) {
          setCountdown(time);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setCountdown(null);
        const imageDataUrl = captureImage();
        if (imageDataUrl) {
          newCapturedImages.push(imageDataUrl);
        } else {
          throw new Error("Failed to capture image");
        }

        // Wait a bit between shots
        if (i < numShots - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (newCapturedImages.length === 0) {
        throw new Error("No images were captured");
      }

      setIsCapturing(false);

      // Check if this is a retake
      if (
        localStorage.getItem("originalImages") &&
        !localStorage.getItem("hasRetaken")
      ) {
        localStorage.setItem("retakeImages", JSON.stringify(newCapturedImages));
        localStorage.setItem("hasRetaken", "true");
      } else {
        localStorage.setItem(
          "originalImages",
          JSON.stringify(newCapturedImages)
        );
        localStorage.removeItem("hasRetaken");
        localStorage.removeItem("retakeImages");
      }
      localStorage.setItem("capturedImages", JSON.stringify(newCapturedImages));

      // Redirect to edit page
      router.push("/edit");
    } catch (error) {
      console.error("Error during capture process:", error);
      setIsCapturing(false);
      toast({
        title: "Capture Process Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An error occurred during the capture process.",
        variant: "destructive",
      });
    }
  };

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
      className={`${poppins.variable} ${dancingScript.variable} relative min-h-screen overflow-hidden`}
      style={{
        fontFamily: "var(--font-poppins)",
        backgroundColor: "#fff8f9",
        color: "#333",
      }}
    >
      <Toaster />

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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-6 pb-2 px-4 text-center"
      >
        <h1
          className="text-4xl font-bold mb-1 bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(to right, #FF61D2, #7353E5)",
            fontFamily: "var(--font-dancing)",
          }}
        >
          Tanauan Clicks
        </h1>
        <p className="text-gray-600">Capture your special moments</p>
      </motion.div>

      {/* Main camera view */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] p-4 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full max-w-4xl"
        >
          <div
            className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-xl"
            style={{
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset",
              border: "4px solid rgba(255,255,255,0.2)",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Enhanced Grid overlay for composition */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Rule of thirds grid */}
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white opacity-30"></div>
              <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white opacity-30"></div>
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white opacity-30"></div>
              <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white opacity-30"></div>

              {/* Center crosshair */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white opacity-50"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white opacity-50"></div>

              {/* Golden ratio spiral guides (approximated) */}
              <div className="absolute right-[38.2%] top-0 bottom-0 w-px bg-white opacity-20"></div>
              <div className="absolute left-[38.2%] top-0 bottom-0 w-px bg-white opacity-20"></div>
              <div className="absolute top-[38.2%] left-0 right-0 h-px bg-white opacity-20"></div>
              <div className="absolute bottom-[38.2%] left-0 right-0 h-px bg-white opacity-20"></div>

              {/* Corner markers - improved with diagonal lines */}
              <div className="absolute top-4 left-4 w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-white opacity-70"></div>
                <div className="absolute top-0 left-0 w-0.5 h-full bg-white opacity-70"></div>
              </div>
              <div className="absolute top-4 right-4 w-12 h-12">
                <div className="absolute top-0 right-0 w-full h-0.5 bg-white opacity-70"></div>
                <div className="absolute top-0 right-0 w-0.5 h-full bg-white opacity-70"></div>
              </div>
              <div className="absolute bottom-4 left-4 w-12 h-12">
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white opacity-70"></div>
                <div className="absolute bottom-0 left-0 w-0.5 h-full bg-white opacity-70"></div>
              </div>
              <div className="absolute bottom-4 right-4 w-12 h-12">
                <div className="absolute bottom-0 right-0 w-full h-0.5 bg-white opacity-70"></div>
                <div className="absolute bottom-0 right-0 w-0.5 h-full bg-white opacity-70"></div>
              </div>

              {/* Center frame guide */}
              <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border border-white opacity-40"></div>
            </div>

            {countdown !== null && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="text-9xl font-bold text-white w-48 h-48 flex items-center justify-center rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,97,210,0.8), rgba(115,83,229,0.8))",
                    boxShadow: "0 0 30px rgba(255,97,210,0.5)",
                  }}
                >
                  {countdown}
                </div>
              </motion.div>
            )}

            {isCapturing && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div
                  className="px-4 py-2 rounded-full text-white font-medium"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(255,97,210,0.8), rgba(115,83,229,0.8))",
                  }}
                >
                  Shot {currentShotIndex + 1} of {numShots}
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {!isCapturing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative"
              >
                <Button
                  size="lg"
                  onClick={startCapturing}
                  className="relative px-8 py-6 text-xl overflow-hidden"
                  style={{
                    background: "linear-gradient(to right, #FF61D2, #7353E5)",
                    color: "white",
                    borderRadius: "9999px",
                    boxShadow: "0 10px 25px rgba(255,97,210,0.3)",
                  }}
                >
                  <span className="relative z-10 flex items-center">
                    <Camera className="mr-2 h-6 w-6" />
                    Start Capture
                  </span>
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
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-center mt-4 text-gray-500 text-sm font-light"
              >
                Click the button to start the photo session
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Features with playful icons */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="max-w-4xl mx-auto px-6 pb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
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
            icon: <Share2 size={18} />,
            title: "Social Sharing",
            desc: "Post directly to Instagram",
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
            className="flex flex-col items-center text-center gap-2 p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <div
              className="p-2 rounded-xl shadow-md"
              style={{
                background: "white",
                color: item.color,
              }}
            >
              {item.icon}
            </div>
            <div>
              <h3 className="font-medium text-gray-800 text-sm">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div> */}

      {/* Settings panel */}
      <div className="absolute top-4 right-4 w-80 z-20">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 rounded-full shadow-md"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            {isSettingsOpen ? <X /> : <Settings />}
          </Button>
        </motion.div>

        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2"
          >
            <Card
              className="shadow-lg border-0"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset",
              }}
            >
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Camera
                        className="w-4 h-4 mr-2"
                        style={{ color: "#FF61D2" }}
                      />
                      Number of Shots
                    </label>
                    <Select
                      value={numShots.toString()}
                      onValueChange={(value: string) =>
                        setNumShots(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="border-0 bg-white/80">
                        <SelectValue placeholder="Select number of shots" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Shot</SelectItem>
                        <SelectItem value="2">2 Shots</SelectItem>
                        <SelectItem value="3">3 Shots</SelectItem>
                        <SelectItem value="4">4 Shots</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Sparkles
                        className="w-4 h-4 mr-2"
                        style={{ color: "#7353E5" }}
                      />
                      Timer Delay (seconds)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[timerDelay]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value: number[]) =>
                          setTimerDelay(value[0])
                        }
                        className="flex-1"
                      />
                      <span className="w-8 text-center font-medium">
                        {timerDelay}s
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Heart
                        className="w-4 h-4 mr-2"
                        style={{ color: "#FE9090" }}
                      />
                      Camera Source
                    </label>
                    <Select
                      value={selectedCamera}
                      onValueChange={handleCameraChange}
                    >
                      <SelectTrigger className="border-0 bg-white/80">
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCameras.map((camera: MediaDeviceInfo) => (
                          <SelectItem
                            key={camera.deviceId}
                            value={camera.deviceId}
                          >
                            {camera.label ||
                              `Camera ${camera.deviceId.slice(0, 5)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
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
