"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoginPage } from "@/components/LoginPage";
import { Sidebar } from "@/components/Sidebar";
import { DashboardPage } from "@/components/DashboardPage";
import { UsersPage } from "@/components/UsersPage";
import { DriversPage } from "@/components/DriversPage";
import { RidersPage } from "@/components/RidersPage";
import { AdminsPage } from "@/components/AdminsPage";
import { OperatorsPage } from "@/components/OperatorsPage";
import { BookingsPage } from "@/components/BookingsPage";
import { ReportsPage } from "@/components/ReportsPage";
import { SettingsPage } from "@/components/SettingsPage";
import ComingSoon from "@/components/ComingSoon";
import { UserRole } from "@/types";
import { auth, db } from "@/firebase/config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

// Simple module-level cache to retain auth/UI state across route remounts
let __APP_SHELL_CACHE: {
  isLoggedIn: boolean;
  userRole: UserRole;
  userName: string;
} | null = null;

export function AppShell() {
  const router = useRouter();
  const pathname = usePathname();

  // Avoid hydration mismatches by rendering only after mount
  const [mounted, setMounted] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(
    __APP_SHELL_CACHE?.isLoggedIn ?? false
  );
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [userRole, setUserRole] = useState<UserRole>(
    __APP_SHELL_CACHE?.userRole ?? "admin"
  );
  const [userName, setUserName] = useState(__APP_SHELL_CACHE?.userName ?? "");
  const [authChecking, setAuthChecking] = useState(true);

  // Mark mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync path -> currentPage and subscribe to Firebase Auth state
  useEffect(() => {
    if (pathname) {
      const page = pathname.replace(/^\//, "") || "dashboard";
      setCurrentPage(page);
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setIsLoggedIn(true);
          const email = user.email || "";
          const computedName = email
            ? email.split("@")[0].replace(".", " ")
            : "";
          setUserName(computedName);

          // Try to fetch role from Firestore admins collection
          try {
            const adminRef = doc(db, "admins", user.uid);
            const snap = await getDoc(adminRef);
            if (snap.exists()) {
              const data = snap.data() as {
                role?: UserRole;
                firstName?: string;
                lastName?: string;
              };
              if (data?.role === "admin" || data?.role === "operator") {
                setUserRole(data.role);
              }
              if (data?.firstName || data?.lastName) {
                const name = [data.firstName, data.lastName]
                  .filter(Boolean)
                  .join(" ");
                if (name) setUserName(name);
              }
            } else {
              // Fallback to any locally stored role if present
              const role = (typeof window !== "undefined" &&
                localStorage.getItem("ecogo.userRole")) as UserRole | null;
              if (role === "admin" || role === "operator") setUserRole(role);
            }
          } catch (e) {
            // Ignore role fetch errors, keep defaults
            // console.error("Role fetch error", e);
          }

          // Ensure we land on dashboard after login when at root
          if (pathname === "/") router.push("/dashboard");

          // Update cache immediately
        __APP_SHELL_CACHE = null;


        } else {
          setIsLoggedIn(false);
          setUserName("");
          __APP_SHELL_CACHE = {
            isLoggedIn: false,
            userRole: userRole,
            userName: "",
          };
          // Keep role as last selected or default
        }
      } finally {
        setAuthChecking(false);
      }
    });

    return () => unsub();
  }, [pathname, router]);

  const handleLogin = async (
    email: string,
    password: string,
    role: UserRole
  ) => {
    // Persist the chosen role locally as a hint; actual role comes from Firestore if available
    try {
      localStorage.setItem("ecogo.userRole", role);
    } catch {}
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will take care of routing and state
    } catch (e) {
      const code = (e as any)?.code as string | undefined;
      const message = getFriendlyAuthError(code);
      toast.error(message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setIsLoggedIn(false);
      setCurrentPage("dashboard");
      setUserName("");
      __APP_SHELL_CACHE = { isLoggedIn: false, userRole, userName: "" };
      try {
        localStorage.removeItem("ecogo.userRole");
      } catch {}
      router.push("/");
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    router.push(`/${page}`);
  };

  if (!mounted) {
    return null;
  }

  if (authChecking) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  function getFriendlyAuthError(code?: string): string {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Incorrect email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found for this email.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        return "Sign-in failed. Please try again or contact support.";
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userRole={userRole}
        userName={userName}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto">
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "users" && userRole === "admin" && <UsersPage />}
        {currentPage === "drivers" && userRole === "admin" && <DriversPage />}
        {currentPage === "riders" && userRole === "admin" && <RidersPage />}
        {/* {currentPage === "admins" && userRole === "admin" && <AdminsPage />} */}
        {currentPage === "admins" && <AdminsPage />}

        {currentPage === "operators" && userRole === "admin" && (
          <OperatorsPage />
        )}
        {currentPage === "bookings" && <BookingsPage />}
        {currentPage === "refunds" && <ComingSoon />}
        {currentPage === "safety" && <ComingSoon />}
        {currentPage === "reports" && <ReportsPage userRole={userRole} />}
        {currentPage === "settings" && userRole === "admin" && <SettingsPage />}
      </main>
    </div>
  );
}

export default AppShell;
