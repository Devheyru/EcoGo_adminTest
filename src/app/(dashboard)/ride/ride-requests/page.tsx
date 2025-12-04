import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Truck,
  Home,
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  X,
} from "lucide-react";

// --- CONFIGURATION & MOCK UI COMPONENTS ---

const GREEN_BRAND_COLOR = "bg-emerald-600 hover:bg-emerald-700";
const PAGE_SIZE = 10;
const TOTAL_MOCK_RIDES = 25;
const RIDER_MOCK_ID = "rider@example.com"; // Mock existing rider identifier

// Mock UI components (required for a single-file, runnable implementation)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
}
const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  let style =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50";
  if (variant === "default") style += ` text-white ${GREEN_BRAND_COLOR}`;
  else if (variant === "outline")
    style += " border border-gray-300 text-gray-700 hover:bg-gray-100";
  else if (variant === "ghost") style += " text-gray-700 hover:bg-gray-100";
  else if (variant === "destructive")
    style += " bg-red-600 text-white hover:bg-red-700";
  return (
    <button className={`${style} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props
) => (
  <select
    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);

const Badge: React.FC<{
  children: React.ReactNode;
  color: "success" | "danger" | "warning" | "default";
}> = ({ children, color }) => {
  let style =
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold";
  if (color === "success")
    style += " bg-green-100 text-green-800 border-green-300";
  else if (color === "danger")
    style += " bg-red-100 text-red-800 border-red-300";
  else if (color === "warning")
    style += " bg-yellow-100 text-yellow-800 border-yellow-300";
  else style += " bg-gray-100 text-gray-800 border-gray-300";
  return <div className={style}>{children}</div>;
};

// Basic Dropdown/Popover implementation for action menus
const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="relative inline-block text-left">{children}</div>;
const DropdownMenuTrigger: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => (
  <Button variant="ghost" className="h-8 w-8 p-0" onClick={onClick}>
    {children}
  </Button>
);
const DropdownMenuContent: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}> = ({ children, isOpen }) => {
  if (!isOpen) return null;
  return (
    <div
      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
    >
      <div className="py-1">{children}</div>
    </div>
  );
};
const DropdownMenuItem: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ children, onClick, icon }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    role="menuitem"
  >
    {icon}
    <span className="ml-2">{children}</span>
  </button>
);

// Full-screen Modal/Dialog implementation
const Dialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fullScreen?: boolean;
}> = ({ isOpen, onClose, title, children, fullScreen = false }) => {
  if (!isOpen) return null;

  const sizeClass = fullScreen ? "w-full h-full max-w-full" : "max-w-xl";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all ${sizeClass} sm:my-8`}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h3
              className="text-xl font-semibold text-gray-900"
              id="modal-title"
            >
              {title}
            </h3>
            <Button variant="ghost" onClick={onClose} className="p-1 h-8 w-8">
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`rounded-xl bg-white shadow-lg ${className}`}>{children}</div>
);

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// --- DATA STRUCTURES (TypeScript) ---

type RideStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED" | "ON_RIDE";

type Ride = {
  srNo: number;
  id: string;
  riderName: string;
  riderId: string;
  pickupAddress: string;
  dropAddress: string;
  pickupTime: string;
  vehicleType: string;
  status: RideStatus;
  isScheduled: boolean;
  notes: string;
  driverId?: string;
};

type DriverResponse = {
  driverName: string;
  driverId: string;
  action: "ACCEPTED" | "REJECTED" | "CANCELLED";
  time: string;
  reason?: string;
};

const mockRides: Ride[] = Array.from({ length: TOTAL_MOCK_RIDES }, (_, i) => ({
  srNo: i + 1,
  id: `REQ-${1000 + i}`,
  riderName: i % 3 === 0 ? "John Doe" : `Rider ${i + 1}`,
  riderId: i % 3 === 0 ? RIDER_MOCK_ID : `rider${i + 1}@app.com`,
  pickupAddress: `123 Main St, Sector ${(i % 5) + 1}`,
  dropAddress: `456 Commerce Rd, Zone ${(i % 4) + 1}`,
  pickupTime: `04/${(i % 12) + 1}/2025, 1${i % 8}:00 PM`,
  vehicleType: i % 4 === 0 ? "Car" : i % 4 === 1 ? "Bike" : "Auto",
  status:
    i < 5
      ? "SCHEDULED"
      : i < 10
      ? "CANCELLED"
      : i < 15
      ? "COMPLETED"
      : "ON_RIDE",
  isScheduled: i % 2 === 0,
  notes: `Manual ride creation test for Sr. No ${i + 1}.`,
  driverId: i < 15 ? `DRV-${i + 1}` : undefined,
}));

const mockDriverResponses: { [key: string]: DriverResponse[] } =
  mockRides.reduce((acc, ride) => {
    if (ride.status !== "CANCELLED") {
      acc[ride.id] = [
        {
          driverName: "Alice",
          driverId: "D101",
          action: "REJECTED",
          time: "1:05 PM",
          reason: "Too far",
        },
        {
          driverName: "Bob",
          driverId: "D102",
          action: "ACCEPTED",
          time: "1:10 PM",
        },
      ];
    } else {
      acc[ride.id] = [
        {
          driverName: "Charlie",
          driverId: "D103",
          action: "REJECTED",
          time: "1:05 PM",
        },
        {
          driverName: "Bob",
          driverId: "D102",
          action: "ACCEPTED",
          time: "1:10 PM",
        },
        {
          driverName: "Bob",
          driverId: "D102",
          action: "CANCELLED",
          time: "1:15 PM",
          reason: "Unexpected flat tire",
        },
      ];
    }
    return acc;
  }, {} as { [key: string]: DriverResponse[] });

// --- MODAL COMPONENTS ---

// 1. Create Ride Modal (Rider Check & Form)
const CreateRideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState<"RIDER_CHECK" | "FORM">("RIDER_CHECK");
  const [riderIdentifier, setRiderIdentifier] = useState("");
  const [isRiderFound, setIsRiderFound] = useState(false);
  const [formData, setFormData] = useState<any>({}); // Basic state for ride form

  const handleRiderCheck = () => {
    if (riderIdentifier.toLowerCase() === RIDER_MOCK_ID) {
      setIsRiderFound(true);
      setStep("FORM");
    } else {
      setIsRiderFound(false);
      // Simulate redirect/prompt for creation
      console.log("Rider not found. Redirecting to Create Rider Page...");
      alert("Rider not found. (Simulated redirect to /create-rider)"); // Replaced window.confirm/alert
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...formData, riderIdentifier });
    setStep("RIDER_CHECK"); // Reset for next open
  };

  const handleClose = () => {
    setStep("RIDER_CHECK"); // Reset step when closing
    setRiderIdentifier("");
    setIsRiderFound(false);
    setFormData({});
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Create Ride Request">
      {step === "RIDER_CHECK" ? (
        <div className="space-y-4">
          <p className="text-sm font-medium">Rider Information Check</p>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter Rider Email or Phone"
              value={riderIdentifier}
              onChange={(e) => setRiderIdentifier(e.target.value)}
              className="flex-grow"
            />
            <Button
              onClick={handleRiderCheck}
              disabled={!riderIdentifier}
              className={GREEN_BRAND_COLOR}
            >
              Check
            </Button>
          </div>
          {!isRiderFound && riderIdentifier && (
            <div className="text-sm text-red-500 flex items-center">
              Rider not found.{" "}
              <a
                href="#"
                onClick={() => alert("Redirecting to create rider page.")}
                className="underline ml-1 text-emerald-600"
              >
                Click to create rider.
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm font-semibold text-emerald-800">
              Rider Found: {riderIdentifier}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pickup Address
              </label>
              <Input
                name="pickupAddress"
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Drop Address
              </label>
              <Input name="dropAddress" onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pickup Date/Time
              </label>
              <Input
                type="datetime-local"
                name="pickupTime"
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vehicle Type
              </label>
              <Select name="vehicleType" onChange={handleFormChange} required>
                <option value="">Select</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Auto">Auto</option>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Admin Notes (Internal)
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-3"
                onChange={(e) =>
                  setFormData((p: any) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className={GREEN_BRAND_COLOR}>
              Submit Ride Request
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

// 2. Driver Response Log Modal
const DriverResponseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
  responses: DriverResponse[];
}> = ({ isOpen, onClose, rideId, responses }) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Driver Response Log for ${rideId}`}
    >
      <div className="space-y-4">
        {responses.length === 0 ? (
          <p className="text-gray-500">
            No driver responses recorded for this request yet.
          </p>
        ) : (
          responses.map((res, index) => (
            <div
              key={index}
              className="flex items-start p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Truck className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
              <div className="ml-4 flex-grow">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">
                    {res.driverName} (ID: {res.driverId})
                  </p>
                  <Badge
                    color={
                      res.action === "ACCEPTED"
                        ? "success"
                        : res.action === "REJECTED"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {res.action}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Time: {res.time}</p>
                {res.reason && (
                  <p className="text-sm mt-1 italic text-gray-600">
                    Reason: {res.reason}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Dialog>
  );
};

// 3. View Detail Modal (Full Screen)
const ViewDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
}> = ({ isOpen, onClose, ride }) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Ride Details: ${ride.id}`}
      fullScreen
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Core Info */}
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-lg font-bold border-b pb-2 text-emerald-700">
            Core Ride Information
          </h4>
          <DetailItem label="Request ID" value={ride.id} />
          <DetailItem label="Rider Name" value={ride.riderName} />
          <DetailItem label="Rider ID" value={ride.riderId} />
          <DetailItem label="Pickup Time" value={ride.pickupTime} />
          <DetailItem label="Vehicle Type" value={ride.vehicleType} />
          <DetailItem
            label="Driver Assigned"
            value={ride.driverId || "Pending"}
          />
        </div>

        {/* Column 2: Location & Status */}
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-lg font-bold border-b pb-2 text-emerald-700">
            Route & Scheduling
          </h4>
          <DetailItem
            label="Pickup Location"
            value={ride.pickupAddress}
            icon={<Home className="w-4 h-4 text-emerald-500" />}
          />
          <DetailItem
            label="Drop Location"
            value={ride.dropAddress}
            icon={<Home className="w-4 h-4 text-emerald-500" />}
          />
          <DetailItem
            label="Is Scheduled"
            value={ride.isScheduled ? "Yes" : "No"}
          />
          <DetailItem
            label="Current Status"
            value={<RideStatusBadge status={ride.status} />}
          />
        </div>

        {/* Column 3: Admin & Extra Details */}
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-lg font-bold border-b pb-2 text-emerald-700">
            Admin Notes & Logs
          </h4>
          <DetailItem label="Admin Notes" value={ride.notes} isLongText />
          <DetailItem label="Estimated Fare" value="$15.50 (Mock Data)" />
          <DetailItem label="Distance (Km)" value="12.4 Km (Mock Data)" />
        </div>
      </div>
    </Dialog>
  );
};

const DetailItem: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  isLongText?: boolean;
}> = ({ label, value, icon, isLongText }) => (
  <div className="bg-gray-50 p-3 rounded-lg border">
    <div className="flex items-center text-xs font-medium text-gray-500 mb-1">
      {icon}
      <span className={icon ? "ml-1" : ""}>{label}</span>
    </div>
    {isLongText ? (
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
    ) : (
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    )}
  </div>
);

// Helper function to render status badge
const RideStatusBadge: React.FC<{ status: RideStatus }> = ({ status }) => {
  let color: "success" | "danger" | "warning" | "default";
  let text: string;

  switch (status) {
    case "SCHEDULED":
      color = "warning";
      text = "SCHEDULED";
      break;
    case "CANCELLED":
      color = "danger";
      text = "CANCELLED";
      break;
    case "COMPLETED":
      color = "success";
      text = "COMPLETED";
      break;
    case "ON_RIDE":
      color = "default";
      text = "ON RIDE";
      break;
    default:
      color = "default";
      text = "PENDING";
  }
  return <Badge color={color}>{text}</Badge>;
};

// --- MAIN PAGE COMPONENT ---

const RideRequestAdminPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>(mockRides);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDriverResponseModalOpen, setIsDriverResponseModalOpen] =
    useState(false);
  const [isViewDetailModalOpen, setIsViewDetailModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- Filtering & Pagination Logic ---
  const filteredRides = useMemo(() => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    return rides.filter(
      (r) =>
        r.riderName.toLowerCase().includes(lowerCaseTerm) ||
        r.id.toLowerCase().includes(lowerCaseTerm) ||
        r.pickupAddress.toLowerCase().includes(lowerCaseTerm) ||
        r.dropAddress.toLowerCase().includes(lowerCaseTerm)
    );
  }, [rides, searchTerm]);

  const totalPages = Math.ceil(filteredRides.length / PAGE_SIZE);
  const currentRides = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRides.slice(start, start + PAGE_SIZE);
  }, [filteredRides, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  // --- Action Handlers ---

  const handleCreateRide = (data: any) => {
    const newRide: Ride = {
      srNo: rides.length + 1,
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      riderName: "Admin Created", // Simplified rider name for new mock
      riderId: data.riderIdentifier,
      pickupAddress: data.pickupAddress || "N/A",
      dropAddress: data.dropAddress || "N/A",
      pickupTime: data.pickupTime
        ? new Date(data.pickupTime).toLocaleString()
        : "N/A",
      vehicleType: data.vehicleType || "N/A",
      status: "SCHEDULED",
      isScheduled: true,
      notes: data.notes || "",
    };
    setRides((prev) => [newRide, ...prev]);
    setIsCreateModalOpen(false);
    // Move to page 1 to see the new request
    setCurrentPage(1);
  };

  const handleUpdateRide = (updatedData: Partial<Ride>) => {
    setRides((prev) =>
      prev.map((r) =>
        r.id === selectedRide?.id ? { ...r, ...updatedData } : r
      )
    );
    setSelectedRide(null);
    setIsEditMode(false);
    setIsCreateModalOpen(false); // Close modal after update
  };

  const handleDeleteRide = (id: string) => {
    if (window.confirm("Are you sure you want to delete this ride request?")) {
      setRides((prev) =>
        prev.filter((r) => r.id !== id).map((r, i) => ({ ...r, srNo: i + 1 }))
      );
    }
  };

  const openDriverResponseLog = (ride: Ride) => {
    setSelectedRide(ride);
    setIsDriverResponseModalOpen(true);
    setIsActionMenuOpen(null);
  };

  const openViewDetail = (ride: Ride) => {
    setSelectedRide(ride);
    setIsViewDetailModalOpen(true);
    setIsActionMenuOpen(null);
  };

  const openEditModal = (ride: Ride) => {
    setSelectedRide(ride);
    setIsEditMode(true);
    setIsCreateModalOpen(true);
    setIsActionMenuOpen(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between text-sm mb-6 text-gray-500">
        <div className="flex items-center space-x-2">
          <Home className="w-4 h-4 text-emerald-600" />
          <span>Home</span>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-700">Ride requests</span>
        </div>

        {/* Create Ride Request Button */}
        <Button
          onClick={() => {
            setSelectedRide(null); // Clear selected ride for creation
            setIsEditMode(false);
            setIsCreateModalOpen(true);
          }}
          className={GREEN_BRAND_COLOR}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Ride Request
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Ride Requests</h1>

      {/* Search and Filter Card (Replicated from Design) */}
      <Card className="mb-8">
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Keyword
                </label>
                <Input
                  placeholder="Enter the rider's name, email or phone number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <Select>
                  <option>Select Status</option>
                  <option>SCHEDULED</option>
                  <option>COMPLETED</option>
                  <option>CANCELLED</option>
                </Select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Date Range
                </label>
                <Input type="date" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Type
                </label>
                <Select>
                  <option>Select Type</option>
                  <option>Regular</option>
                  <option>Scheduled</option>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4 pt-2">
              <Button
                onClick={() => setCurrentPage(1)}
                className={GREEN_BRAND_COLOR}
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ride List Card */}
      <Card>
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Ride requests list ({filteredRides.length})
          </h2>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Sr. no",
                  "Rider Details",
                  "Pickup Address",
                  "Drop Address",
                  "Pickup Time",
                  "Type",
                  "Status",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRides.map((ride) => (
                <tr key={ride.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ride.srNo}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-medium text-gray-900">
                      {ride.riderName}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      {ride.riderId}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs text-sm text-gray-500 truncate">
                    {ride.pickupAddress}
                  </td>
                  <td className="px-6 py-4 max-w-xs text-sm text-gray-500 truncate">
                    {ride.dropAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ride.pickupTime.split(",")[0]} <br />{" "}
                    <span className="text-xs">
                      {ride.pickupTime.split(",")[1]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ride.isScheduled ? "Scheduled" : "Regular"}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <RideStatusBadge status={ride.status} />
                  </td>

                  {/* Action Dropdown Menu */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={() =>
                          setIsActionMenuOpen(
                            isActionMenuOpen === ride.id ? null : ride.id
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        isOpen={isActionMenuOpen === ride.id}
                        onClose={() => setIsActionMenuOpen(null)}
                      >
                        <DropdownMenuItem
                          onClick={() => openDriverResponseLog(ride)}
                          icon={<Truck className="h-4 w-4" />}
                        >
                          Driver Response Log
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openViewDetail(ride)}
                          icon={<Eye className="h-4 w-4" />}
                        >
                          View Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditModal(ride)}
                          icon={<Edit className="h-4 w-4" />}
                        >
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRide(ride.id)}
                          icon={<Trash2 className="h-4 w-4 text-red-600" />}
                        >
                          <span className="text-red-600">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRides.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No ride requests found matching your criteria.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredRides.length)} of{" "}
              {filteredRides.length} requests
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                className="p-2 h-8 w-8"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="p-2 h-8 w-8"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center justify-center h-8 w-12 text-sm font-medium border rounded-lg bg-emerald-50 text-emerald-800">
                {currentPage}
              </span>
              <Button
                variant="outline"
                className="p-2 h-8 w-8"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="p-2 h-8 w-8"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <CreateRideModal
        isOpen={isCreateModalOpen && !isEditMode}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateRide}
      />

      {/* Driver Response Log Modal */}
      {isDriverResponseModalOpen && selectedRide && (
        <DriverResponseModal
          isOpen={isDriverResponseModalOpen}
          onClose={() => setIsDriverResponseModalOpen(false)}
          rideId={selectedRide.id}
          responses={mockDriverResponses[selectedRide.id] || []}
        />
      )}

      {/* Full Detail View Modal */}
      {isViewDetailModalOpen && selectedRide && (
        <ViewDetailModal
          isOpen={isViewDetailModalOpen}
          onClose={() => setIsViewDetailModalOpen(false)}
          ride={selectedRide}
        />
      )}

      {/* Edit/Update Modal (Reuses CreateRideModal structure for simplicity) */}
      {isCreateModalOpen && isEditMode && selectedRide && (
        <Dialog
          isOpen={isCreateModalOpen && isEditMode}
          onClose={() => setIsCreateModalOpen(false)}
          title={`Update Ride Request: ${selectedRide.id}`}
        >
          <div className="space-y-6">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-800">
                Updating Rider: {selectedRide.riderId}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pickup Address
                </label>
                <Input
                  name="pickupAddress"
                  defaultValue={selectedRide.pickupAddress}
                  onChange={(e) =>
                    setSelectedRide((p) =>
                      p ? { ...p, pickupAddress: e.target.value } : null
                    )
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Drop Address
                </label>
                <Input
                  name="dropAddress"
                  defaultValue={selectedRide.dropAddress}
                  onChange={(e) =>
                    setSelectedRide((p) =>
                      p ? { ...p, dropAddress: e.target.value } : null
                    )
                  }
                  required
                />
              </div>
              {/* ... other fields ... */}
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => handleUpdateRide(selectedRide)}
                className={GREEN_BRAND_COLOR}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default RideRequestAdminPage;
