"use client";

import React, { useState, useEffect } from "react";
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

// --- Types ---
interface RiderReport {
  id: string;
  name: string;
  phone: string;
  email: string;
  registrationDate: string; // ISO string
  rideRequests: number;
  customerRides: number; // Completed rides
  cumulativeRideCost: number;
  walletBalance: number;
  outstandingAmount: number;
}

interface FilterState {
  keyword: string;
  dateFrom: string;
  dateTo: string;
}

// --- Component ---
export function RiderReportsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    dateFrom: "",
    dateTo: "",
  });
  const [riders, setRiders] = useState<RiderReport[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<RiderReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Data
  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/riders");
      const json = await res.json();

      if (json.success && Array.isArray(json.riders)) {
        // Transform API data to RiderReport format
        const formatted: RiderReport[] = json.riders.map((r: any) => {
          let regDate = new Date().toISOString();
          const rawDate = r.createdAt;

          if (rawDate) {
            try {
              if (typeof rawDate === "string") {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                  regDate = d.toISOString();
                }
              } else if (typeof rawDate === "object") {
                const seconds = rawDate.seconds || rawDate._seconds;
                if (seconds) {
                  regDate = new Date(seconds * 1000).toISOString();
                }
              }
            } catch (e) {
              console.warn("Error parsing date for rider", r.id);
            }
          }

          return {
            id: r.id,
            name: r.name || "Unknown",
            phone: r.phone || "N/A",
            email: r.email || "N/A",
            registrationDate: regDate,
            rideRequests: r.rideRequests || 0,
            customerRides: r.totalTrips || 0,
            cumulativeRideCost: r.totalSpent || 0,
            walletBalance: r.walletBalance || 0,
            outstandingAmount: r.outstandingAmount || 0,
          };
        });
        setRiders(formatted);
        setFilteredRiders(formatted);
      } else {
        toast.error("Failed to fetch riders data");
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
      toast.error("Error fetching riders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = riders;

    // Keyword Search
    if (filters.keyword) {
      const lowerKeyword = filters.keyword.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(lowerKeyword) ||
          r.email.toLowerCase().includes(lowerKeyword) ||
          r.phone.includes(lowerKeyword) ||
          r.id.toLowerCase().includes(lowerKeyword)
      );
    }

    // Date Range Filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      result = result.filter(
        (r) => new Date(r.registrationDate).getTime() >= fromDate
      );
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      // Add one day to include the end date fully
      const toDateObj = new Date(filters.dateTo);
      toDateObj.setDate(toDateObj.getDate() + 1);
      result = result.filter(
        (r) => new Date(r.registrationDate).getTime() < toDateObj.getTime()
      );
    }

    setFilteredRiders(result);
    setCurrentPage(1);
  }, [filters, riders]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRiders = filteredRiders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "Id",
      "Name",
      "Phone",
      "Email",
      "Date",
      "Ride Requests",
      "Customer Rides",
      "Cumulative Ride Cost",
      "Wallet Balance",
      "Outstanding Amount",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filteredRiders.map((r) =>
          [
            r.id,
            `"${r.name}"`,
            r.phone,
            r.email,
            new Date(r.registrationDate).toLocaleDateString(),
            r.rideRequests,
            r.customerRides,
            r.cumulativeRideCost,
            r.walletBalance,
            r.outstandingAmount,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "riders_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setFilters({ keyword: "", dateFrom: "", dateTo: "" });
  };

  const stats = [
    {
      label: "Total Riders",
      value: riders.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total Rides",
      value: riders.reduce((acc, r) => acc + r.customerRides, 0),
      icon: Car,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Total Revenue",
      value: `$${riders
        .reduce((acc, r) => acc + r.cumulativeRideCost, 0)
        .toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Outstanding",
      value: `$${riders
        .reduce((acc, r) => acc + r.outstandingAmount, 0)
        .toFixed(2)}`,
      icon: Wallet,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="w-full">
          <h1 className="text-xl font-semibold text-white bg-[#2F3A3F] mt-3 p-1 rounded">
            Riders Report
          </h1>
          <p className="text-sm text-gray-500">
            <Link href="/dashboard">Home / </Link>{" "}
            <span className="text-gray-700">
              {" "}
              <Link href="/riders-report">Riders Report</Link>{" "}
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
              Search Rider
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
            Riders Data List
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
                  Ride Req.
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Cust. Rides
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Cum. Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Wallet
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Outstanding
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
              ) : currentRiders.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                currentRiders.map((rider, index) => (
                  <tr key={rider.id} className="hover:bg-gray-50">
                    <td
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 truncate"
                      title={rider.id}
                    >
                      {(startIndex + index + 1).toString().padStart(3, "0")}
                    </td>
                    <td
                      className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate"
                      title={rider.name}
                    >
                      {rider.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 truncate">
                      {rider.phone}
                    </td>
                    <td
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 truncate"
                      title={rider.email}
                    >
                      {rider.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {(() => {
                        try {
                          return new Date(rider.registrationDate)
                            .toISOString()
                            .split("T")[0];
                        } catch (e) {
                          return "N/A";
                        }
                      })()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                      {rider.rideRequests}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                      {rider.customerRides}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      ${rider.cumulativeRideCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      ${rider.walletBalance.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                      ${rider.outstandingAmount.toFixed(2)}
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
            Showing {filteredRiders.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, filteredRiders.length)} of{" "}
            {filteredRiders.length} Entries
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
