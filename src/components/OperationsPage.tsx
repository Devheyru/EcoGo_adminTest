"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Car,
  User,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

// Mock data for live rides
const LIVE_RIDES = [
  {
    id: "R-8832",
    driver: "John Doe",
    rider: "Alice Smith",
    status: "in_progress",
    pickup: "Central Station",
    dropoff: "Airport Terminal 1",
    eta: "5 mins",
    vehicle: "Toyota Camry (ABC-123)",
  },
  {
    id: "R-8833",
    driver: "Sarah Connor",
    rider: "Bob Brown",
    status: "arriving",
    pickup: "123 Main St",
    dropoff: "City Mall",
    eta: "2 mins",
    vehicle: "Honda Civic (XYZ-789)",
  },
  {
    id: "R-8834",
    driver: "Mike Ross",
    rider: "Harvey Specter",
    status: "searching",
    pickup: "Pearson Hardman",
    dropoff: "Court House",
    eta: "--",
    vehicle: "--",
  },
];

// Mock data for recent alerts
const ALERTS = [
  {
    id: 1,
    type: "delay",
    message: "Driver #442 is stuck in heavy traffic",
    time: "2 mins ago",
    severity: "medium",
  },
  {
    id: 2,
    type: "sos",
    message: "SOS triggered by Rider #991",
    time: "15 mins ago",
    severity: "high",
  },
  {
    id: 3,
    type: "system",
    message: "High demand in Downtown area",
    time: "1 hour ago",
    severity: "low",
  },
];

export function OperationsPage({
  defaultTab = "live",
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and operational control
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button>
            <AlertTriangle className="mr-2 h-4 w-4" />
            View Active Alerts
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+12% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Online Drivers
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">385</div>
            <p className="text-xs text-muted-foreground">
              85% utilization rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Wait Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2m</div>
            <p className="text-xs text-muted-foreground">-30s from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">3</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue={defaultTab}
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="live">Live Monitoring</TabsTrigger>
          <TabsTrigger value="map">Heatmap</TabsTrigger>
          <TabsTrigger value="performance">Driver Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Live Rides List */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Rides</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search ride ID..."
                        className="pl-8 w-[200px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LIVE_RIDES.map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell className="font-medium">{ride.id}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ride.status === "in_progress"
                                ? "default"
                                : ride.status === "arriving"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {ride.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{ride.driver}</span>
                            <span className="text-xs text-muted-foreground">
                              {ride.vehicle}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{ride.eta}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" /> {ride.pickup}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {ride.dropoff}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Alerts Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ALERTS.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${
                          alert.severity === "high"
                            ? "bg-red-500"
                            : alert.severity === "medium"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alert.time} • {alert.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Live Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center bg-muted/20">
              <div className="text-center space-y-2">
                <MapPin className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Map integration would be displayed here showing real-time
                  demand and driver locations.
                </p>
                <Button variant="outline">Open Fullscreen Map</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Acceptance Rate</span>
                      <span className="font-bold">94%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[94%] rounded-full bg-green-500" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span className="font-bold">98%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[98%] rounded-full bg-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>On-Time Arrival</span>
                      <span className="font-bold">88%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[88%] rounded-full bg-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
