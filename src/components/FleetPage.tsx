"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  Wrench,
  FileText,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function FleetPage({
  defaultTab = "vehicles",
}: {
  defaultTab?: string;
}) {
  const [vehicles, setVehicles] = useState([
    {
      id: "V-001",
      model: "Toyota Camry",
      plate: "ABC-123",
      status: "active",
      driver: "John Doe",
    },
    {
      id: "V-002",
      model: "Honda Civic",
      plate: "XYZ-789",
      status: "maintenance",
      driver: "Unassigned",
    },
    {
      id: "V-003",
      model: "Tesla Model 3",
      plate: "EV-001",
      status: "active",
      driver: "Jane Smith",
    },
  ]);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Fleet Management
          </h1>
          <p className="text-gray-500 mt-1">
            Track vehicles, maintenance, and compliance
          </p>
        </div>
        <Button className="bg-(--charcoal-dark) text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Vehicles
              </p>
              <h3 className="text-2xl font-bold mt-1">156</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                In Maintenance
              </p>
              <h3 className="text-2xl font-bold mt-1">8</h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Wrench className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Compliance Issues
              </p>
              <h3 className="text-2xl font-bold mt-1">2</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="vehicle-types">Vehicle Types</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Vehicle Fleet</CardTitle>
              <CardDescription>Manage your vehicle inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search vehicles..." className="pl-10" />
                </div>
              </div>

              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Truck className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {vehicle.model}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Plate: {vehicle.plate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                          {vehicle.driver}
                        </p>
                        <p className="text-xs text-gray-500">Assigned Driver</p>
                      </div>
                      <Badge
                        variant={
                          vehicle.status === "active" ? "default" : "secondary"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle-types" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Vehicle Types</CardTitle>
              <CardDescription>
                Configure vehicle categories and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">EcoGo Standard</h4>
                      <p className="text-sm text-gray-500">
                        Base fare: $5.00 • Per km: $1.20
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">EcoGo Premium</h4>
                      <p className="text-sm text-gray-500">
                        Base fare: $8.00 • Per km: $1.80
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">EcoGo Van</h4>
                      <p className="text-sm text-gray-500">
                        Base fare: $12.00 • Per km: $2.50
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Upcoming services and repairs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No maintenance scheduled for this week.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
