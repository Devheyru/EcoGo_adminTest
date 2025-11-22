"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types"; // Assuming this type is defined elsewhere
import Image from "next/image";
// Assuming logo is imported correctly, e.g., import logo from "../assets/ecogo-logo.png";
import logo from "../assets/ecogo-logo.png";

// Define the primary brand color for EcoGo
const ECO_GREEN = "#1CA547"; // A vibrant, clean green

interface LoginPageProps {
  onLogin: (email: string, password: string, role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [showTips, setShowTips] = useState(false); // Retained but not used in the UI for simplicity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, role);
  };

  return (
    // 1. Full-screen background with a subtle, light color
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <style jsx global>{`
        /* Define the EcoGo brand color globally for better consistency */
        :root {
          --eco-green: ${ECO_GREEN};
        }
      `}</style>

      {/* 2. Constrained container for the card */}
      <div className="w-full max-w-[500px] space-y-4">
        {/* Logo and Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image
              src={logo}
              alt="EcoGo Logo"
              width={80}
              height={80}
              // Rounded corners for a modern badge look
              className="rounded-2xl shadow-md"
            />
          </div>
          <div className="space-y-1">
            {/* Title: Using the brand color for emphasis */}
            <h1 className="text-3xl font-extrabold text-gray-800">
              Admin Dashboard
            </h1>
            {/* Subtitle: Using a muted text color */}
            <p className="text-sm text-gray-600">Drive Clean. Go Green.</p>
          </div>
        </div>

        {/* Login Card: Clean white, subtle shadow, rounded corners */}
        <Card className="shadow-2xl border border-gray-100 rounded-xl">
          <CardHeader className="pt-6">
            <CardTitle className="text-center font-bold text-2xl text-gray-800">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@ecogo.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  // Clean white input with border
                  className="bg-white border-gray-300 focus:border-[--eco-green] focus:ring-[--eco-green]"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="font-semibold text-gray-700"
                  >
                    Password
                  </Label>
                  {/* Forgot Password Link: Using brand color */}
                  <button
                    type="button"
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: "var(--eco-green)" }}
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-gray-300 focus:border-[--eco-green] focus:ring-[--eco-green]"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Sign in as
                </Label>
                <div className="flex gap-2 ">
                  <Button
                    type="button"
                    // Conditional styling for role buttons
                    className="flex-1 transition-colors duration-200"
                    style={
                      role === "admin"
                        ? {
                            backgroundColor: "var(--eco-green)",
                            color: "white",
                            borderColor: "var(--eco-green)",
                          }
                        : {
                            backgroundColor: "white",
                            color: "gray",
                            borderColor: "var(--eco-green)",
                          }
                    }
                    variant={role === "admin" ? "default" : "outline"}
                    onClick={() => setRole("admin")}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 transition-colors duration-200"
                    style={
                      role === "operator"
                        ? {
                            backgroundColor: "var(--eco-green)",
                            color: "white",
                            borderColor: "var(--eco-green)",
                          }
                        : {
                            backgroundColor: "white",
                            color: "gray",
                            borderColor: "var(--eco-green)",
                          }
                    }
                    variant={role === "operator" ? "default" : "outline"}
                    onClick={() => setRole("operator")}
                  >
                    Operator
                  </Button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="h-4 w-4 rounded text-[--eco-green] border-gray-300 focus:ring-[--eco-green]"
                  style={{ accentColor: "var(--eco-green)" }} // Native checkbox color control
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              {/* Submit Button: Solid brand green */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="  text-lg py-4 coursor-pointer hover:brightness-110 transition-all duration-200"
                  style={{
                    backgroundColor: "var(--eco-green)",
                    color: "white",
                  }}
                >
                  Sign In
                </Button>
              </div>
            </form>

            {/* Footer Links and Copyright */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-500">
                Need help? Contact{" "}
                <Link
                  href="mailto: support@ecogo.ca"
                  className="font-medium hover:underline transition-colors"
                  style={{ color: "var(--eco-green)" }}
                >
                  support@ecogo.ca
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                &copy; 2025 EcoGo Management. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
