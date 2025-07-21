"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authOperations } from "@/lib/supabase";
import { signUpSchema, type SignUpFormData } from "@/lib/validations";
import { useLandStore } from "@/lib/store";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser, setProfile, setAuthLoading } = useLandStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setAuthLoading(true);

      const { data: authData, error } = await authOperations.signUp({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      });

      if (error) {
        toast.error(error.message || "Failed to create account");
        return;
      }

      if (authData.user) {
        setUser({
          id: authData.user.id,
          email: authData.user.email!,
          created_at: authData.user.created_at,
        });

        // The profile should be automatically created by the trigger
        const { data: profileData, error: profileError } =
          await authOperations.getUserProfile(authData.user.id);

        if (profileData && !profileError) {
          setProfile(profileData);
        }

        if (authData.session) {
          toast.success(
            "Account created successfully! Welcome to Land Management System."
          );
          router.push("/dashboard");
        } else {
          toast.success(
            "Account created! Please check your email to confirm your account before signing in."
          );
          router.push("/signin");
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
      setAuthLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg"
      >
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6 sm:p-8">
            {/* Logo and Header */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-6 sm:mb-8"
            >
              <motion.div
                className="flex justify-center mb-4 sm:mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="p-2"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                  </motion.div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-700">
                    LMS
                  </span>
                </div>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2"
              >
                Welcome to
              </motion.h1>
              <motion.h2
                variants={itemVariants}
                className="text-lg sm:text-xl font-medium text-gray-800 mb-3 sm:mb-4"
              >
                Land Management System
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-gray-600 text-sm"
              >
                Enter your information below to continue
              </motion.p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-5"
              variants={containerVariants}
            >
              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                  />
                </motion.div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs sm:text-sm text-red-500"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              {/* First Name and Last Name */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-sm font-medium text-gray-700"
                  >
                    First name
                  </Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="Enter your first name"
                      {...register("first_name")}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                    />
                  </motion.div>
                  {errors.first_name && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs sm:text-sm text-red-500"
                    >
                      {errors.first_name.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="last_name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last name
                  </Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Enter your last name"
                      {...register("last_name")}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                    />
                  </motion.div>
                  {errors.last_name && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs sm:text-sm text-red-500"
                    >
                      {errors.last_name.message}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Create Password and Confirm Password */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Create Password
                  </Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </motion.button>
                  </motion.div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs sm:text-sm text-red-500"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                    />
                    <motion.button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </motion.button>
                  </motion.div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs sm:text-sm text-red-500"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-3 sm:pt-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm sm:text-base rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isSubmitting || isLoading ? (
                      <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span className="text-sm sm:text-base">
                          Creating Account...
                        </span>
                      </motion.div>
                    ) : (
                      <span className="text-sm sm:text-base">
                        Create Account
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Sign In Link */}
              <motion.div
                variants={itemVariants}
                className="text-center pt-3 sm:pt-4"
              >
                <p className="text-xs sm:text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="inline-block"
                    >
                      Sign In
                    </motion.span>
                  </Link>
                </p>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
 