"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Camera,
  Download,
  Settings,
  Sliders,
  Type,
  Heart,
  Star,
  Sparkles,
} from "lucide-react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import debounce from "lodash/debounce";
import { Poppins, Dancing_Script } from "next/font/google";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

// Define the image style settings interface
interface ImageStyle {
  width: number;
  height: number;
  top: number;
  left: number;
  right?: number;
}

// Define the text settings interface
interface TextSettings {
  bottomText: string;
  koreanText: string;
  verticalText: string;
  middleText: string;
  topText: string;
  remainingChars: number;
}

// Define the filter options
const filters = [
  {
    id: "none",
    name: "None",
    description: "Original image without any filter",
  },
  {
    id: "grayscale",
    name: "Grayscale",
    description: "Classic black and white look",
  },
  {
    id: "sepia",
    name: "Sepia",
    description: "Warm brownish tone for a vintage feel",
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Faded colors with a warm overlay",
  },
  {
    id: "warm",
    name: "Warm",
    description: "Enhanced warm tones for a cozy feel",
  },
  {
    id: "cool",
    name: "Cool",
    description: "Enhanced cool tones for a calm atmosphere",
  },
  {
    id: "highContrast",
    name: "High Contrast",
    description: "Increased contrast for a bold look",
  },
  {
    id: "lowContrast",
    name: "Low Contrast",
    description: "Reduced contrast for a soft look",
  },
  { id: "brighten", name: "Brighten", description: "Increased brightness" },
  { id: "darken", name: "Darken", description: "Reduced brightness" },
  {
    id: "saturate",
    name: "Saturate",
    description: "Enhanced color saturation",
  },
  {
    id: "desaturate",
    name: "Desaturate",
    description: "Reduced color saturation",
  },
  { id: "redTint", name: "Red Tint", description: "Adds a subtle red tint" },
  { id: "blueTint", name: "Blue Tint", description: "Adds a subtle blue tint" },
  {
    id: "greenTint",
    name: "Green Tint",
    description: "Adds a subtle green tint",
  },
];

// Define the frames
const frames = [
  { id: "none", name: "None", description: "No frame" },
  {
    id: "simple",
    name: "Simple White",
    description: "Clean white border frame",
    color: "#FFFFFF",
  },
  {
    id: "black",
    name: "Bold Black",
    description: "Elegant black border frame",
    color: "#000000",
  },
  {
    id: "gradient-vertical",
    name: "Vertical Gradient",
    description: "Vertical gradient border",
    gradient: "from-pink-300 to-purple-600",
    isVertical: true,
  },
  {
    id: "gradient-horizontal",
    name: "Horizontal Gradient",
    description: "Horizontal gradient border",
    gradient: "from-pink-300 to-purple-600",
    isVertical: false,
  },
  {
    id: "filmstrip",
    name: "Film Strip",
    description: "Classic film strip look",
    isFilmStrip: true,
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Aged paper look with sepia tones",
    color: "#F5F0E5",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean minimalist design with gray tones",
    color: "#E0E0E0",
  },
  {
    id: "neon",
    name: "Neon",
    description: "Vibrant neon-inspired frame",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Earthy green tones",
    gradient: "from-green-200 to-green-500",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Calming blue tones",
    gradient: "from-blue-200 to-blue-600",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm sunset colors",
    gradient: "from-orange-300 to-pink-500",
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft purple tones",
    gradient: "from-purple-200 to-purple-400",
  },
  {
    id: "mint",
    name: "Mint",
    description: "Fresh mint green",
    gradient: "from-green-100 to-green-300",
  },
  {
    id: "rose",
    name: "Rose",
    description: "Elegant rose gold",
    gradient: "from-rose-200 to-rose-400",
  },
  {
    id: "sky",
    name: "Sky",
    description: "Clear sky blue",
    gradient: "from-sky-200 to-sky-400",
  },
  {
    id: "amber",
    name: "Amber",
    description: "Warm amber tones",
    color: "#F59E0B",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Rich emerald green",
    color: "#10B981",
  },
  {
    id: "ruby",
    name: "Ruby",
    description: "Deep ruby red",
    color: "#DC2626",
  },
  {
    id: "sapphire",
    name: "Sapphire",
    description: "Deep sapphire blue",
    color: "#2563EB",
  },
];

// Default text settings
const defaultTextSettings: TextSettings = {
  bottomText: "Thank you!",
  koreanText: "타나우안 클릭스",
  verticalText: "tanauan clicks",
  middleText: "tanauan clicks",
  topText: "Tanauan Clicks",
  remainingChars: 25,
};

// Use the provided API key directly for now
const IMGBB_API_KEY = "ab2094121618d1c51e5074e8699f115f";
const IMGBB_EXPIRATION = 172800; // 2 days in seconds

// Modify the applyFilterToImage function to add better error handling and timeouts
const applyFilterToImage = (
  imageUrl: string,
  filter: string,
  intensity = 100
): Promise<string> => {
  return new Promise((resolve) => {
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn("Filter application timeout - returning original image");
      resolve(imageUrl);
    }, 3000);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        clearTimeout(timeout); // Clear the timeout since image loaded
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // If filter is none or there's an issue, return original
            if (filter === "none") {
              resolve(canvas.toDataURL("image/png"));
              return;
            }

            // Calculate intensity factor (0-1)
            const intensityFactor = intensity / 100;

            // Apply filter based on the selected filter and intensity
            try {
              switch (filter) {
                case "grayscale": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    // Apply grayscale with intensity
                    data[i] =
                      data[i] * (1 - intensityFactor) + avg * intensityFactor; // red
                    data[i + 1] =
                      data[i + 1] * (1 - intensityFactor) +
                      avg * intensityFactor; // green
                    data[i + 2] =
                      data[i + 2] * (1 - intensityFactor) +
                      avg * intensityFactor; // blue
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "sepia": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Calculate sepia values
                    const sepiaR = Math.min(
                      255,
                      r * 0.393 + g * 0.769 + b * 0.189
                    );
                    const sepiaG = Math.min(
                      255,
                      r * 0.349 + g * 0.686 + b * 0.168
                    );
                    const sepiaB = Math.min(
                      255,
                      r * 0.272 + g * 0.534 + b * 0.131
                    );

                    // Apply with intensity
                    data[i] =
                      r * (1 - intensityFactor) + sepiaR * intensityFactor;
                    data[i + 1] =
                      g * (1 - intensityFactor) + sepiaG * intensityFactor;
                    data[i + 2] =
                      b * (1 - intensityFactor) + sepiaB * intensityFactor;
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "vintage":
                  ctx.globalCompositeOperation = "source-over";
                  ctx.fillStyle = `rgba(255, 210, 170, ${
                    0.3 * intensityFactor
                  })`;
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.globalCompositeOperation = "source-over";
                  break;

                case "warm":
                  ctx.globalCompositeOperation = "source-over";
                  ctx.fillStyle = `rgba(255, 160, 60, ${
                    0.2 * intensityFactor
                  })`;
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.globalCompositeOperation = "source-over";
                  break;

                case "cool":
                  ctx.globalCompositeOperation = "source-over";
                  ctx.fillStyle = `rgba(100, 170, 255, ${
                    0.2 * intensityFactor
                  })`;
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.globalCompositeOperation = "source-over";
                  break;

                case "highContrast": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    // Apply contrast adjustment
                    for (let j = 0; j < 3; j++) {
                      const value = data[i + j];
                      // Apply contrast with intensity
                      data[i + j] = 128 + (value - 128) * (1 + intensityFactor);
                    }
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "lowContrast": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    // Apply reduced contrast
                    for (let j = 0; j < 3; j++) {
                      const value = data[i + j];
                      // Apply contrast reduction with intensity
                      data[i + j] =
                        128 + (value - 128) * (1 - 0.5 * intensityFactor);
                    }
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "brighten": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    // Brighten each channel
                    for (let j = 0; j < 3; j++) {
                      data[i + j] = Math.min(
                        255,
                        data[i + j] + 30 * intensityFactor
                      );
                    }
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "darken": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    // Darken each channel
                    for (let j = 0; j < 3; j++) {
                      data[i + j] = Math.max(
                        0,
                        data[i + j] - 30 * intensityFactor
                      );
                    }
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "saturate": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Calculate luminance (grayscale value)
                    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

                    // Increase saturation
                    data[i] = gray + (r - gray) * (1 + intensityFactor);
                    data[i + 1] = gray + (g - gray) * (1 + intensityFactor);
                    data[i + 2] = gray + (b - gray) * (1 + intensityFactor);
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "desaturate": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Calculate luminance (grayscale value)
                    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

                    // Decrease saturation
                    data[i] = r + (gray - r) * intensityFactor;
                    data[i + 1] = g + (gray - g) * intensityFactor;
                    data[i + 2] = b + (gray - b) * intensityFactor;
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "redTint": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    // Add red tint
                    data[i] = Math.min(255, data[i] + 30 * intensityFactor);
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "greenTint": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    // Add green tint
                    data[i + 1] = Math.min(
                      255,
                      data[i + 1] + 30 * intensityFactor
                    );
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }

                case "blueTint": {
                  const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  const data = imageData.data;
                  for (let i = 0; i < data.length; i += 4) {
                    // Add blue tint
                    data[i + 2] = Math.min(
                      255,
                      data[i + 2] + 30 * intensityFactor
                    );
                  }
                  ctx.putImageData(imageData, 0, 0);
                  break;
                }
                default:
                  // If unknown filter, just return the original
                  break;
              }

              resolve(canvas.toDataURL("image/png"));
            } catch (filterError) {
              console.error("Error applying filter:", filterError);
              resolve(canvas.toDataURL("image/png")); // Return the unfiltered image
            }
          } else {
            resolve(imageUrl); // Return original if context not available
          }
        } catch (canvasError) {
          console.error("Canvas error:", canvasError);
          resolve(imageUrl); // Return original on canvas error
        }
      };
      img.onerror = () => {
        clearTimeout(timeout); // Clear the timeout on error
        console.error("Error loading image for filter");
        resolve(imageUrl); // Return original on error
      };
      img.src = imageUrl;
    } catch (error) {
      clearTimeout(timeout); // Clear the timeout on error
      console.error("Error in filter application:", error);
      resolve(imageUrl); // Return original on any error
    }
  });
};

interface AppSettings {
  imageStyles?: ImageStyle[];
  textSettings?: TextSettings;
  selectedFilter?: string;
  filterIntensity?: number;
  selectedFrame?: string;
  developerMode?: boolean;
}

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isFrameOpen, setIsFrameOpen] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [duplicatedImages, setDuplicatedImages] = useState<string[]>([]);
  const [imageStyles, setImageStyles] = useState<ImageStyle[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [selectedFrame, setSelectedFrame] = useState("black");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [developerMode, setDeveloperMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [textSettings, setTextSettings] =
    useState<TextSettings>(defaultTextSettings);
  const [activeTab, setActiveTab] = useState("effects");
  const [allCapturedImages, setAllCapturedImages] = useState<string[]>([]);
  const [numShots, setNumShots] = useState<number>(4);
  const [hasRetaken, setHasRetaken] = useState(false);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [retakeImages, setRetakeImages] = useState<string[]>([]);
  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [finalSelection, setFinalSelection] = useState<string[]>([]);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Only render floating elements on client-side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("appSettings");
      if (savedSettings) {
        const parsedSettings: AppSettings = JSON.parse(savedSettings);

        // Only set filter and frame if they exist
        if (parsedSettings.selectedFilter) {
          setSelectedFilter(parsedSettings.selectedFilter);
        }

        if (parsedSettings.filterIntensity) {
          setFilterIntensity(parsedSettings.filterIntensity);
        }

        if (parsedSettings.selectedFrame) {
          setSelectedFrame(parsedSettings.selectedFrame);
        }

        // Load text settings
        if (parsedSettings.textSettings) {
          setTextSettings(parsedSettings.textSettings);
        }
      }

      // Load captured images
      const savedImages = localStorage.getItem("capturedImages");
      if (savedImages) {
        setAllCapturedImages(JSON.parse(savedImages));
      }

      setHasRetaken(!!localStorage.getItem("hasRetaken"));
      const orig = localStorage.getItem("originalImages");
      const retake = localStorage.getItem("retakeImages");
      if (orig) setOriginalImages(JSON.parse(orig));
      if (retake) setRetakeImages(JSON.parse(retake));
    } catch (e) {
      console.error("Error loading settings from localStorage:", e);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (imageStyles.length > 0) {
      const settings: AppSettings = {
        imageStyles,
        textSettings,
        selectedFilter,
        filterIntensity,
        selectedFrame,
        developerMode,
      };

      localStorage.setItem("appSettings", JSON.stringify(settings));
    }
  }, [
    imageStyles,
    textSettings,
    selectedFilter,
    filterIntensity,
    selectedFrame,
    developerMode,
  ]);

  // Load images from localStorage
  useEffect(() => {
    const loadImages = () => {
      try {
        const storedImages = localStorage.getItem("capturedImages");
        if (storedImages) {
          const parsedImages = JSON.parse(storedImages);
          setImages(parsedImages);
          setCurrentImage(parsedImages[0]);

          // Create duplicated images array
          const duplicated: string[] = [];
          for (let i = 0; i < parsedImages.length; i++) {
            duplicated.push(parsedImages[i]);
            duplicated.push(parsedImages[i]);
          }
          setDuplicatedImages(duplicated);

          // Initialize image styles
          const defaultStyles = duplicated.map((_, index) => {
            const isRightColumn = index % 2 === 1;
            return {
              width: 85,
              height: 85,
              top: 4,
              left: isRightColumn ? 11.5 : 3,
            };
          });
          setImageStyles(defaultStyles);
        } else {
          router.push("/capture");
        }
      } catch (error) {
        console.error("Error loading images:", error);
        router.push("/capture");
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [router]);

  // Generate preview when filter, frame, or intensity changes - with debouncing
  useEffect(() => {
    const debouncedGeneratePreview = debounce(async () => {
      if (!previewCanvasRef.current || duplicatedImages.length === 0) return;

      try {
        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Could not get canvas context");
          return;
        }

        // Set canvas size to a smaller preview size
        canvas.width = 600; // Half of the final size
        canvas.height = 900; // Half of the final size

        // Draw background based on selected frame
        const selectedFrameObj =
          frames.find((f) => f.id === selectedFrame) || frames[0];

        if (selectedFrame === "none") {
          // White background if no frame
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (selectedFrameObj.color) {
          // Solid color frame
          ctx.fillStyle = selectedFrameObj.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (selectedFrameObj.gradient) {
          // Gradient frame
          const gradient = selectedFrameObj.isVertical
            ? ctx.createLinearGradient(0, 0, 0, canvas.height)
            : ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

          if (
            selectedFrame === "gradient-vertical" ||
            selectedFrame === "gradient-horizontal"
          ) {
            gradient.addColorStop(0, "#FF61D2"); // pink-300 equivalent
            gradient.addColorStop(1, "#7353E5"); // purple-600 equivalent
          } else if (selectedFrame === "neon") {
            gradient.addColorStop(0, "#8B5CF6"); // purple-500 equivalent
            gradient.addColorStop(1, "#EC4899"); // pink-500 equivalent
          } else if (selectedFrame === "nature") {
            gradient.addColorStop(0, "#A7F3D0"); // green-200 equivalent
            gradient.addColorStop(1, "#10B981"); // green-500 equivalent
          } else if (selectedFrame === "ocean") {
            gradient.addColorStop(0, "#BFDBFE"); // blue-200 equivalent
            gradient.addColorStop(1, "#2563EB"); // blue-600 equivalent
          } else if (selectedFrame === "sunset") {
            gradient.addColorStop(0, "#FDBA74"); // orange-300 equivalent
            gradient.addColorStop(1, "#EC4899"); // pink-500 equivalent
          } else if (selectedFrame === "lavender") {
            gradient.addColorStop(0, "#E9D5FF"); // purple-200 equivalent
            gradient.addColorStop(1, "#C084FC"); // purple-400 equivalent
          } else if (selectedFrame === "mint") {
            gradient.addColorStop(0, "#D1FAE5"); // green-100 equivalent
            gradient.addColorStop(1, "#6EE7B7"); // green-300 equivalent
          } else if (selectedFrame === "rose") {
            gradient.addColorStop(0, "#FECDD3"); // rose-200 equivalent
            gradient.addColorStop(1, "#FB7185"); // rose-400 equivalent
          } else if (selectedFrame === "sky") {
            gradient.addColorStop(0, "#E0F2FE"); // sky-200 equivalent
            gradient.addColorStop(1, "#38BDF8"); // sky-400 equivalent
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (selectedFrameObj.isFilmStrip) {
          // Film strip frame
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw film perforations
          const perfSize = 30;
          const perfSpacing = 60;
          ctx.fillStyle = "#333333";

          // Left side perforations
          for (let y = perfSpacing; y < canvas.height; y += perfSpacing * 2) {
            ctx.fillRect(20, y, perfSize, perfSize);
          }

          // Right side perforations
          for (
            let y = perfSpacing * 2;
            y < canvas.height;
            y += perfSpacing * 2
          ) {
            ctx.fillRect(canvas.width - 20 - perfSize, y, perfSize, perfSize);
          }
        }

        // Add vertical divider line in the middle for all frames
        ctx.strokeStyle =
          selectedFrame === "simple" ||
          selectedFrame === "polaroid" ||
          selectedFrame === "vintage" ||
          selectedFrame === "modern"
            ? "#000000"
            : "#FFFFFF";
        ctx.lineWidth = 1.2; // Thinner vertical divider
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Add triangle and numbers to the side of every frame
        ctx.save();
        ctx.fillStyle = ctx.strokeStyle;
        // Left side triangle (bottom only)
        ctx.beginPath();
        ctx.moveTo(18, canvas.height - 18);
        ctx.lineTo(28, canvas.height - 18);
        ctx.lineTo(23, canvas.height - 28);
        ctx.closePath();
        ctx.fill();
        // Right side triangle (bottom only)
        ctx.beginPath();
        ctx.moveTo(canvas.width - 18, canvas.height - 18);
        ctx.lineTo(canvas.width - 28, canvas.height - 18);
        ctx.lineTo(canvas.width - 23, canvas.height - 28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Process all images with filters for preview - with timeout protection
        const processedImages = await Promise.all(
          duplicatedImages.map(async (img) => {
            try {
              // Add a timeout to prevent hanging
              const timeoutPromise = new Promise<string>((_, reject) => {
                setTimeout(
                  () => reject(new Error("Filter processing timeout")),
                  5000
                );
              });

              // Race between normal processing and timeout
              return await Promise.race([
                applyFilterToImage(img, selectedFilter, filterIntensity),
                timeoutPromise,
              ]);
            } catch (error) {
              console.error("Error processing image with filter:", error);
              return img; // Return original image on error
            }
          })
        );

        // Calculate grid layout
        const rows = 4;
        const cols = 2;
        const padding = 50; // Padding from the edge in pixels
        const imageWidth = (canvas.width - padding * 2) / cols;
        const imageHeight = (canvas.height - padding * 2 - 100) / rows; // Extra space at bottom for text
        const bottomPadding = 100; // Extra space at the bottom for text

        // Draw each image in the grid
        for (let i = 0; i < processedImages.length; i++) {
          if (i >= rows * cols) break; // Don't exceed the grid

          const row = Math.floor(i / cols);
          const col = i % cols;

          const x = padding + col * imageWidth;
          const y = padding + row * imageHeight;

          // Calculate position and size based on the style settings
          const style = imageStyles[i] || {
            width: 85,
            height: 85,
            top: 4,
            left: col === 0 ? 3 : 5,
            right: 0,
          };

          const imgX =
            style.right !== undefined && style.right > 0
              ? x +
                imageWidth -
                (imageWidth * style.right) / 100 -
                (imageWidth * style.width) / 100
              : x + (imageWidth * style.left) / 100;
          const imgY = y + (imageHeight * style.top) / 100;
          const imgWidth = (imageWidth * style.width) / 100;
          const imgHeight = (imageHeight * style.height) / 100;

          // Draw white background for the photo
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(imgX, imgY, imgWidth, imgHeight);

          // Draw the image with error handling
          try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = processedImages[i];

            await new Promise((resolve) => {
              img.onload = () => {
                try {
                  ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
                } catch (e) {
                  console.error("Error drawing image:", e);
                }
                resolve(null);
              };
              img.onerror = () => {
                console.error("Error loading image for drawing");
                resolve(null); // Continue without this image
              };
              // Add a timeout to prevent hanging
              setTimeout(() => resolve(null), 2000);
            });

            // Add vertical text on sides
            // Left side vertical text (only for first column)
            if (col === 0) {
              ctx.save();
              ctx.translate(x - 15, y + imageHeight / 2);
              ctx.rotate(-Math.PI / 2);
              ctx.font = "16px Arial";
              ctx.fillStyle =
                selectedFrame === "simple" ||
                selectedFrame === "polaroid" ||
                selectedFrame === "vintage" ||
                selectedFrame === "modern"
                  ? "#000000"
                  : "#FFFFFF";
              ctx.textAlign = "center";
              ctx.fillText(textSettings.verticalText, 0, 0);
              ctx.restore();
            }

            // Right side vertical text (only for second column)
            if (col === 1) {
              ctx.save();
              ctx.translate(x + imageWidth + 15, y + imageHeight / 2);
              ctx.rotate(Math.PI / 2);
              ctx.font = "16px Arial";
              ctx.fillStyle =
                selectedFrame === "simple" ||
                selectedFrame === "polaroid" ||
                selectedFrame === "vintage" ||
                selectedFrame === "modern"
                  ? "#000000"
                  : "#FFFFFF";
              ctx.textAlign = "center";
              ctx.fillText(textSettings.verticalText, 0, 0);
              ctx.restore();
            }
          } catch (error) {
            console.error("Error processing image:", error);
          }
        }

        // Add text at the bottom
        // Calculate the position for text at the bottom of each column
        const textY = canvas.height - bottomPadding / 2;

        // Text for first column (left side of divider)
        ctx.font = "bold 22px Arial";
        ctx.fillStyle =
          selectedFrame === "simple" ||
          selectedFrame === "polaroid" ||
          selectedFrame === "vintage" ||
          selectedFrame === "modern"
            ? "#000000"
            : "#FFFFFF";
        ctx.textAlign = "center";
        const col1X = canvas.width / 4;
        ctx.fillText(textSettings.koreanText, col1X, textY);
        ctx.font = "17px Arial";
        ctx.fillText(textSettings.bottomText, col1X, textY + 40);

        // Text for second column (right side of divider)
        ctx.font = "bold 22px Arial";
        const col2X = (canvas.width / 4) * 3;
        ctx.fillText(textSettings.koreanText, col2X, textY);
        ctx.font = "17px Arial";
        ctx.fillText(textSettings.bottomText, col2X, textY + 40);

        // Add watermark
        ctx.font = "20px Arial";
        ctx.fillStyle =
          selectedFrame === "simple" ||
          selectedFrame === "polaroid" ||
          selectedFrame === "vintage" ||
          selectedFrame === "modern"
            ? "#000000"
            : "#FFFFFF";
        ctx.textAlign = "right";
        ctx.fillText(textSettings.topText, canvas.width - 20, 30);

        // Add second watermark on the left side
        ctx.textAlign = "left";
        ctx.fillText(textSettings.topText, 20, 30);

        // Convert to image URL and update state
        const dataUrl = canvas.toDataURL("image/png");
        setPreviewUrl(dataUrl);
      } catch (error) {
        console.error("Error generating preview:", error);
        // Set a basic preview even if there's an error
        if (previewCanvasRef.current) {
          const canvas = previewCanvasRef.current;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "20px Arial";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.fillText(
              "Preview generation error - please try again",
              canvas.width / 2,
              canvas.height / 2
            );
            setPreviewUrl(canvas.toDataURL("image/png"));
          }
        }
      }
    }, 500); // 500ms debounce delay

    debouncedGeneratePreview();

    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedGeneratePreview.cancel();
    };
  }, [
    duplicatedImages,
    imageStyles,
    selectedFilter,
    filterIntensity,
    selectedFrame,
    textSettings,
  ]);

  // Handle style change for selected images
  const handleStyleChange = useCallback(
    (property: keyof ImageStyle, value: number) => {
      if (selectedImages.length > 0) {
        const newStyles = [...imageStyles];
        selectedImages.forEach((index) => {
          if (index < newStyles.length) {
            newStyles[index] = {
              ...newStyles[index],
              [property]: value,
            };
          }
        });
        setImageStyles(newStyles);
      }
    },
    [selectedImages, imageStyles]
  );

  // Handle input change for number inputs
  const handleInputChange = useCallback(
    (property: keyof ImageStyle, value: string) => {
      if (
        selectedImageIndex !== null &&
        selectedImageIndex >= 0 &&
        selectedImageIndex < imageStyles.length
      ) {
        const numValue = Number.parseFloat(value);
        if (!isNaN(numValue)) {
          const newStyles = [...imageStyles];
          newStyles[selectedImageIndex] = {
            ...newStyles[selectedImageIndex],
            [property]: numValue,
          };
          setImageStyles(newStyles);
        }
      }
    },
    [selectedImageIndex, imageStyles]
  );

  // Handle text settings change
  const handleTextChange = useCallback(
    (property: keyof TextSettings, value: string) => {
      // Apply 15 character limit to bottomText
      if (property === "bottomText") {
        if (value.length > 25) {
          toast({
            title: "Character Limit Exceeded",
            description: "Message cannot exceed 25 characters.",
            variant: "destructive",
          });
          return;
        }
        setTextSettings((prev) => ({
          ...prev,
          [property]: value,
          remainingChars: 25 - value.length,
        }));
      } else {
        setTextSettings((prev) => ({
          ...prev,
          [property]: value,
        }));
      }
    },
    []
  );

  // Toggle image selection
  const toggleImageSelection = useCallback((index: number) => {
    setSelectedImages((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });

    // Also set as the current selected image for individual editing
    setSelectedImageIndex(index);
  }, []);

  // Select all images
  const selectAllImages = useCallback(() => {
    const allIndices = Array.from(
      { length: duplicatedImages.length },
      (_, i) => i
    );
    setSelectedImages(allIndices);
  }, [duplicatedImages.length]);

  // Select left strip
  const selectLeftStrip = useCallback(() => {
    const leftIndices = Array.from(
      { length: duplicatedImages.length },
      (_, i) => i
    ).filter((i) => i % 2 === 0);
    setSelectedImages(leftIndices);
  }, [duplicatedImages.length]);

  // Select right strip
  const selectRightStrip = useCallback(() => {
    const rightIndices = Array.from(
      { length: duplicatedImages.length },
      (_, i) => i
    ).filter((i) => i % 2 === 1);
    setSelectedImages(rightIndices);
  }, [duplicatedImages.length]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedImages([]);
    setSelectedImageIndex(null);
  }, []);

  // Apply the same style to all images in the same column
  const applyToColumn = useCallback(() => {
    if (selectedImageIndex !== null && imageStyles.length > 0) {
      const selectedStyle = imageStyles[selectedImageIndex];
      const isRightColumn = selectedImageIndex % 2 === 1;

      const newStyles = imageStyles.map((style, index) => {
        // Only apply to images in the same column
        if ((index % 2 === 1) === isRightColumn) {
          return { ...selectedStyle };
        }
        return style;
      });

      setImageStyles(newStyles);
      toast({
        title: "Applied to Column",
        description: `Style applied to all photos in the ${
          isRightColumn ? "right" : "left"
        } column.`,
      });
    }
  }, [selectedImageIndex, imageStyles]);

  // Apply the same style to all images
  const applyToAll = useCallback(() => {
    if (selectedImageIndex !== null && imageStyles.length > 0) {
      const selectedStyle = imageStyles[selectedImageIndex];
      const newStyles = imageStyles.map(() => ({ ...selectedStyle }));
      setImageStyles(newStyles);
      toast({
        title: "Applied to All",
        description: "The current image style has been applied to all photos.",
      });
    }
  }, [selectedImageIndex, imageStyles]);

  const handleRetake = () => {
    // Clear captured images before retaking
    localStorage.removeItem("capturedImages");
    // Navigate back to capture page
    router.push("/capture");
  };

  const uploadImageToImgbb = async (
    imageDataUrl: string
  ): Promise<string | null> => {
    if (!IMGBB_API_KEY) return null;
    try {
      const base64 = imageDataUrl.split(",")[1];
      const formData = new FormData();
      formData.append("key", IMGBB_API_KEY);
      formData.append("image", base64);
      formData.append("expiration", IMGBB_EXPIRATION.toString());
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data && data.data && data.data.url) {
        return data.data.url;
      }
      return null;
    } catch (e) {
      console.error("Error uploading to imgbb:", e);
      return null;
    }
  };

  const drawQrCodeOnCanvas = async (
    ctx: CanvasRenderingContext2D,
    url: string,
    x: number,
    y: number,
    size: number
  ) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(
        "https://dl-gamma-six.vercel.app/download?" + url,
        {
          margin: 0,
        }
      );
      const qrImg = new window.Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImg.onload = () => resolve(null);
        setTimeout(() => resolve(null), 2000);
      });
      ctx.drawImage(qrImg, x, y, size, size);
    } catch (e) {
      console.error("Error drawing QR code:", e);
    }
  };

  const handleDownloadConfirm = () => {
    setShowDownloadConfirm(true);
  };

  const handleDownloadConfirmed = async () => {
    setShowDownloadConfirm(false);
    if (!canvasRef.current) return;
    setIsDownloading(true);
    try {
      // 1. Get canvas and context
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // 2. Set canvas size for 4R photo (4x6 inches at 300 DPI)
      canvas.width = 4 * 300; // 1200px
      canvas.height = 6 * 300; // 1800px

      // 3. Draw background based on selected frame (copied from preview)
      const selectedFrameObj =
        frames.find((f) => f.id === selectedFrame) || frames[0];
      if (selectedFrame === "none") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedFrameObj.color) {
        ctx.fillStyle = selectedFrameObj.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedFrameObj.gradient) {
        const gradient = selectedFrameObj.isVertical
          ? ctx.createLinearGradient(0, 0, 0, canvas.height)
          : ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (
          selectedFrame === "gradient-vertical" ||
          selectedFrame === "gradient-horizontal"
        ) {
          gradient.addColorStop(0, "#FF61D2");
          gradient.addColorStop(1, "#7353E5");
        } else if (selectedFrame === "neon") {
          gradient.addColorStop(0, "#8B5CF6");
          gradient.addColorStop(1, "#EC4899");
        } else if (selectedFrame === "nature") {
          gradient.addColorStop(0, "#A7F3D0");
          gradient.addColorStop(1, "#10B981");
        } else if (selectedFrame === "ocean") {
          gradient.addColorStop(0, "#BFDBFE");
          gradient.addColorStop(1, "#2563EB");
        } else if (selectedFrame === "sunset") {
          gradient.addColorStop(0, "#FDBA74");
          gradient.addColorStop(1, "#EC4899");
        } else if (selectedFrame === "lavender") {
          gradient.addColorStop(0, "#E9D5FF");
          gradient.addColorStop(1, "#C084FC");
        } else if (selectedFrame === "mint") {
          gradient.addColorStop(0, "#D1FAE5");
          gradient.addColorStop(1, "#6EE7B7");
        } else if (selectedFrame === "rose") {
          gradient.addColorStop(0, "#FECDD3");
          gradient.addColorStop(1, "#FB7185");
        } else if (selectedFrame === "sky") {
          gradient.addColorStop(0, "#E0F2FE");
          gradient.addColorStop(1, "#38BDF8");
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedFrameObj.isFilmStrip) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw film perforations
        const perfSize = 30;
        const perfSpacing = 60;
        ctx.fillStyle = "#333333";
        for (let y = perfSpacing; y < canvas.height; y += perfSpacing * 2) {
          ctx.fillRect(20, y, perfSize, perfSize);
        }
        for (let y = perfSpacing * 2; y < canvas.height; y += perfSpacing * 2) {
          ctx.fillRect(canvas.width - 20 - perfSize, y, perfSize, perfSize);
        }
      }

      // 4. Draw vertical divider and bottom triangles (copied from preview)
      ctx.strokeStyle =
        selectedFrame === "simple" ||
        selectedFrame === "polaroid" ||
        selectedFrame === "vintage" ||
        selectedFrame === "modern"
          ? "#000000"
          : "#FFFFFF";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(18, canvas.height - 18);
      ctx.lineTo(28, canvas.height - 18);
      ctx.lineTo(23, canvas.height - 28);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(canvas.width - 18, canvas.height - 18);
      ctx.lineTo(canvas.width - 28, canvas.height - 18);
      ctx.lineTo(canvas.width - 23, canvas.height - 28);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 5. Draw all images in the grid (with filters, copied from preview)
      const processedImages = await Promise.all(
        duplicatedImages.map((img) =>
          applyFilterToImage(img, selectedFilter, filterIntensity)
        )
      );
      const rows = 4;
      const cols = 2;
      const padding = 50;
      const imageWidth = (canvas.width - padding * 2) / cols;
      const imageHeight = (canvas.height - padding * 2 - 100) / rows;
      const bottomPadding = 100;
      for (let i = 0; i < processedImages.length; i++) {
        if (i >= rows * cols) break;
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = padding + col * imageWidth;
        const y = padding + row * imageHeight;
        const style = imageStyles[i] || {
          width: 85,
          height: 85,
          top: 4,
          left: col === 0 ? 3 : 5,
          right: 0,
        };
        const imgX =
          style.right !== undefined && style.right > 0
            ? x +
              imageWidth -
              (imageWidth * style.right) / 100 -
              (imageWidth * style.width) / 100
            : x + (imageWidth * style.left) / 100;
        const imgY = y + (imageHeight * style.top) / 100;
        const imgWidth = (imageWidth * style.width) / 100;
        const imgHeight = (imageHeight * style.height) / 100;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(imgX, imgY, imgWidth, imgHeight);
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = processedImages[i];
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
            resolve(null);
          };
          img.onerror = () => resolve(null);
          setTimeout(() => resolve(null), 3000);
        });
        // Add vertical text on sides (copied from preview)
        if (col === 0) {
          ctx.save();
          ctx.translate(x - 15, y + imageHeight / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.font = "16px Arial";
          ctx.fillStyle =
            selectedFrame === "simple" ||
            selectedFrame === "polaroid" ||
            selectedFrame === "vintage" ||
            selectedFrame === "modern"
              ? "#000000"
              : "#FFFFFF";
          ctx.textAlign = "center";
          ctx.fillText(textSettings.verticalText, 0, 0);
          ctx.restore();
        }
        if (col === 1) {
          ctx.save();
          ctx.translate(x + imageWidth + 15, y + imageHeight / 2);
          ctx.rotate(Math.PI / 2);
          ctx.font = "16px Arial";
          ctx.fillStyle =
            selectedFrame === "simple" ||
            selectedFrame === "polaroid" ||
            selectedFrame === "vintage" ||
            selectedFrame === "modern"
              ? "#000000"
              : "#FFFFFF";
          ctx.textAlign = "center";
          ctx.fillText(textSettings.verticalText, 0, 0);
          ctx.restore();
        }
      }

      // 6. Draw text at the bottom (Korean, bottom text, watermark, copied from preview)
      const textY = canvas.height - bottomPadding / 2;
      ctx.font = "bold 30px Arial";
      ctx.fillStyle =
        selectedFrame === "simple" ||
        selectedFrame === "polaroid" ||
        selectedFrame === "vintage" ||
        selectedFrame === "modern"
          ? "#000000"
          : "#FFFFFF";
      ctx.textAlign = "center";
      const col1X = canvas.width / 4;
      ctx.fillText(textSettings.koreanText, col1X, textY);
      ctx.font = "24px Arial";
      ctx.fillText(textSettings.bottomText, col1X, textY + 40);
      const col2X = (canvas.width / 4) * 3;
      ctx.font = "bold 30px Arial";
      ctx.fillText(textSettings.koreanText, col2X, textY);
      ctx.font = "24px Arial";
      ctx.fillText(textSettings.bottomText, col2X, textY + 40);
      ctx.font = "20px Arial";
      ctx.textAlign = "right";
      ctx.fillText(textSettings.topText, canvas.width - 20, 30);
      ctx.textAlign = "left";
      ctx.fillText(textSettings.topText, 20, 30);

      // 7. Upload the image (without QR code) to imgbb
      const uploadDataUrl = canvas.toDataURL("image/png");
      let uploadedUrl: string | null = null;
      if (IMGBB_API_KEY) {
        uploadedUrl = await uploadImageToImgbb(uploadDataUrl);
      }
      if (uploadedUrl) {
        toast({
          title: "Image Uploaded!",
          description: `Your image is available for 2 days: ${uploadedUrl}`,
        });
      }

      // 8. Draw QR code (with uploaded URL) for the downloaded image only
      const qrUrl = uploadedUrl || "https://tanauan-clicks-qr-placeholder.com/";
      await drawQrCodeOnCanvas(
        ctx,
        qrUrl,
        canvas.width / 2 - 140,
        textY - 100,
        120
      );
      await drawQrCodeOnCanvas(
        ctx,
        qrUrl,
        canvas.width - 140,
        textY - 100,
        120
      );

      // 9. Download the image (with QR code)
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `tanauan-clicks-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 10. Reset state and navigate to front page for next user
      setTimeout(() => {
        setIsDownloading(false);
        toast({
          title: "Success!",
          description: "Your photo has been downloaded successfully.",
        });

        // Add a delay before redirecting to home page
        setTimeout(() => {
          setSelectedFrame("black");
          router.push("/");
        }, 2000);
      }, 500);

      // After download, remove capturedImages
      localStorage.removeItem("hasRetaken");
      localStorage.removeItem("capturedImages");
    } catch (error) {
      // Error handling
      console.error("Error generating image:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your photo.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Final photo selection logic
  const handleSelectFinal = () => {
    setShowFinalDialog(true);
    // Preselect the latest 4 images if available
    if (retakeImages.length === 4) {
      setFinalSelection(retakeImages);
    } else {
      setFinalSelection(originalImages);
    }
  };

  const handleToggleFinal = (img: string) => {
    if (finalSelection.includes(img)) {
      setFinalSelection(finalSelection.filter((i) => i !== img));
    } else if (finalSelection.length < 4) {
      setFinalSelection([...finalSelection, img]);
    }
  };

  const handleConfirmFinal = () => {
    localStorage.setItem("capturedImages", JSON.stringify(finalSelection));
    setShowFinalDialog(false);
    // Update preview to use only final images
    setImages(finalSelection);
    setDuplicatedImages(finalSelection.flatMap((i) => [i, i]));
  };

  // Add this function to handle password verification
  const handlePasswordSubmit = () => {
    if (password === "test123") {
      setIsPasswordCorrect(true);
      setShowPasswordDialog(false);
      setDeveloperMode(true);
      // Save both the unlocked state and developer mode to localStorage
      localStorage.setItem("developerModeUnlocked", "true");
      const settings: AppSettings = {
        imageStyles,
        textSettings,
        selectedFilter,
        filterIntensity,
        selectedFrame,
        developerMode: true,
      };
      localStorage.setItem("appSettings", JSON.stringify(settings));
    } else {
      toast({
        title: "Incorrect Password",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setPassword("");
  };

  // Add this function to hide developer mode
  const handleHideDeveloperMode = () => {
    setDeveloperMode(false);
    // Save the developer mode state to localStorage
    const settings: AppSettings = {
      imageStyles,
      textSettings,
      selectedFilter,
      filterIntensity,
      selectedFrame,
      developerMode: false,
    };
    localStorage.setItem("appSettings", JSON.stringify(settings));
  };

  // Add useEffect to check for saved developer mode state
  useEffect(() => {
    const isUnlocked = localStorage.getItem("developerModeUnlocked") === "true";
    if (isUnlocked) {
      setIsPasswordCorrect(true);
    }
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

  if (isLoading) {
    return (
      <div
        className={`${poppins.variable} ${dancingScript.variable} flex flex-col items-center justify-center min-h-screen`}
        style={{
          fontFamily: "var(--font-poppins)",
          backgroundColor: "#fff8f9",
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "#FF61D2",
              borderTopColor: "transparent",
            }}
          ></div>
          <h2 className="text-xl font-medium" style={{ color: "#7353E5" }}>
            Loading your photos...
          </h2>
        </div>
      </div>
    );
  }

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
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={previewCanvasRef} className="hidden" />

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

      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-center mb-6"
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
          <div className="flex space-x-2 mt-4 md:mt-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="flex items-center border border-pink-200 shadow-sm"
                onClick={handleRetake}
                disabled={hasRetaken}
              >
                <Camera className="mr-2 h-4 w-4" style={{ color: "#FF61D2" }} />
                Retake Photos
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="flex items-center"
                onClick={handleDownloadConfirm}
                disabled={isDownloading}
                style={{
                  background: "linear-gradient(to right, #FF61D2, #7353E5)",
                  color: "white",
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Processing..." : "Download"}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="flex items-center bg-gradient-to-r from-pink-400 to-purple-500 text-white"
                onClick={handleSelectFinal}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Select Final Photos
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6"
            style={{
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset",
            }}
          >
            <h2
              className="text-2xl font-semibold mb-4 bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #FF61D2, #7353E5)",
                fontFamily: "var(--font-dancing)",
              }}
            >
              Preview
            </h2>
            <div className="flex justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full max-h-[70vh] object-contain border border-pink-100 rounded-xl shadow-md"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Generating preview...</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6"
            style={{
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset",
            }}
          >
            <Tabs
              defaultValue="effects"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-3 mb-4 bg-pink-50">
                <TabsTrigger
                  value="effects"
                  className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  <Sliders className="mr-2 h-4 w-4" />
                  Effects
                </TabsTrigger>
                <TabsTrigger
                  value="text"
                  className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  <Type className="mr-2 h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="effects" className="space-y-6">
                <div className="space-y-4">
                  <h3
                    className="text-lg font-medium"
                    style={{ color: "#FF61D2" }}
                  >
                    Filter
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white">
                          <span className="text-xs font-bold">
                            {selectedFilter !== "none" ? "✓" : ""}
                          </span>
                        </div>
                        <span className="font-medium">
                          {filters.find((f) => f.id === selectedFilter)?.name ||
                            "None"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSettingsOpen((prev) => !prev)}
                        className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                      >
                        {isSettingsOpen ? "Hide Options" : "Show Options"}
                      </Button>
                    </div>

                    {isSettingsOpen && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-pink-100 shadow-sm">
                        <div className="grid grid-cols-3 gap-3">
                          {filters.map((filter) => (
                            <div
                              key={filter.id}
                              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                                selectedFilter === filter.id
                                  ? "ring-2 ring-pink-500 ring-offset-1"
                                  : "ring-1 ring-gray-200"
                              }`}
                              onClick={() => setSelectedFilter(filter.id)}
                            >
                              <div className="aspect-square">
                                {images[0] && (
                                  <img
                                    src={images[0] || "/placeholder.svg"}
                                    alt={filter.name}
                                    className="w-full h-full object-cover"
                                    style={{
                                      filter:
                                        filter.id === "none"
                                          ? "none"
                                          : filter.id === "grayscale"
                                          ? "grayscale(1)"
                                          : filter.id === "sepia"
                                          ? "sepia(1)"
                                          : filter.id === "vintage"
                                          ? "contrast(0.8) sepia(0.4)"
                                          : filter.id === "warm"
                                          ? "brightness(1.1) sepia(0.2)"
                                          : filter.id === "cool"
                                          ? "brightness(0.9) contrast(1.1)"
                                          : filter.id === "highContrast"
                                          ? "contrast(1.5)"
                                          : filter.id === "lowContrast"
                                          ? "contrast(0.7)"
                                          : filter.id === "brighten"
                                          ? "brightness(1.2)"
                                          : filter.id === "darken"
                                          ? "brightness(0.7)"
                                          : filter.id === "saturate"
                                          ? "saturate(1.5)"
                                          : filter.id === "desaturate"
                                          ? "saturate(0.5)"
                                          : filter.id === "redTint"
                                          ? "drop-shadow(0 0 8px red)"
                                          : filter.id === "blueTint"
                                          ? "drop-shadow(0 0 8px blue)"
                                          : filter.id === "greenTint"
                                          ? "drop-shadow(0 0 8px green)"
                                          : "none",
                                    }}
                                  />
                                )}
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                <p className="text-white text-xs font-medium p-2 truncate w-full text-center">
                                  {filter.name}
                                </p>
                              </div>
                              {selectedFilter === filter.id && (
                                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                  <span className="text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedFilter !== "none" && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Intensity</Label>
                        <span className="text-sm text-gray-500">
                          {filterIntensity}%
                        </span>
                      </div>
                      <Slider
                        value={[filterIntensity]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setFilterIntensity(value[0])}
                        className="[&_[role=slider]]:bg-pink-500"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3
                    className="text-lg font-medium"
                    style={{ color: "#7353E5" }}
                  >
                    Frame
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              frames.find((f) => f.id === selectedFrame)
                                ?.color ||
                              (frames.find((f) => f.id === selectedFrame)
                                ?.gradient
                                ? selectedFrame === "nature"
                                  ? "linear-gradient(to right, #A7F3D0, #10B981)"
                                  : selectedFrame === "ocean"
                                  ? "linear-gradient(to right, #BFDBFE, #2563EB)"
                                  : selectedFrame === "sunset"
                                  ? "linear-gradient(to right, #FDBA74, #EC4899)"
                                  : selectedFrame === "lavender"
                                  ? "linear-gradient(to right, #E9D5FF, #C084FC)"
                                  : selectedFrame === "mint"
                                  ? "linear-gradient(to right, #D1FAE5, #6EE7B7)"
                                  : selectedFrame === "rose"
                                  ? "linear-gradient(to right, #FECDD3, #FB7185)"
                                  : selectedFrame === "sky"
                                  ? "linear-gradient(to right, #E0F2FE, #38BDF8)"
                                  : "linear-gradient(to right, #FF61D2, #7353E5)"
                                : "#f3f4f6"),
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            {selectedFrame !== "none" ? "✓" : ""}
                          </span>
                        </div>
                        <span className="font-medium">
                          {frames.find((f) => f.id === selectedFrame)?.name ||
                            "None"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFrameOpen((prev) => !prev)}
                        className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                      >
                        {isFrameOpen ? "Hide Options" : "Show Options"}
                      </Button>
                    </div>

                    {isFrameOpen && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-pink-100 shadow-sm">
                        <div className="grid grid-cols-3 gap-3">
                          {frames.map((frame) => (
                            <div
                              key={frame.id}
                              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                                selectedFrame === frame.id
                                  ? "ring-2 ring-pink-500 ring-offset-1"
                                  : "ring-1 ring-gray-200"
                              }`}
                              onClick={() => setSelectedFrame(frame.id)}
                            >
                              <div
                                className="aspect-square flex items-center justify-center"
                                style={{
                                  background: frame.color
                                    ? frame.color
                                    : frame.gradient
                                    ? frame.id === "nature"
                                      ? "linear-gradient(to right, #A7F3D0, #10B981)" // Green gradient for Nature
                                      : frame.id === "ocean"
                                      ? "linear-gradient(to right, #BFDBFE, #2563EB)" // Blue gradient for Ocean
                                      : frame.id === "sunset"
                                      ? "linear-gradient(to right, #FDBA74, #EC4899)" // Sunset colors
                                      : frame.id === "lavender"
                                      ? "linear-gradient(to right, #E9D5FF, #C084FC)" // Purple gradient for Lavender
                                      : frame.id === "mint"
                                      ? "linear-gradient(to right, #D1FAE5, #6EE7B7)" // Mint green gradient
                                      : frame.id === "rose"
                                      ? "linear-gradient(to right, #FECDD3, #FB7185)" // Rose gradient
                                      : frame.id === "sky"
                                      ? "linear-gradient(to right, #E0F2FE, #38BDF8)" // Sky blue gradient
                                      : frame.id === "gradient-vertical" ||
                                        frame.id === "gradient-horizontal" ||
                                        frame.id === "neon"
                                      ? "linear-gradient(to right, #FF61D2, #7353E5)" // Default pink-purple gradient
                                      : "#fff"
                                    : "#fff",
                                }}
                              >
                                {/* Simulate a frame with image inside */}
                                {images[0] && (
                                  <div className="w-3/4 h-3/4 bg-white rounded shadow-sm overflow-hidden">
                                    <img
                                      src={images[0] || "/placeholder.svg"}
                                      alt={frame.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                <p className="text-white text-xs font-medium p-2 truncate w-full text-center">
                                  {frame.name}
                                </p>
                              </div>
                              {selectedFrame === frame.id && (
                                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                  <span className="text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Message</Label>
                      <span className="text-sm text-gray-500">
                        {textSettings.remainingChars} characters remaining
                      </span>
                    </div>
                    <Input
                      value={textSettings.bottomText}
                      onChange={(e) =>
                        handleTextChange("bottomText", e.target.value)
                      }
                      placeholder="Enter your message"
                      maxLength={25}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                {!isPasswordCorrect ? (
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full border-pink-200"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      Unlock Developer Mode
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="developer-mode"
                          checked={developerMode}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              setDeveloperMode(false);
                              const settings: AppSettings = {
                                imageStyles,
                                textSettings,
                                selectedFilter,
                                filterIntensity,
                                selectedFrame,
                                developerMode: false,
                              };
                              localStorage.setItem(
                                "appSettings",
                                JSON.stringify(settings)
                              );
                            } else {
                              setShowPasswordDialog(true);
                            }
                          }}
                        />
                        <Label htmlFor="developer-mode">Developer Mode</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleHideDeveloperMode}
                      >
                        Hide Settings
                      </Button>
                    </div>

                    {developerMode && (
                      <div className="space-y-6 border border-pink-100 rounded-md p-4 bg-white/50">
                        <div className="space-y-4">
                          <h3
                            className="text-sm font-medium"
                            style={{ color: "#FF61D2" }}
                          >
                            Advanced Text Settings
                          </h3>
                          <div className="space-y-2">
                            <Label>Top Text (Watermark)</Label>
                            <Input
                              value={textSettings.topText}
                              onChange={(e) =>
                                handleTextChange("topText", e.target.value)
                              }
                              placeholder="Top text"
                              className="border-pink-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Vertical Side Text</Label>
                            <Input
                              value={textSettings.verticalText}
                              onChange={(e) =>
                                handleTextChange("verticalText", e.target.value)
                              }
                              placeholder="Vertical text"
                              className="border-pink-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Korean Text</Label>
                            <Input
                              value={textSettings.koreanText}
                              onChange={(e) =>
                                handleTextChange("koreanText", e.target.value)
                              }
                              placeholder="Korean text"
                              className="border-pink-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3
                            className="text-sm font-medium"
                            style={{ color: "#7353E5" }}
                          >
                            Image Selection
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={selectAllImages}
                              className="border-pink-200"
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={selectLeftStrip}
                              className="border-pink-200"
                            >
                              Left Strip
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={selectRightStrip}
                              className="border-pink-200"
                            >
                              Right Strip
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearSelection}
                              className="border-pink-200"
                            >
                              Clear
                            </Button>
                          </div>

                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {duplicatedImages.map((img, index) => (
                              <div
                                key={index}
                                className={`relative cursor-pointer border-2 rounded overflow-hidden ${
                                  selectedImages.includes(index)
                                    ? "border-pink-500"
                                    : "border-transparent"
                                }`}
                                onClick={() => {
                                  toggleImageSelection(index);
                                  setSelectedImageIndex(index);
                                }}
                              >
                                <img
                                  src={img || "/placeholder.svg"}
                                  alt={`Thumbnail ${index}`}
                                  className="w-full h-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedImages.length > 0 && (
                          <div className="space-y-4">
                            <h3
                              className="text-sm font-medium"
                              style={{ color: "#FF61D2" }}
                            >
                              Image Position & Size
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Width (%)</Label>
                                <Input
                                  type="number"
                                  min="10"
                                  max="100"
                                  step="1"
                                  value={
                                    imageStyles[selectedImageIndex as number]
                                      ?.width || 85
                                  }
                                  onChange={(e) =>
                                    handleInputChange("width", e.target.value)
                                  }
                                  onBlur={(e) => {
                                    const value = Number.parseFloat(
                                      e.target.value
                                    );
                                    if (value < 10)
                                      handleInputChange("width", "10");
                                    if (value > 100)
                                      handleInputChange("width", "100");
                                  }}
                                  className="border-pink-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Height (%)</Label>
                                <Input
                                  type="number"
                                  min="10"
                                  max="100"
                                  step="1"
                                  value={
                                    imageStyles[selectedImageIndex as number]
                                      ?.height || 85
                                  }
                                  onChange={(e) =>
                                    handleInputChange("height", e.target.value)
                                  }
                                  onBlur={(e) => {
                                    const value = Number.parseFloat(
                                      e.target.value
                                    );
                                    if (value < 10)
                                      handleInputChange("height", "10");
                                    if (value > 100)
                                      handleInputChange("height", "100");
                                  }}
                                  className="border-pink-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Left (%)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={
                                    imageStyles[selectedImageIndex as number]
                                      ?.left || 0
                                  }
                                  onChange={(e) =>
                                    handleInputChange("left", e.target.value)
                                  }
                                  onBlur={(e) => {
                                    const value = Number.parseFloat(
                                      e.target.value
                                    );
                                    if (value < 0)
                                      handleInputChange("left", "0");
                                    if (value > 100)
                                      handleInputChange("left", "100");
                                  }}
                                  className="border-pink-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Top (%)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={
                                    imageStyles[selectedImageIndex as number]
                                      ?.top || 0
                                  }
                                  onChange={(e) =>
                                    handleInputChange("top", e.target.value)
                                  }
                                  onBlur={(e) => {
                                    const value = Number.parseFloat(
                                      e.target.value
                                    );
                                    if (value < 0)
                                      handleInputChange("top", "0");
                                    if (value > 100)
                                      handleInputChange("top", "100");
                                  }}
                                  className="border-pink-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Right (%)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={
                                    imageStyles[selectedImageIndex as number]
                                      ?.right || 0
                                  }
                                  onChange={(e) =>
                                    handleInputChange("right", e.target.value)
                                  }
                                  onBlur={(e) => {
                                    const value = Number.parseFloat(
                                      e.target.value
                                    );
                                    if (value < 0)
                                      handleInputChange("right", "0");
                                    if (value > 100)
                                      handleInputChange("right", "100");
                                  }}
                                  className="border-pink-200"
                                />
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={applyToColumn}
                                className="border-pink-200"
                              >
                                Apply to Column
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={applyToAll}
                                className="border-pink-200"
                              >
                                Apply to All
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Modern Loader Overlay - shown when downloading */}
      {isDownloading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md"
        >
          <div className="relative">
            {/* Animated circles */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full"
              style={{
                background: "linear-gradient(135deg, #FF61D2, #FE9090)",
                marginTop: "-64px",
                marginLeft: "-64px",
                filter: "blur(20px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full"
              style={{
                background: "linear-gradient(135deg, #0BA4E0, #7353E5)",
                marginTop: "-48px",
                marginLeft: "-48px",
                filter: "blur(15px)",
              }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                delay: 0.3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            {/* Spinner */}
            <div
              className="relative z-10 w-20 h-20 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: "#FF61D2",
                borderTopColor: "transparent",
              }}
            />

            {/* Floating elements */}
            <div className="absolute inset-0 w-64 h-64">
              {Array.from({ length: 8 }).map((_, i) => {
                const isHeart = i % 2 === 0;
                const size = Math.random() * 15 + 10;
                const colors = [
                  "#FF61D2",
                  "#FE9090",
                  "#FFD166",
                  "#0BA4E0",
                  "#7353E5",
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = `${Math.random() * 100}%`;
                const top = `${Math.random() * 100}%`;

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
                      y: [0, -20, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      rotate: [0, Math.random() * 360, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2 + Math.random() * 2,
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
              })}
            </div>
          </div>

          <motion.div
            className="mt-8 text-center bg-white rounded-lg p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3
              className="text-2xl font-bold mb-2 bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #FF61D2, #7353E5)",
                fontFamily: "var(--font-dancing)",
              }}
            >
              Creating Your Masterpiece
            </h3>
            <p className="text-gray-600">
              Please wait while we process your photos...
            </p>
          </motion.div>
        </motion.div>
      )}

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

      {/* Final Photo Selection Dialog */}
      <Dialog open={showFinalDialog} onOpenChange={setShowFinalDialog}>
        <DialogContent className="bg-white/90 backdrop-blur-md border-pink-100">
          <DialogTitle className="text-center" style={{ color: "#FF61D2" }}>
            Select 4 Final Photos
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose exactly 4 images to use for the final output. You can select
            from both the original and retake images.
          </DialogDescription>
          <div className="grid grid-cols-4 gap-4 my-4">
            {[...originalImages, ...retakeImages].map((img, idx) => (
              <div
                key={idx}
                className={`relative border-4 rounded-lg cursor-pointer ${
                  finalSelection.includes(img)
                    ? "border-pink-500"
                    : "border-transparent"
                }`}
                onClick={() => handleToggleFinal(img)}
              >
                <img
                  src={img || "/placeholder.svg"}
                  alt={`Final ${idx + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                {finalSelection.includes(img) && (
                  <span className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    {finalSelection.indexOf(img) + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={handleConfirmFinal}
              disabled={finalSelection.length !== 4}
              style={{
                background: "linear-gradient(to right, #FF61D2, #7353E5)",
                color: "white",
              }}
            >
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Confirmation Dialog */}
      <Dialog open={showDownloadConfirm} onOpenChange={setShowDownloadConfirm}>
        <DialogContent className="bg-white/90 backdrop-blur-md border-pink-100">
          <DialogTitle className="text-center" style={{ color: "#FF61D2" }}>
            Confirm Download
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to download your photo? This action cannot be
            undone and will end your current session.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDownloadConfirm(false)}
              className="border-pink-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadConfirmed}
              disabled={isDownloading}
              style={{
                background: "linear-gradient(to right, #FF61D2, #7353E5)",
                color: "white",
              }}
            >
              {isDownloading ? "Processing..." : "Confirm Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-white/90 backdrop-blur-md border-pink-100">
          <DialogTitle className="text-center" style={{ color: "#7353E5" }}>
            Enter Password
          </DialogTitle>
          <DialogDescription className="text-center">
            Please enter the password to access developer mode.
          </DialogDescription>
          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="border-pink-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePasswordSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              className="border-pink-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              style={{
                background: "linear-gradient(to right, #FF61D2, #7353E5)",
                color: "white",
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
