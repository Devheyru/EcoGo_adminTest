"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  FileText,
  LogOut,
  Shield,
  ChevronDown,
  ChevronUp,
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
  const [isOperationsExpanded, setIsOperationsExpanded] = useState(false);
  const [isSystemExpanded, setIsSystemExpanded] = useState(false);

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
    { id: "drivers", label: "Drivers", count: 422 },
    { id: "riders", label: "Riders", count: 432 },
    { id: "admins", label: "Admins", count: 202 },
    { id: "operators", label: "Operators", count: 303 },
  ];

  // Keep Users submenu open when on any of its subpages
  const userSubIds = userManagementItems.map((i) => i.id);
  const showUsersMenu = isUserMenuExpanded;

  return (
    <aside
      className="w-50 flex flex-col h-full"
      style={{ backgroundColor: "var(--charcoal-dark)" }}
    >
      {/* Logo Section */}
      <div className="p-6 " style={{ borderColor: "var(--gray-mid)" }}>
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="EcoGo Logo"
            width={60}
            height={60}
            className="rounded-[10px]"
          />
          <div>
            <h3 className="text-white">EcoGo</h3>
            {/* <p className="text-xs" style={{ color: "#D0F5DC" }}>
              Admin Panel
            </p> */}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-2 mb-2">
        <div className="flex items-center gap-2 mb-1">
          {/* <Shield className="w-4 h-4" style={{ color: "var(--white)" }} /> */}
          <span
            className="text-sm uppercase tracking-wide font-semibold pl-3"
            style={{ color: "var(--white)" }}
          >
            {userRole}
          </span>
        </div>
        {/* <p className="text-white truncate">{userName}</p> */}
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          // Users group with checkbox-controlled expansion (no icon)
          if (item.id === "users") {
            return (
              <div key={item.id}>
                <div
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1"
                  style={{ backgroundColor: "transparent", color: "white" }}
                >
                  <input
                    type="checkbox"
                    checked={isUserMenuExpanded}
                    onChange={(e) => setIsUserMenuExpanded(e.target.checked)}
                    className="accent-[#2DB85B] w-4 h-4"
                    aria-label="Toggle Users section"
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </div>
                {/* Dropdown Menu */}
                {showUsersMenu && (
                  <div className="ml-4 mb-2 space-y-1">
                    {userManagementItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => onNavigate(subItem.id)}
                        className="w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm"
                        style={{
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                      >
                        {/* LEFT SIDE: label only (no checkbox) */}
                        <div className="flex items-center gap-3">
                          <span>{subItem.label}</span>
                        </div>

                        {/* RIGHT SIDE: count */}
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{}}
                        >
                          {subItem.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Operations group with checkbox (no icon)
          if (item.id === "operations") {
            return (
              <div key={item.id}>
                <div
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1"
                  style={{ backgroundColor: "transparent", color: "white" }}
                >
                  <input
                    type="checkbox"
                    checked={isOperationsExpanded}
                    onChange={(e) => setIsOperationsExpanded(e.target.checked)}
                    className="accent-[#2DB85B] w-4 h-4"
                    aria-label="Toggle Operations section"
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </div>
                {isOperationsExpanded && (
                  <div className="ml-4 mb-2 space-y-1">
                    {[
                      { id: "bookings", label: "Bookings" },
                      { id: "refunds", label: "Refunds" },
                      { id: "safety", label: "Safety" },
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(sub.id)}
                        className="w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm"
                        style={{
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span>{sub.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          // System group with checkbox (no icon)
          if (item.id === "system") {
            return (
              <div key={item.id}>
                <div
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1"
                  style={{ backgroundColor: "transparent", color: "white" }}
                >
                  <input
                    type="checkbox"
                    checked={isSystemExpanded}
                    onChange={(e) => setIsSystemExpanded(e.target.checked)}
                    className="accent-[#2DB85B] w-4 h-4"
                    aria-label="Toggle System section"
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </div>
                {isSystemExpanded && (
                  <div className="ml-4 mb-2 space-y-1">
                    {[
                      { id: "reports", label: "Audit Logs" },
                      { id: "settings", label: "Settings" },
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => onNavigate(sub.id)}
                        className="w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm"
                        style={{
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span>{sub.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors"
              style={{
                backgroundColor: "transparent",
                color: "white",
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
          className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-colors"
          style={{ color: "white", backgroundColor: "gray-500" }}
          onMouseEnter={(e) => (e.currentTarget.style.fontWeight = "bold")}
          onMouseLeave={(e) => (e.currentTarget.style.fontWeight = "normal")}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
      {/* Footer */}
      <div
        className="p-4 text-center text-xs"
        style={{ color: "var(--gray-light)" }}
      >
        © 2025 EcoGo Canada
      </div>
    </aside>
  );
}