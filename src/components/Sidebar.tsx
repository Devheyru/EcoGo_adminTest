"use client";

import { useEffect, useRef, useState } from "react";
import {
  LogOut,
  Menu,
  X,
  Plus,
  Minus,
  PlusCircle,
  Edit,
} from "lucide-react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { menuItems } from "./SidebarData";
import { RolePermissions } from "@/types/role";
import { hasPermission } from "@/lib/roles";
import logo from "../../src/assets/ecogo-logo.png";

interface SidebarProps {
  userPermissions: RolePermissions;
  userName: string;
}

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

  // Helper to handle Add/Edit clicks without triggering navigation
  const handleActionClick = (e: React.MouseEvent, action: string, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`${action} clicked for ${id}`);
    // You can replace this with router.push to a specific modal or page
    // e.g. router.push(`/${id}/${action}`);
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

  // Modified Toggle: Closes all others when opening a new one
  const toggleDropdown = (menuId: string) => {
    setExpandedMenus((prev) => {
      const isCurrentlyOpen = prev[menuId];
      // If we are opening this menu (it's currently closed),
      // we want to return an object where ONLY this menuId is true.
      // If we are closing it, we return an empty object (or just this one false).
      
      if (!isCurrentlyOpen) {
        // Close everything else, open this one
        return { [menuId]: true };
      } else {
        // Close this one (and effectively everything else)
        return {}; 
      }
    });
  };
  
  // Specific toggle for nested items (Level 2) to avoid closing the parent (Level 1)
  const toggleSubDropdown = (subId: string, parentId: string) => {
      setExpandedMenus((prev) => {
          // Keep the parent open, toggle the specific child, close siblings
          const newState = { [parentId]: true }; 
          // If the sub is currently closed, we open it. 
          // Note: This logic assumes we want only one sub-menu open at a time too. 
          // If you want multiple sub-menus open, use: { ...prev, [subId]: !prev[subId] }
          if (!prev[subId]) {
              newState[subId] = true; 
          }
          return newState;
      });
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

  // Reusable Action Buttons Component
  const ActionButtons = ({ id }: { id: string }) => (
    <div className="flex gap-1 ml-2 opacity-50 hover:opacity-100 transition-opacity">
      <button 
        onClick={(e) => handleActionClick(e, "add", id)}
        className="p-0.5 hover:text-[#2DB85B]"
        title="Add"
      >
        <PlusCircle className="w-3 h-3" />
      </button>
      <button 
        onClick={(e) => handleActionClick(e, "edit", id)}
        className="p-0.5 hover:text-[#2DB85B]"
        title="Edit"
      >
        <Edit className="w-3 h-3" />
      </button>
    </div>
  );

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
        className={`fixed md:static top-0 left-0 h-full z-40 w-60 flex flex-col transition-transform duration-300
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
              background-color: #3a4750;
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
            // Only runs on mount or path change, doesn't interfere with manual toggle
            useEffect(() => {
              if (rowActive && item.isDropdown && !isExpanded) {
                // We use setExpandedMenus with a functional update to merge carefully
                // However, for accordion style, we usually just want this one open.
                // But on initial load, we might need to set it without user interaction.
                setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
              }
              // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [rowActive, item.isDropdown, item.id]); 

            const handler = () => toggleDropdown(item.id);
            const showDropdown = !!item.isDropdown;

            if (showDropdown) {
              return (
                <div key={item.id}>
                  {/* PARENT DROPDOWN ROW (Level 1) */}
                  <div
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-lg mb-1 transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                    style={{
                      backgroundColor: rowActive ? "#3A4750" : "transparent",
                      color: rowActive ? "#2DB85B" : "white",
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#2DB85B]" />

                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <button
                        type="button"
                        onClick={handler}
                        aria-expanded={isExpanded}
                        className="text-[12px] font-medium leading-[22px] text-left truncate flex-1"
                        style={{
                          color: rowActive || isExpanded ? "#2DB85B" : "inherit",
                        }}
                      >
                        {item.label}
                      </button>
                      <ActionButtons id={item.id} />
                    </div>

                    <button onClick={handler} className="p-1 shrink-0">
                      {isExpanded ? (
                        <Minus className="w-3 h-3" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* SUB ITEMS (Level 2) */}
                  {isExpanded && (
                    <div className="ml-6 border-l border-gray-700 pl-2">
                      {subItems.map((sub: any) => {
                        const subActive = currentPage === sub.id;

                        if ("children" in sub && Array.isArray(sub.children)) {
                          const isParentExpanded = !!expandedMenus[sub.id];
                          const parentActive = sub.children.some(
                            (c: any) => currentPage === c.id
                          );

                          return (
                            <div key={sub.id} className="mb-1">
                              <div 
                                className="w-full flex items-center gap-2 px-2 py-1 rounded-lg transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                                style={{
                                  backgroundColor:
                                    isParentExpanded || parentActive
                                      ? "#3A4750"
                                      : "transparent",
                                  color:
                                    isParentExpanded || parentActive
                                      ? "#2DB85B"
                                      : "white",
                                }}
                              >
                                <div className="flex-1 flex items-center justify-between min-w-0">
                                  <button
                                    onClick={() => toggleSubDropdown(sub.id, item.id)}
                                    className="text-[12px] text-left truncate flex-1"
                                  >
                                    {sub.label}
                                  </button>
                                  <ActionButtons id={sub.id} />
                                </div>

                                <button onClick={() => toggleSubDropdown(sub.id, item.id)} className="p-1 shrink-0">
                                  {isParentExpanded ? (
                                    <Minus className="w-3 h-3" />
                                  ) : (
                                    <Plus className="w-3 h-3" />
                                  )}
                                </button>
                              </div>

                              {/* GRANDCHILDREN (Level 3) */}
                              {isParentExpanded && (
                                <div className="ml-2 mt-1 space-y-1 border-l border-gray-700 pl-2">
                                  {sub.children.map(
                                    (child: { id: string; label: string }) => {
                                      const childActive = currentPage === child.id;

                                      return (
                                        <div 
                                          key={child.id}
                                          className="flex items-center justify-between px-2 py-1 rounded-lg transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                                          style={{
                                            backgroundColor: childActive
                                              ? "#3A4750"
                                              : "transparent",
                                            color: childActive
                                              ? "#2DB85B"
                                              : "white",
                                          }}
                                        >
                                          <Link
                                            href={`/${child.id}`}
                                            onClick={(e) =>
                                              handleLinkClick(e as any, `/${child.id}`)
                                            }
                                            className="text-[10px] block flex-1 truncate"
                                          >
                                            {child.label}
                                          </Link>
                                          <ActionButtons id={child.id} />
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Regular sub-item link (Level 2 no children)
                        return (
                          <div 
                            key={sub.id}
                            className="w-full flex items-center gap-2 px-2 py-1 mb-1 rounded-lg transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                            style={{
                              backgroundColor: subActive
                                ? "#3A4750"
                                : "transparent",
                              color: subActive ? "#2DB85B" : "white",
                            }}
                          >
                            <div className="flex-1 flex items-center justify-between min-w-0">
                              <Link
                                href={`/${sub.id}`}
                                onClick={(e) =>
                                  handleLinkClick(e as any, `/${sub.id}`)
                                }
                                className="text-[12px] block flex-1 truncate"
                              >
                                {sub.label}
                              </Link>
                              <ActionButtons id={sub.id} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // NON-DROPDOWN ITEM (Level 1)
            return (
              <div
                key={item.id}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-lg mb-1 transition duration-150 ease-in-out hover:bg-[#3A4750] hover:text-[#2DB85B]"
                style={{
                  backgroundColor: isActive ? "#3A4750" : "transparent",
                  color: isActive ? "#2DB85B" : "white",
                }}
              >
                 <Icon className="w-4 h-4 shrink-0" />
                 <div className="flex-1 flex items-center justify-between min-w-0">
                    <Link
                      href={`/${item.id}`}
                      onClick={(e) => handleLinkClick(e as any, `/${item.id}`)}
                      className="text-sm font-semibold block flex-1 truncate"
                    >
                      {item.label}
                    </Link>
                    <ActionButtons id={item.id} />
                 </div>
              </div>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 ease-in-out hover:font-extrabold hover:text-base hover:text-gray-400"
            style={{ backgroundColor: "transparent" }}
          >
            <LogOut className="w-4 h-4" />
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