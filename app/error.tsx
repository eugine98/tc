"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-200">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-amber-400 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-amber-500 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-amber-300 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10 max-w-md px-4"
      >
        <div className="mb-6 flex justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: 3,
              duration: 0.5,
              ease: "easeInOut",
            }}
            className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center shadow-lg"
          >
            <AlertTriangle size={36} className="text-white" />
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-amber-800 mb-4">Something went wrong!</h2>
        <p className="text-amber-700 mb-6">
          We encountered an error while processing your request. Please try again or return to the home page.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => reset()} className="bg-amber-600 hover:bg-amber-700 text-white">
            Try again
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
