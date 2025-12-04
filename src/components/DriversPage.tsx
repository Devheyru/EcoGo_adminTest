"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Users,
  UserCheck,
  UserX,
  Clock,
  Wallet,
  Edit,
  Trash2,
  FileText,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DriverForm } from "./forms/DriverForm";
import { toast } from "sonner";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- Types ---
interface Driver {
  id: string;
  srNo: number;
  phone: string;
  name: string;
  email: string;
  walletBalance: number;
  isOnline: boolean;
  status: "Active" | "Inactive";
  isApproved: boolean;
}

interface FilterState {
  keyword: string;
  status: "Active" | "Inactive" | "all";
  balanceFrom: string;
  balanceTo: string;
  regDateFrom: string;
  regDateTo: string;
  approved: "yes" | "no" | "all";
}

interface AdminData {
  id: string;
  role: string;
}

// --- Sub-Components ---

const SwitchToggle: React.FC<{
  checked: boolean;
  onToggle: () => void;
  label: string;
}> = ({ checked, onToggle, label }) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={onToggle}
      className={`relative inline-flex flex-shrink-0 h-4 w-8 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
        checked ? "bg-[#2F3A3F]" : "bg-gray-200"
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const FilterForm: React.FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSearch: () => void;
  onClear: () => void;
}> = ({ filters, setFilters, onSearch, onClear }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Keyword */}
        <div className="col-span-1">
          <label className="block text-md font-medium text-gray-700">
            Keyword
          </label>
          <input
            type="text"
            name="keyword"
            value={filters.keyword}
            onChange={handleChange}
            placeholder="Type your keyword here..."
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-4  px-3 text-md focus:ring-[#2DB85B] focus:border-[#2DB85B]"
          />
          <p className="mt-1 text-sm text-gray-500">
            Type name, phone number or email.
          </p>
        </div>

        {/* Status */}
        <div className="col-span-1">
          <label className="block text-md font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-4  px-3 text-md focus:ring-[#2DB85B] focus:border-[#2DB85B]"
          >
            <option className="hover:bg-[#2db85b]" value="all">
              Inactive
            </option>
            <option className="hover:bg-[#2db85b]" value="Active">
              Active
            </option>
            <option className="hover:bg-[#2db85b]" value="Inactive">
              Inactive
            </option>
          </select>
        </div>

        {/* Wallet Balance Range: From */}
        <div className="col-span-1">
          <label className="block text-md font-medium text-gray-700">
            Wallet balance: From [USD]
          </label>
          <input
            type="text"
            name="balanceFrom"
            value={filters.balanceFrom}
            onChange={handleChange}
            placeholder="0"
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-4  px-3 text-md focus:ring-[#2DB85B] focus:border-[#2DB85B]"
          />
        </div>

        {/* Wallet Balance Range: To */}
        <div className="col-span-1">
          <label className="block text-md font-medium text-gray-700">
            Wallet balance: To [USD]
          </label>
          <input
            type="text"
            name="balanceTo"
            value={filters.balanceTo}
            onChange={handleChange}
            placeholder="1000"
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-4  px-3 text-md focus:ring-[#2DB85B] focus:border-[#2DB85B]"
          />
        </div>

        {/* Registration Date Range: From */}
        <div className="col-span-1 relative">
          <label className="block text-md font-medium text-gray-700">
            Reg. date: From
          </label>
          <div className="flex items-center mt-1">
            <input
              type="date"
              name="regDateFrom"
              value={filters.regDateFrom}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 shadow-sm py-4  px-3 text-md focus:ring-[#2DB85B] focus:border-[#2DB85B] pr-10"
            />
            <Calendar className="absolute right-3 top-10 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Registration Date Range: To */}
        <div className="col-span-1 relative">
          <label className="block text-md font-medium text-gray-700">
            Reg. date: To
          </label>
          <div className="flex items-center mt-1">
            <input
              type="date"
              name="regDateTo"
              value={filters.regDateTo}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 shadow-sm py-4  px-3 text-md focus:ring-[#2DB85B] focus:border-[#2DB85B] pr-10"
            />
            <Calendar className="absolute right-3 top-10 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Approved */}
        <div className="col-span-1">
          <label className="block text-md font-medium text-gray-700">
            Approved
          </label>
          <select
            name="approved"
            value={filters.approved}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-4  px-3 text-md focus:ring-[#2DB85B] focus:border-[#2DB85B]"
          >
            <option value="all">Does not matter</option>
            <option value="yes">Approved</option>
            <option value="no">Not Approved</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="col-span-1 flex items-end justify-around space-x-4 pt-2">
          <button
            onClick={onSearch}
            className="flex items-center justify-center rounded-lg bg-[#2DB85B] px-6 py-4 text-md font-medium text-white shadow-md hover:bg-green-700 transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
          <button
            onClick={onClear}
            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-4 text-md font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Drivers Page Component ---
export function DriversPage() {
  const router = useRouter();
  const initialFilters: FilterState = {
    keyword: "",
    status: "all",
    balanceFrom: "",
    balanceTo: "",
    regDateFrom: "",
    regDateTo: "",
    approved: "all",
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
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

  // 2. Fetch Drivers
  const fetchDrivers = async () => {
    if (!adminData) return;

    try {
      setLoading(true);
      const res = await fetch("/api/drivers", {
        headers: {
          "x-user-role": adminData.role,
        },
        cache: "no-store",
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.drivers)) {
        const formatted: Driver[] = json.drivers.map(
          (d: any, index: number) => ({
            id: d.id,
            srNo: index + 1,
            phone: d.phone || d.mobile || "N/A",
            name: d.name || "Unknown",
            email: d.email || "N/A",
            walletBalance:
              typeof d.walletBalance === "number" ? d.walletBalance : 0,
            isOnline: !!d.isOnline,
            status:
              d.status === "active" || d.status === "Active"
                ? "Active"
                : "Inactive",
            isApproved:
              d.isApproved === true ||
              d.status === "approved" ||
              d.status === "active",
            // Preserve other fields for editing
            country: d.country,
            state: d.state,
            city: d.city,
            address: d.address,
            postalCode: d.postalCode,
            gender: d.gender,
          })
        );
        setDrivers(formatted);
        setFilteredDrivers(formatted);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [adminData]);

  // Handlers
  const handleAddDriver = () => {
    setSelectedDriver(null);
    setIsDrawerOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDrawerOpen(true);
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": adminData?.role || "",
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Driver deleted successfully");
        fetchDrivers();
      } else {
        toast.error(data.message || "Failed to delete driver");
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Error deleting driver");
    }
  };

  const handleViewTransactions = (id: string) => {
    // Navigate to transactions page or show modal
    // For now, just a toast or log
    console.log("View transactions for", id);
    router.push(`/transactions?driverId=${id}`);
  };

  const handleSearch = () => {
    const filtered = drivers.filter((driver) => {
      const keywordMatch =
        !filters.keyword ||
        driver.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        driver.phone.includes(filters.keyword) ||
        driver.email.toLowerCase().includes(filters.keyword.toLowerCase());

      const statusMatch =
        filters.status === "all" || driver.status === filters.status;
      const approvedMatch =
        filters.approved === "all" ||
        (filters.approved === "yes" && driver.isApproved) ||
        (filters.approved === "no" && !driver.isApproved);

      const balanceFromMatch =
        !filters.balanceFrom ||
        driver.walletBalance >= parseFloat(filters.balanceFrom);
      const balanceToMatch =
        !filters.balanceTo ||
        driver.walletBalance <= parseFloat(filters.balanceTo);

      return (
        keywordMatch &&
        statusMatch &&
        approvedMatch &&
        balanceFromMatch &&
        balanceToMatch
      );
    });

    setFilteredDrivers(filtered);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setFilteredDrivers(drivers);
    setCurrentPage(1);
  };

  const handleToggle = (
    id: string,
    field: "isOnline" | "status" | "isApproved"
  ) => {
    // Optimistic update
    const updateList = (list: Driver[]) =>
      list.map((driver) => {
        if (driver.id === id) {
          if (field === "status") {
            return {
              ...driver,
              status: (driver.status === "Active" ? "Inactive" : "Active") as
                | "Active"
                | "Inactive",
            };
          }
          return { ...driver, [field]: !driver[field] };
        }
        return driver;
      });

    setDrivers((prev) => updateList(prev));
    setFilteredDrivers((prev) => updateList(prev));
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push("...");
      if (currentPage > 2 && currentPage < totalPages - 1)
        pageNumbers.push(currentPage);
      if (currentPage < totalPages - 2) pageNumbers.push("...");
      pageNumbers.push(totalPages);

      const uniquePageNumbers = Array.from(new Set(pageNumbers));
      return uniquePageNumbers.map((num, index) => {
        if (num === "...")
          return (
            <span key={index} className="px-3 py-1 text-gray-500">
              ...
            </span>
          );
        return (
          <button
            key={index}
            onClick={() => paginate(num as number)}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              num === currentPage
                ? "bg-[#2F3A3F] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {num}
          </button>
        );
      });
    }

    return pageNumbers.map((num) => (
      <button
        key={num}
        onClick={() => paginate(num as number)}
        className={`px-3 py-1 rounded-lg text-sm font-medium ${
          num === currentPage
            ? "bg-[#2F3A3F] text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        {num}
      </button>
    ));
  };

  const stats = [
    {
      label: "Total Drivers",
      value: drivers.length,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Active Drivers",
      value: drivers.filter((d) => d.status === "Active").length,
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      label: "Inactive Drivers",
      value: drivers.filter((d) => d.status === "Inactive").length,
      icon: WifiOff,
      color: "text-red-600",
    },
    {
      label: "Online Drivers",
      value: drivers.filter((d) => d.isOnline).length,
      icon: Wifi,
      color: "text-green-600",
    },
    {
      label: "Total Balance",
      value: `$${drivers
        .reduce((acc, curr) => acc + curr.walletBalance, 0)
        .toLocaleString()}`,
      icon: Wallet,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6 w-full">
        <div className="w-full">
          <div className="w-full bg-[#2F3A3F] rounded-md mt-3">
            <h1 className="text-xl font-semibold text-white p-2 w-full">
              Drivers Dashboard
            </h1>
          </div>

          <p className="text-sm text-gray-500">
            <Link href="/dashboard"> Home /</Link>
            <span className="text-gray-700">
              <Link href="/drivers">Drivers</Link>{" "}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <h3 style={{ color: "#2D2D2D" }}>{stat.value}</h3>
                </div>
                <p style={{ color: "#2D2D2D" }}>{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <FilterForm
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Drivers list</h2>
          <button
            onClick={handleAddDriver}
            className="flex items-center rounded-lg bg-[#2DB85B] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-green-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add driver
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                >
                  Id
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                >
                  Wallet
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                >
                  Online
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                >
                  Appr.
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading drivers...
                  </td>
                </tr>
              ) : currentDrivers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No drivers found.
                  </td>
                </tr>
              ) : (
                currentDrivers.map((driver, index) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                      {(startIndex + index + 1).toString().padStart(3, "0")}
                    </td>
                    <td
                      className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[120px]"
                      title={driver.phone}
                    >
                      {driver.phone}
                    </td>
                    <td
                      className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 truncate max-w-[120px]"
                      title={driver.name}
                    >
                      {driver.name}
                    </td>
                    <td
                      className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 truncate max-w-[150px]"
                      title={driver.email}
                    >
                      {driver.email}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 font-mono">
                      ${driver.walletBalance.toFixed(2)}
                    </td>

                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center">
                        <SwitchToggle
                          checked={driver.isOnline}
                          onToggle={() => handleToggle(driver.id, "isOnline")}
                          label="Online"
                        />
                      </div>
                    </td>

                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center">
                        <SwitchToggle
                          checked={driver.status === "Active"}
                          onToggle={() => handleToggle(driver.id, "status")}
                          label="Status"
                        />
                      </div>
                    </td>

                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center">
                        <SwitchToggle
                          checked={driver.isApproved}
                          onToggle={() => handleToggle(driver.id, "isApproved")}
                          label="Approved"
                        />
                      </div>
                    </td>

                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {(adminData?.role === "admin" ||
                            adminData?.role === "super_admin") && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEditDriver(driver)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewTransactions(driver.id)
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Transactions
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteDriver(driver.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

            <div className="flex space-x-1">{renderPageNumbers()}</div>

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

      <DriverForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={fetchDrivers}
        initialData={selectedDriver}
        role={adminData?.role || ""}
      />
    </div>
  );
}
