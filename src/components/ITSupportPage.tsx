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
  Server,
  Smartphone,
  Activity,
  ShieldCheck,
  Wifi,
  AlertTriangle,
  Search,
} from "lucide-react";

export function ITSupportPage() {
  const [devices, setDevices] = useState([
    {
      id: "D-101",
      type: "Tablet",
      user: "Driver #123",
      status: "online",
      battery: "85%",
    },
    {
      id: "D-102",
      type: "POS Terminal",
      user: "Kiosk A",
      status: "offline",
      battery: "0%",
    },
    {
      id: "D-103",
      type: "Tablet",
      user: "Driver #456",
      status: "online",
      battery: "42%",
    },
  ]);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            IT & Systems
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor system health and manage devices
          </p>
        </div>
        <Button className="bg-(--charcoal-dark) text-white">
          <Activity className="w-4 h-4 mr-2" />
          Run Diagnostics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">System Status</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">
                Operational
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Server className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Devices
              </p>
              <h3 className="text-2xl font-bold mt-1">1,240</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Smartphone className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Security Alerts
              </p>
              <h3 className="text-2xl font-bold mt-1">0</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList>
          <TabsTrigger value="devices">Device Management</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Registered Devices</CardTitle>
              <CardDescription>Manage tablets and terminals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search devices..." className="pl-10" />
                </div>
              </div>

              <div className="space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Smartphone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {device.type} - {device.id}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Assigned to: {device.user}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-gray-500">
                        Battery: {device.battery}
                      </div>
                      <Badge
                        variant={
                          device.status === "online" ? "default" : "destructive"
                        }
                      >
                        {device.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Real-time system performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">
                        API Gateway
                      </h4>
                      <p className="text-sm text-green-700">99.99% Uptime</p>
                    </div>
                  </div>
                  <Badge className="bg-green-200 text-green-800 hover:bg-green-200">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">
                        Database Cluster
                      </h4>
                      <p className="text-sm text-green-700">Latency: 12ms</p>
                    </div>
                  </div>
                  <Badge className="bg-green-200 text-green-800 hover:bg-green-200">
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
