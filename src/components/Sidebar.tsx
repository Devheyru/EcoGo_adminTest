"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { UserRole } from "@/types";
import Image from "next/image";
import logo from "../assets/ecogo-logo.png";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

export function Sidebar({
  currentPage,
  onNavigate,
  userRole,
  userName,
  onLogout,
}: SidebarProps) {
  const [isUserMenuExpanded, setIsUserMenuExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    function handleClickAnywhere() {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    }

    // Close sidebar on any click
    document.addEventListener("mousedown", handleClickAnywhere);

    return () => {
      document.removeEventListener("mousedown", handleClickAnywhere);
    };
  }, [isSidebarOpen]);

  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "operations", label: "Operations", icon: Calendar },
    { id: "system", label: "System", icon: Settings },
  ];

  const operatorMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : operatorMenuItems;

  const userManagementItems = [
    { id: "drivers", label: "Drivers", count: 4 },
    { id: "riders", label: "Riders", count: 6 },
    { id: "admins", label: "Admins", count: 5 },
    { id: "operators", label: "Operators", count: 4 },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded text-black shadow"
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarOpen(!isSidebarOpen);
        }}
      >
        {isSidebarOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <Menu className="w-4 h-4" />
        )}
      </button>

      <aside
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

            if (item.id === "users") {
              return (
                <div key={item.id}>
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1"
                    style={{
                      backgroundColor: "transparent",
                      color: isActive ? "#2DB85B" : "white",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isUserMenuExpanded}
                      onChange={(e) => setIsUserMenuExpanded(e.target.checked)}
                      className="accent-[#2DB85B] w-4 h-4 cursor-pointer"
                    />
                    <span className="flex-1 cursor-pointer">{item.label}</span>
                  </div>

                  {isUserMenuExpanded && (
                    <div className="ml-4 mb-2 space-y-1">
                      {userManagementItems.map((sub) => {
                        const subActive = currentPage === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => onNavigate(sub.id)}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm"
                            style={{
                              backgroundColor: "transparent",
                              color: subActive ? "#2DB85B" : "white",
                            }}
                          >
                            <span>{sub.label}</span>
                            <span className="px-2 py-0.5 text-xs">
                              {sub.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 cursor-pointer"
                style={{
                  backgroundColor: "transparent",
                  color: isActive ? "#2DB85B" : "white",
                }}
              >
                <Icon className="w-5 h-5" />
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
