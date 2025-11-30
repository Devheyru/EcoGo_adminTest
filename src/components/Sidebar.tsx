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
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { menuItems } from "./SidebarData";
import { RolePermissions } from "@/types/role";
import { hasPermission } from "@/lib/roles";

interface SidebarProps {
  userPermissions: RolePermissions;
  userName: string;
}

import Image from "next/image";
import logo from "../../src/assets/ecogo-logo.png";
import { usePathname } from "next/navigation";

export function Sidebar({ userPermissions, userName }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Remove leading slash for currentPage matching logic
  const currentPage = pathname?.replace(/^\//, "") || "dashboard";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    e.preventDefault();
    setIsSidebarOpen(false);
    router.push(href);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

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

  const toggleDropdown = (menuId: string) => {
    setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems
    .filter((item) => {
      if (!item.requiredPermission) return true;
      return hasPermission(
        userPermissions,
        item.requiredPermission.resource,
        item.requiredPermission.action
      );
    })
    .map((item) => {
      // Deep copy to avoid mutating original
      const newItem = { ...item };
      if (newItem.children) {
        newItem.children = newItem.children
          .filter((child) => {
            if (!child.requiredPermission) return true;
            return hasPermission(
              userPermissions,
              child.requiredPermission.resource,
              child.requiredPermission.action
            );
          })
          .map((child) => {
            const newChild = { ...child };
            if (newChild.children) {
              newChild.children = newChild.children.filter((grandChild) => {
                if (!grandChild.requiredPermission) return true;
                return hasPermission(
                  userPermissions,
                  grandChild.requiredPermission.resource,
                  grandChild.requiredPermission.action
                );
              });
            }
            return newChild;
          });
      }
      return newItem;
    });

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

      {/* Mobile Close Button */}
      {isSidebarOpen && (
        <button
          className="md:hidden fixed top-4 right-4 z-60 p-2 rounded text-white"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed md:static top-0 left-0 h-full z-40 w-64 flex flex-col transition-transform duration-300
        bg-(--charcoal-dark) ${
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

        {/* Navigation */}
        <nav
          className="flex-1 px-3 overflow-y-auto"
          // Custom CSS for thinner scrollbar
          style={{
            scrollbarWidth: "thin", // Firefox
            scrollbarColor: "#3A4750 transparent", // Firefox
          }}
        >
          {/* Webkit scrollbar for Chrome, Safari, Edge */}
          <style jsx global>{`
            .flex-1.px-3.overflow-y-auto::-webkit-scrollbar {
              width: 6px;
            }
            .flex-1.px-3.overflow-y-auto::-webkit-scrollbar-thumb {
              background-color: #3a4750; /* A slightly lighter shade of the sidebar background */
              border-radius: 3px;
            }
          `}</style>

          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isExpanded = !!expandedMenus[item.id];
            const subItems = Array.isArray((item as any).children)
              ? (item as any).children
              : [];

            const hasActiveDescendant = (nodes: any[]): boolean => {
              return nodes.some((n) => {
                if (n.id === currentPage) return true;
                if (Array.isArray(n.children) && n.children.length)
                  return hasActiveDescendant(n.children);
                return false;
              });
            };

            const rowActive =
              isActive ||
              (subItems.length > 0 && hasActiveDescendant(subItems));

            // Logic to auto-expand parent if an active child is found
            useEffect(() => {
              if (rowActive && item.isDropdown && !isExpanded) {
                setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
              }
            }, [rowActive, item.isDropdown, isExpanded, item.id]);

            const handler = () => toggleDropdown(item.id);
            const showDropdown = !!item.isDropdown;

            if (showDropdown) {
              return (
                <div key={item.id}>
                  {/* PARENT DROPDOWN ROW */}
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                    style={{
                      backgroundColor: rowActive ? "#3A4750" : "transparent",
                      // Color is now always white unless active (icon/chevron/text)
                      color: rowActive ? "#2DB85B" : "white",
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />

                    <button
                      type="button"
                      onClick={handler}
                      aria-expanded={isExpanded}
                      className="flex-1 text-sm font-semibold leading-[22px] text-left"
                      style={{
                        color: rowActive || isExpanded ? "#2DB85B" : "inherit",
                      }} // Keep text color for active/expanded
                    >
                      {item.label}
                    </button>

                    <button onClick={handler} className="p-1">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* SUB ITEMS */}
                  {isExpanded && (
                    <div className="ml-4 mb-2 space-y-1">
                      {subItems.map((sub: any) => {
                        const subActive = currentPage === sub.id;

                        if ("children" in sub && Array.isArray(sub.children)) {
                          const isParentExpanded = !!expandedMenus[sub.id];
                          const parentActive = sub.children.some(
                            (c: any) => currentPage === c.id
                          );

                          return (
                            <div key={sub.id}>
                              <button
                                onClick={() => toggleDropdown(sub.id)}
                                className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                                style={{
                                  backgroundColor:
                                    isParentExpanded || parentActive
                                      ? "#3A4750"
                                      : "transparent",
                                  color:
                                    isParentExpanded || parentActive
                                      ? "#2DB85B" // Green for active/expanded parent
                                      : "white", // White for inactive
                                }}
                              >
                                {sub.label}
                                {isParentExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>

                              {isParentExpanded && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {sub.children.map(
                                    (child: { id: string; label: string }) => {
                                      const childActive =
                                        currentPage === child.id;

                                      return (
                                        <Link
                                          key={child.id}
                                          href={`/${child.id}`}
                                          onClick={(e) =>
                                            handleLinkClick(
                                              e as any,
                                              `/${child.id}`
                                            )
                                          }
                                          className="block px-4 py-2 rounded-lg text-sm transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                                          style={{
                                            backgroundColor: childActive
                                              ? "#3A4750"
                                              : "transparent",
                                            color: childActive
                                              ? "#2DB85B" // Green for active child
                                              : "white", // White for inactive child
                                          }}
                                        >
                                          {child.label}
                                        </Link>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Regular sub-item link
                        return (
                          <Link
                            key={sub.id}
                            href={`/${sub.id}`}
                            onClick={(e) =>
                              handleLinkClick(e as any, `/${sub.id}`)
                            }
                            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                            style={{
                              backgroundColor: subActive
                                ? "#3A4750"
                                : "transparent",
                              color: subActive ? "#2DB85B" : "white", // Green for active link
                            }}
                          >
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // NON-DROPDOWN ITEM
            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                onClick={(e) => handleLinkClick(e as any, `/${item.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 cursor-pointer transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                style={{
                  backgroundColor: isActive ? "#3A4750" : "transparent",
                  color: isActive ? "#2DB85B" : "white", // Green for active link
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg text-white font-semibold transition-all duration-200 ease-in-out hover:font-extrabold hover:text-base hover:text-[#2DB85B]"
            style={{ backgroundColor: "transparent" }} // Removed static background color
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
        <div className="p-4 text-center text-xs text-gray-400">
          © 2025 EcoGo Canada
        </div>
      </aside>
    </>
  );
}
