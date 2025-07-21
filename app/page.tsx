"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Welcome Content */}
      <motion.div
        className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-8 lg:p-12 order-2 lg:order-1"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-md w-full">
          {/* Logo */}
          <motion.div
            className="flex items-center mb-8 lg:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="p-3 bg-blue-100 rounded-full mr-4"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold text-gray-800">
              LMS
            </span>
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            className="mb-8 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Welcome to our
            </motion.h1>
            <motion.h2
              className="text-xl sm:text-2xl lg:text-2xl font-semibold text-gray-800 mb-4 lg:mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Land Management System
            </motion.h2>
            <motion.p
              className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 lg:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Register land in minutes, not weeks. Track your application status
              in real-time. No more paperwork or in-person visits.
            </motion.p>
          </motion.div>

          {/* Get Started Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  Get Started
                </Button>
              </motion.div>
                  </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Image */}
      <motion.div
        className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen relative overflow-hidden order-1 lg:order-2"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/land2.jpg')",
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Subtle Blue Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/80 via-transparent to-blue-700/80"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
