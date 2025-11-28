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
  Users,
  Calendar,
  Clock,
  Briefcase,
  UserPlus,
  Search,
} from "lucide-react";

export function HRPage() {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Sarah Connor",
      role: "Dispatcher",
      status: "active",
      shift: "Morning",
    },
    {
      id: 2,
      name: "Kyle Reese",
      role: "Support Agent",
      status: "active",
      shift: "Night",
    },
    {
      id: 3,
      name: "T-800",
      role: "Security",
      status: "on_leave",
      shift: "Evening",
    },
  ]);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            HR & Workforce
          </h1>
          <p className="text-gray-500 mt-1">
            Manage employees, shifts, and performance
          </p>
        </div>
        <Button className="bg-(--charcoal-dark) text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Employees
              </p>
              <h3 className="text-2xl font-bold mt-1">45</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">On Shift Now</p>
              <h3 className="text-2xl font-bold mt-1">12</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Open Positions
              </p>
              <h3 className="text-2xl font-bold mt-1">3</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="shifts">Shifts & Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>Manage your internal team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search employees..." className="pl-10" />
                </div>
              </div>

              <div className="space-y-4">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {emp.name}
                        </h4>
                        <p className="text-sm text-gray-500">{emp.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                          {emp.shift}
                        </p>
                        <p className="text-xs text-gray-500">Current Shift</p>
                      </div>
                      <Badge
                        variant={
                          emp.status === "active" ? "default" : "secondary"
                        }
                      >
                        {emp.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Shift Schedule</CardTitle>
              <CardDescription>Weekly employee schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
                <div className="text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Calendar view coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
