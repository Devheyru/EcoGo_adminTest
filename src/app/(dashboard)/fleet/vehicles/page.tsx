// import { requirePermission } from "@/lib/auth";
// import { FleetPage } from "@/components/FleetPage";

// export default async function VehiclesPage() {
//   await requirePermission("fleet", "view");
//   return <FleetPage defaultTab="vehicles" />;
// }
'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, MoreVertical, Edit, Copy, Trash2, Home, BarChart } from 'lucide-react';

// --- MOCK UI COMPONENTS (Required to make the file self-contained and runnable) ---
// In a real Next.js app, these would be imported from "@/components/ui/..."
// The primary brand color is set to a deep, dark green.

const GREEN_BRAND_COLOR = 'bg-emerald-600 hover:bg-emerald-700';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'default', ...props }) => {
  let style = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50';
  if (variant === 'default') style += ` text-white ${GREEN_BRAND_COLOR}`;
  else if (variant === 'outline') style += ' border border-gray-300 text-gray-700 hover:bg-gray-100';
  else if (variant === 'ghost') style += ' text-gray-700 hover:bg-gray-100';
  else if (variant === 'destructive') style += ' bg-red-600 text-white hover:bg-red-700';

  return <button className={`${style} ${className}`} {...props}>{children}</button>;
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);

const Badge: React.FC<{ children: React.ReactNode; variant: 'default' | 'success' | 'destructive' }> = ({ children, variant }) => {
  let style = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  if (variant === 'default') style += ' bg-gray-100 text-gray-800 border-transparent';
  else if (variant === 'success') style += ' bg-emerald-100 text-emerald-800 border-emerald-300';
  else if (variant === 'destructive') style += ' bg-red-100 text-red-800 border-red-300';
  return <div className={style}>{children}</div>;
};

const Switch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${checked ? 'bg-emerald-600' : 'bg-gray-200'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

// Basic Dropdown/Popover implementation for action menus
const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative inline-block text-left">
    {children}
  </div>
);

const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <Button variant="ghost" className="h-8 w-8 p-0" onClick={onClick}>
    {children}
  </Button>
);

const DropdownMenuContent: React.FC<{ children: React.ReactNode; isOpen: boolean; onClose: () => void }> = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  // Simple div acting as a popover/menu
  return (
    <div
      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
      aria-orientation="vertical"
    >
      <div className="py-1" role="none">
        {children}
      </div>
    </div>
  );
};

const DropdownMenuItem: React.FC<{ children: React.ReactNode; onClick: () => void; icon: React.ReactNode }> = ({ children, onClick, icon }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    role="menuitem"
  >
    {icon}
    <span className="ml-2">{children}</span>
  </button>
);

// Basic Modal/Dialog implementation
const Dialog: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              {title}
            </h3>
            <div className="mt-4">
              {children}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Card component for main page structure
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl bg-white shadow-lg ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// --- DATA STRUCTURES (TypeScript) ---

type VehicleType = {
  srNo: number;
  id: string;
  identifier: string;
  location: string;
  pricePerKm: number;
  pricePerMin: number;
  baseFare: number;
  capacity: number;
  commission: number;
  isActive: boolean;
};

type ServiceCalculation = {
  category: string;
  monthlyCost: number;
  yearlyCost: number;
};

const initialVehicleData: VehicleType[] = [
  { srNo: 1, id: 'auto', identifier: 'Auto (Auto)', location: 'All', pricePerKm: 0.00, pricePerMin: 0.00, baseFare: 25.00, capacity: 2, commission: 10.00, isActive: false },
  { srNo: 2, id: 'bike', identifier: 'Bike (Bike)', location: 'All', pricePerKm: 5.00, pricePerMin: 1.00, baseFare: 10.00, capacity: 1, commission: 10.00, isActive: false },
  { srNo: 3, id: 'car8', identifier: 'Car (8 Seater Car)', location: 'All', pricePerKm: 20.00, pricePerMin: 14.00, baseFare: 50.00, capacity: 8, commission: 10.00, isActive: false },
  { srNo: 4, id: 'auto3', identifier: 'My Auto (3 wheeler)', location: 'All', pricePerKm: 10.00, pricePerMin: 8.00, baseFare: 23.00, capacity: 3, commission: 3.00, isActive: false },
  { srNo: 5, id: 'shared', identifier: 'Shared (7 Seater Car)', location: 'All', pricePerKm: 25.00, pricePerMin: 5.00, baseFare: 50.00, capacity: 6, commission: 10.00, isActive: true },
  { srNo: 6, id: 'taxi', identifier: 'Taxi (Taxi)', location: 'All', pricePerKm: 11.74, pricePerMin: 1.00, baseFare: 100.00, capacity: 3, commission: 20.00, isActive: true },
];

const initialNewVehicleState: Omit<VehicleType, 'srNo' | 'id'> = {
  identifier: '',
  location: 'All',
  pricePerKm: 0.00,
  pricePerMin: 0.00,
  baseFare: 0.00,
  capacity: 1,
  commission: 0.00,
  isActive: false,
};

// --- DIALOG COMPONENTS ---

// 1. Add/Edit Form Modal
const AddVehicleFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicle: Omit<VehicleType, 'srNo' | 'id'>) => void;
  initialData: Omit<VehicleType, 'srNo' | 'id'>;
  isEdit: boolean;
}> = ({ isOpen, onClose, onSubmit, initialData, isEdit }) => {
  const [formData, setFormData] = useState(initialData);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value),
    }));
  };

  const handleSave = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Identifier (e.g., Car (Sedan))</label>
          <Input name="identifier" value={formData.identifier} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Base Fare</label>
          <Input type="number" name="baseFare" value={formData.baseFare} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Price Per Km</label>
          <Input type="number" name="pricePerKm" value={formData.pricePerKm} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Price Per Min</label>
          <Input type="number" name="pricePerMin" value={formData.pricePerMin} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Capacity</label>
          <Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Commission (%)</label>
          <Input type="number" name="commission" value={formData.commission} onChange={handleChange} required />
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Switch checked={formData.isActive} onChange={(val) => setFormData(p => ({ ...p, isActive: val }))} />
          <label className="text-sm font-medium leading-none">Active Status</label>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>{isEdit ? 'Update' : 'Save'}</Button>
      </div>
    </Dialog>
  );
};

// 2. Clone/Service Calculation Modal
const CloneVehicleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleType;
}> = ({ isOpen, onClose, vehicle }) => {
  const [distance, setDistance] = useState(10000); // km
  const [fuelEfficiency, setFuelEfficiency] = useState(15); // km/L
  const [fuelPrice, setFuelPrice] = useState(1.5); // per Liter

  // Hardcoded service data template
  const categories: string[] = ['Standard Sedan', 'Luxury SUV', 'Electric Scooter'];
  
  const calculateServiceCost = useCallback((category: string): ServiceCalculation => {
    // Mock calculation logic for demonstration
    const baseMonthly = category.includes('Electric') ? 100 : 300;
    const baseYearly = baseMonthly * 10; // 2 months free

    // Factor in distance for cost complexity
    const distanceFactor = distance / 10000;
    const monthlyCost = Math.round(baseMonthly * distanceFactor * (1 / fuelEfficiency) * 100);
    const yearlyCost = Math.round(baseYearly * distanceFactor * (1 / fuelEfficiency) * 100);
    
    return {
      category,
      monthlyCost,
      yearlyCost,
    };
  }, [distance, fuelEfficiency]);

  const serviceCalculations = useMemo(() => {
    return categories.map(calculateServiceCost);
  }, [categories, calculateServiceCost]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Clone & Service Calculation: ${vehicle.identifier}`}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          This section simulates cloning the vehicle type and calculates estimated service costs based on usage metrics.
        </p>
        
        {/* Input Parameters for Calculation */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg border bg-gray-50">
          <div>
            <label className="text-xs font-medium text-gray-700">Annual Distance (km)</label>
            <Input type="number" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Fuel Efficiency (km/L)</label>
            <Input type="number" value={fuelEfficiency} onChange={(e) => setFuelEfficiency(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Fuel Price ($/L)</label>
            <Input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <h4 className="text-md font-semibold pt-2">Service Cost Estimates by Category</h4>
        
        {/* Calculation Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-100 p-3 font-semibold text-sm">
            <span>Category</span>
            <span>Est. Monthly Service ($)</span>
            <span>Est. Yearly Service ($)</span>
          </div>
          {serviceCalculations.map((calc, index) => (
            <div key={index} className="grid grid-cols-3 p-3 text-sm border-t">
              <span>{calc.category}</span>
              <span className="font-medium text-emerald-600">${calc.monthlyCost.toFixed(2)}</span>
              <span className="font-medium">${calc.yearlyCost.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => console.log('Cloning vehicle:', vehicle.identifier)}>
          Clone Vehicle
        </Button>
      </div>
    </Dialog>
  );
};


// --- MAIN PAGE COMPONENT ---

const VehicleTypesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleType[]>(initialVehicleData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Omit<VehicleType, 'srNo' | 'id'>>(initialNewVehicleState);

  // --- Filtering Logic ---
  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    const lowerCaseTerm = searchTerm.toLowerCase();
    return vehicles.filter(v =>
      v.identifier.toLowerCase().includes(lowerCaseTerm) ||
      v.location.toLowerCase().includes(lowerCaseTerm) ||
      v.id.toLowerCase().includes(lowerCaseTerm)
    );
  }, [vehicles, searchTerm]);

  // --- Handlers ---
  const handleToggleActive = (id: string, isActive: boolean) => {
    setVehicles(prev =>
      prev.map(v => (v.id === id ? { ...v, isActive: isActive } : v))
    );
  };

  const handleAddNewVehicle = (newVehicle: Omit<VehicleType, 'srNo' | 'id'>) => {
    const newId = newVehicle.identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newSrNo = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.srNo)) + 1 : 1;

    const vehicleToAdd: VehicleType = {
      ...newVehicle,
      id: newId + '-' + newSrNo,
      srNo: newSrNo,
    };

    setVehicles(prev => [...prev, vehicleToAdd]);
    // The requirement was: "when user click save it display auth on the page"
    // Since 'auth' is confusing, I interpret it as showing the vehicle in the list.
    console.log('New Vehicle Added (Auth Displayed):', vehicleToAdd); 
  };
  
  const handleUpdateVehicle = (updatedData: Omit<VehicleType, 'srNo' | 'id'>) => {
    if (!selectedVehicle) return;

    setVehicles(prev => 
      prev.map(v => (v.id === selectedVehicle.id ? { ...v, ...updatedData } : v))
    );
    setSelectedVehicle(null);
  }

  const handleDeleteVehicle = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle type?')) {
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  // --- Action Menu Click Handlers ---
  const openEditModal = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    // Destructure to remove srNo and id for the form data structure
    const { srNo, id, ...rest } = vehicle;
    setEditData(rest);
    setIsEditModalOpen(true);
    setIsActionMenuOpen(null);
  }

  const openCloneModal = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setIsCloneModalOpen(true);
    setIsActionMenuOpen(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm mb-6 text-gray-500">
        <Home className="w-4 h-4 text-emerald-600" />
        <span>Home</span>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-gray-700">Taxi vehicle types</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Taxi vehicle types</h1>
      
      {/* Search and Filter Card */}
      <Card className="mb-8">
        <CardContent>
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Search Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
                <Input
                  placeholder="Type your keyword here..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {/* Add more filter inputs here if needed, matching the image style */}
            </div>
            
            <div className="flex space-x-4 pt-2">
              <Button onClick={() => console.log('Searching...')} className={GREEN_BRAND_COLOR}>
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Vehicle List Card */}
      <Card>
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Taxi vehicle types list ({filteredVehicles.length})</h2>
          
          {/* Add New Section (Three Dot Icon) */}
          <div className="relative">
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsAddModalOpen(true)}
              title="Add New Vehicle Type"
            >
              <Plus className="w-5 h-5 text-emerald-600" />
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Sr. no', 'Identifier', 'Location', 'Price Per Km', 'Price Per min', 'Base fare', 'Capacity', 'Commission (%)', 'Status', 'Action'].map(header => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.srNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-medium text-gray-900">{vehicle.identifier.split('(')[0].trim()}</span>
                    <br />
                    <span className="text-xs text-gray-500">({vehicle.identifier.split('(')[1]?.replace(')', '').trim()})</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.pricePerKm.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.pricePerMin.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.baseFare.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.commission.toFixed(2)}</td>
                  
                  {/* Status Switch */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <Switch
                      checked={vehicle.isActive}
                      onChange={(checked) => handleToggleActive(vehicle.id, checked)}
                    />
                  </td>
                  
                  {/* Action Dropdown Menu (Three Dot Icon) */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger onClick={() => setIsActionMenuOpen(isActionMenuOpen === vehicle.id ? null : vehicle.id)}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent isOpen={isActionMenuOpen === vehicle.id} onClose={() => setIsActionMenuOpen(null)}>
                        <DropdownMenuItem onClick={() => openEditModal(vehicle)} icon={<Edit className="h-4 w-4" />}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openCloneModal(vehicle)} icon={<Copy className="h-4 w-4" />}>
                          Clone & Calculate Service
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteVehicle(vehicle.id)} icon={<Trash2 className="h-4 w-4 text-red-600" />}>
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
        {filteredVehicles.length === 0 && (
          <div className="p-6 text-center text-gray-500">No vehicle types found matching your criteria.</div>
        )}
      </Card>

      {/* Modals */}
      <AddVehicleFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddNewVehicle}
        initialData={initialNewVehicleState}
        isEdit={false}
      />

      {isEditModalOpen && selectedVehicle && (
        <AddVehicleFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateVehicle}
          // The form expects Omit<VehicleType, 'srNo' | 'id'>
          initialData={editData} 
          isEdit={true}
        />
      )}

      {isCloneModalOpen && selectedVehicle && (
        <CloneVehicleModal
          isOpen={isCloneModalOpen}
          onClose={() => setIsCloneModalOpen(false)}
          vehicle={selectedVehicle}
        />
      )}
    </div>
  );
};

// Export the component as default, which is typical for a Next.js page component
export default VehicleTypesPage;