"use client";

import React from "react";
import { Clock } from "lucide-react";
import { BRAND_COLORS } from "../lib/brandColors";

// --- START BRAND_COLORS PLACEHOLDER ---
// Using assumed values based on the "EcoGo" context and general UI best practices.
// const BRAND_COLORS = {
//   ecoGreen: "#1CA547", // The vibrant EcoGo Green
//   white: "#FFFFFF",
//   darkCharcoal: "#2F3A3F", // Used for Headings (darkest text)
//   charcoalText: "#5C6B73", // Used for Body Text (muted gray)
//   midGray: "#E5E7EB", // Used for subtle borders
//   lightGray: "#F7F9FA", // Used for the main background
// };
// --- END BRAND_COLORS PLACEHOLDER ---

export default function ComingSoon() {
  const ecoGreen = BRAND_COLORS.ecoGreen;

  return (
    // Main Container: Soft background with a slight dark texture overlay
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-12 transition-all duration-500"
      style={{
       
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Central Card: Highly styled, prominent, using the brand green for flair */}
      <div
        className="
          bg-white 
          shadow-2xl 
          rounded-3xl 
          p-8 sm:p-12 
          max-w-lg 
          w-full 
          border-t-8 
          transition-all duration-500
          hover:shadow-3xl
        "
        style={{
          borderColor: ecoGreen, // Top border in EcoGo Green
          transform: "translateY(0)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)", // Custom shadow for depth
        }}
      >
        {/* Icon and Animated Ring */}
        <div className="flex items-center justify-center mb-8 relative">
          {/* Pulsing ring effect */}
          <div
            className="absolute w-24 h-24 rounded-full opacity-30 animate-ping"
            style={{ backgroundColor: ecoGreen }}
          ></div>

          {/* Icon Container */}
          <div
            className="relative flex items-center justify-center w-20 h-20 rounded-full text-white shadow-lg z-10"
            style={{ backgroundColor: ecoGreen }}
          >
            <Clock size={36} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-4xl font-extrabold mb-4 tracking-tight"
          style={{ color: BRAND_COLORS.darkCharcoal }}
        >
          Feature Under Development
        </h1>

        {/* Sub-text / Description */}
        <p
          className="text-lg leading-relaxed mb-8"
          style={{ color: BRAND_COLORS.charcoalText }}
        >
          This feature is almost ready. We’re polishing the EcoGo tools to
          ensure everything runs smoothly. Thanks for your patience
        </p>

        {/* Call to Action Button */}
        <button
          className="
            w-full 
            px-8 py-4 
            rounded-xl 
            text-lg 
            font-bold 
            transition-all 
            duration-300 
            uppercase 
            shadow-md 
            hover:shadow-lg 
            hover:brightness-110 
            active:scale-[0.98]
          "
          style={{
            backgroundColor: ecoGreen,
            color: BRAND_COLORS.white,
          }}
          onClick={() => window.history.back()}
        >
          Go Back to Dashboard
        </button>
      </div>

      {/* Footer / Copyright */}
      <p className="text-sm mt-10" style={{ color: BRAND_COLORS.charcoalText }}>
        &copy; 2025 EcoGo Management. All rights reserved.
      </p>
    </div>
  );
}
