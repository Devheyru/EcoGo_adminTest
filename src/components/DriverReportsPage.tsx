"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Car,
  DollarSign,
  Wallet,
  Star,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// --- Types ---
interface DriverReport {
  id: string;
  name: string;
  phone: string;
  email: string;
  registrationDate: string; // ISO string
  totalTrips: number;
  rating: number;
  walletBalance: number;
  status: string;
  isOnline: boolean;
}

interface FilterState {
  keyword: string;
  dateFrom: string;
  dateTo: string;
}

interface AdminData {
  id: string;
  role: string;
}

// --- Component ---
export function DriverReportsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    dateFrom: "",
    dateTo: "",
  });
  const [drivers, setDrivers] = useState<DriverReport[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DriverReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const itemsPerPage = 10;

  // 1. Auth & Role Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const collections = ["admins", "users", "super_admins"];
      let found = false;
      let data = null;
      let role = "";

      for (const col of collections) {
        const ref = doc(db, col, user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          data = snap.data();
          role = data.role ?? "";
          found = true;
          break;
        }
      }

      if (found && data) {
        setAdminData({ id: user.uid, role });
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch Data
  const fetchDrivers = useCallback(async () => {
    if (!adminData) return;

    setLoading(true);
    try {
      const res = await fetch("/api/drivers", {
        headers: {
          "x-user-role": adminData.role,
        },
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.drivers)) {
        // Transform API data to DriverReport format
        const formatted: DriverReport[] = json.drivers.map((d: any) => {
          let regDate = new Date().toISOString();
          const rawDate = d.createdAt;

          if (rawDate) {
            try {
              if (typeof rawDate === "string") {
                const dateObj = new Date(rawDate);
                if (!isNaN(dateObj.getTime())) {
                  regDate = dateObj.toISOString();
                }
              } else if (typeof rawDate === "object") {
                // Handle Firestore Timestamp
                const seconds = rawDate.seconds || rawDate._seconds;
                if (seconds) {
                  regDate = new Date(seconds * 1000).toISOString();
                }
              }
            } catch (e) {
              console.warn("Error parsing date for driver", d.id);
            }
          }

          return {
            id: d.id,
            name: d.name || "Unknown",
            phone: d.phone || "N/A",
            email: d.email || "N/A",
            registrationDate: regDate,
            totalTrips: d.totalTrips || 0,
            rating: d.rating || 0,
            walletBalance: d.walletBalance || 0,
            status: d.status || "Inactive",
            isOnline: d.isOnline || false,
          };
        });
        setDrivers(formatted);
        setFilteredDrivers(formatted);
      } else {
        toast.error("Failed to fetch drivers data");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Error fetching drivers");
    } finally {
      setLoading(false);
    }
  }, [adminData]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Filter Logic
  useEffect(() => {
    let result = drivers;

    // Keyword Search
    if (filters.keyword) {
      const lowerKeyword = filters.keyword.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerKeyword) ||
          d.email.toLowerCase().includes(lowerKeyword) ||
          d.phone.includes(lowerKeyword) ||
          d.id.toLowerCase().includes(lowerKeyword)
      );
    }

    // Date Range Filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      result = result.filter(
        (d) => new Date(d.registrationDate).getTime() >= fromDate
      );
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      // Add one day to include the end date fully
      const toDateObj = new Date(filters.dateTo);
      toDateObj.setDate(toDateObj.getDate() + 1);
      result = result.filter(
        (d) => new Date(d.registrationDate).getTime() < toDateObj.getTime()
      );
    }

    setFilteredDrivers(result);
    setCurrentPage(1);
  }, [filters, drivers]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "Id",
      "Name",
      "Phone",
      "Email",
      "Date",
      "Total Trips",
      "Rating",
      "Wallet Balance",
      "Status",
      "Is Online",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filteredDrivers.map((d) =>
          [
            d.id,
            `"${d.name}"`,
            d.phone,
            d.email,
            new Date(d.registrationDate).toLocaleDateString(),
            d.totalTrips,
            d.rating,
            d.walletBalance,
            d.status,
            d.isOnline ? "Yes" : "No",
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "drivers_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setFilters({ keyword: "", dateFrom: "", dateTo: "" });
  };

  const stats = [
    {
      label: "Total Drivers",
      value: drivers.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total Trips",
      value: drivers.reduce((acc, d) => acc + d.totalTrips, 0),
      icon: Car,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Avg Rating",
      value:
        drivers.length > 0
          ? (
              drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length
            ).toFixed(1)
          : "0.0",
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Active Drivers",
      value: drivers.filter(
        (d) => d.status === "Active" || d.status === "active"
      ).length,
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="w-full">
          <h1 className="text-xl font-semibold text-white bg-[#2F3A3F] mt-3 p-1 rounded">
            Drivers Report
          </h1>
          <p className="text-sm text-gray-500">
            <Link href="/dashboard">Home / </Link>{" "}
            <span className="text-gray-700">
              {" "}
              <Link href="/reports/driver-reports">Drivers Report</Link>{" "}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-lg bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Keyword */}
          <div className="col-span-1 ">
            <label className="block text-md font-medium text-gray-700 mb-1">
              Search Driver
            </label>
            <div className="relative  ">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Name, Phone, Email, ID..."
                value={filters.keyword}
                onChange={(e) =>
                  setFilters({ ...filters, keyword: e.target.value })
                }
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Date From */}
          <div className="col-span-1">
            <label className="block text-md font-medium text-gray-700 mb-1">
              Reg. Date From
            </label>
            <div className="relative">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="h-12"
              />
            </div>
          </div>

          {/* Date To */}
          <div className="col-span-1">
            <label className="block text-md font-medium text-gray-700 mb-1">
              Reg. Date To
            </label>
            <div className="relative">
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="h-12"
              />
            </div>
          </div>

          {/* Clear Button */}
          <div className="col-span-1 flex items-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full h-12"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white bg-[#2F3A3F] p-1 rounded">
            Drivers Data List
          </h2>
          <Button
            onClick={handleExport}
            className="bg-[#2DB85B] hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Id
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Trips
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Rating
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Wallet
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Online
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading data...
                  </td>
                </tr>
              ) : currentDrivers.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                currentDrivers.map((driver, index) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 truncate"
                      title={driver.id}
                    >
                      {(startIndex + index + 1).toString().padStart(3, "0")}
                    </td>
                    <td
                      className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate"
                      title={driver.name}
                    >
                      {driver.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 truncate">
                      {driver.phone}
                    </td>
                    <td
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 truncate"
                      title={driver.email}
                    >
                      {driver.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {(() => {
                        try {
                          return new Date(driver.registrationDate)
                            .toISOString()
                            .split("T")[0];
                        } catch (e) {
                          return "N/A";
                        }
                      })()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                      {driver.totalTrips}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                      {driver.rating.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      ${driver.walletBalance.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          driver.status === "Active" ||
                          driver.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          driver.isOnline
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {driver.isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing {filteredDrivers.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, filteredDrivers.length)} of{" "}
            {filteredDrivers.length} Entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
