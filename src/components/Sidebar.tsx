"use client";

import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight, // Added for dropdown arrow
  ChevronDown, // Added for dropdown arrow
} from "lucide-react";

// Assuming these types are defined elsewhere or passed correctly
// type UserRole = "admin" | "operator";
// interface SidebarProps { ... }

// Dummy types to satisfy the component if external ones aren't available for preview
type UserRole = "admin" | "operator";
// Note: I will use the actual imported types UserRole and logo from the original context
// import { UserRole } from "@/types";
// import logo from "../assets/ecogo-logo.png";
// The following interface is included to ensure the code block is self-contained and runnable
interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

// NOTE: Since I don't have access to your specific `logo` and `UserRole` imports, I will assume they work and only include necessary standard imports.
import Image from "next/image";
// Assuming the following import path for the logo is correct relative to the file:
import logo from "../assets/ecogo-logo.png";

export function Sidebar({
  currentPage,
  onNavigate,
  userRole,
  userName,
  onLogout,
}: SidebarProps) {
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false); // Existing state for Users dropdown
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // --- New Dropdown States ---
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isOperationsExpanded, setIsOperationsExpanded] = useState(false);
  // --- End New Dropdown States ---

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Handler to close all other menus when one is opened
  const toggleDropdown = (
    menuId: "users" | "settings" | "operations" | "bookings"
  ) => {
    switch (menuId) {
      case "users":
        setIsUserMenuExpanded(!isUserMenuExpanded);
        setIsSettingsExpanded(false);
        setIsOperationsExpanded(false);
        break;
      case "settings":
        setIsSettingsExpanded(!isSettingsExpanded);
        setIsUserMenuExpanded(false);
        setIsOperationsExpanded(false);
        break;
      case "operations":
      case "bookings": // Operator uses 'bookings' but functionality is the same
        setIsOperationsExpanded(!isOperationsExpanded);
        setIsUserMenuExpanded(false);
        setIsSettingsExpanded(false);
        break;
      default:
        break;
    }
  };

  const adminMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isDropdown: false,
    },
    { id: "users", label: "Users", icon: Users, isDropdown: true },
    { id: "operations", label: "Operations", icon: Calendar, isDropdown: true },
    { id: "system", label: "System", icon: Settings, isDropdown: true },
  ];

  const operatorMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isDropdown: false,
    },
    { id: "bookings", label: "Bookings", icon: Calendar, isDropdown: true }, // Mapped to isOperationsExpanded state
    { id: "reports", label: "Reports", icon: FileText, isDropdown: false },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : operatorMenuItems;

  const userManagementItems = [
    { id: "drivers", label: "Drivers", count: 4 },
    { id: "riders", label: "Riders", count: 6 },
    { id: "admins", label: "Admins", count: 5 },
    { id: "operators", label: "Operators", count: 4 },
  ];

  // New Dropdown Sub-menus
  const systemSettingsItems = [
    { id: "sys-config", label: "Configuration" },
    { id: "sys-api", label: "API Keys" },
    { id: "sys-audit", label: "Audit Logs" },
  ];

  const adminOperationsItems = [
    { id: "op-live", label: "Live Tracking" },
    { id: "op-pending", label: "Pending Rides" },
    { id: "op-completed", label: "Completed History" },
  ];

  const operatorBookingsItems = [
    { id: "book-new", label: "Create New Booking" },
    { id: "book-pending", label: "Pending/Assigned" },
    { id: "book-history", label: "Booking History" },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded text-black shadow"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{ backgroundColor: isSidebarOpen ? "transparent" : "white" }}
      >
        {isSidebarOpen ? "" : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile Close Button (when sidebar is open) */}
      {isSidebarOpen && (
        <button
          className="md:hidden fixed top-4 right-4 z-[60] p-2 rounded text-white"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed md:static top-0 left-0 h-full z-40 w-50 flex flex-col transition-transform duration-300
        bg-[var(--charcoal-dark)] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6">
          <Image
            src={logo}
            alt="EcoGo Logo"
            width={60}
            height={60}
            className="rounded-[10px]"
          />
        </div>

        {/* Role */}
        <div className="px-6 py-2 mb-2">
          <span className="text-sm uppercase tracking-wide font-semibold pl-3 text-white">
            {userRole}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            let isExpanded = false;
            let subItems: { id: string; label: string; count?: number }[] = [];
            let handler = () => onNavigate(item.id);
            let showDropdown = item.isDropdown;

            // Determine dropdown state and sub-items based on item ID
            if (item.id === "users") {
              isExpanded = isUserMenuExpanded;
              subItems = userManagementItems;
              handler = () => toggleDropdown("users");
            } else if (item.id === "system") {
              isExpanded = isSettingsExpanded;
              subItems = systemSettingsItems;
              handler = () => toggleDropdown("settings");
            } else if (item.id === "operations") {
              isExpanded = isOperationsExpanded;
              subItems = adminOperationsItems;
              handler = () => toggleDropdown("operations");
            } else if (item.id === "bookings") {
              // Operator role
              isExpanded = isOperationsExpanded;
              subItems = operatorBookingsItems;
              handler = () => toggleDropdown("bookings");
            }

            if (showDropdown) {
              return (
                <div key={item.id}>
                  <button
                    onClick={handler}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 cursor-pointer"
                    style={{
                      backgroundColor: "transparent",
                      color: isActive || isExpanded ? "#2DB85B" : "white",
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-4 mb-2 space-y-1">
                      {subItems.map((sub) => {
                        const subActive = currentPage === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onNavigate(sub.id);
                              setIsSidebarOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors duration-150"
                            style={{
                              backgroundColor: subActive
                                ? "#3A4750"
                                : "transparent",
                              color: subActive ? "#2DB85B" : "white",
                            }}
                          >
                            <span className="text-left">{sub.label}</span>
                            {sub.count !== undefined && (
                              <span
                                className="px-2 py-0.5 text-xs rounded-full"
                                style={{
                                  backgroundColor: subActive
                                    ? "#2DB85B"
                                    : "rgba(255,255,255,0.2)",
                                  color: subActive ? "white" : "white",
                                }}
                              >
                                {sub.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Non-dropdown menu item
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 cursor-pointer"
                style={{
                  backgroundColor: isActive ? "#3A4750" : "transparent",
                  color: isActive ? "#2DB85B" : "white",
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{
              backgroundColor: "gray-500",
              color: "white",
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="p-4 text-center text-xs text-gray-400">
          © 2025 EcoGo Canada
        </div>
      </aside>
    </>
  );
}
