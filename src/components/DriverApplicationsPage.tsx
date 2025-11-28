"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Car,
  Phone,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for driver applications
const APPLICATIONS = [
  {
    id: "APP-001",
    name: "Michael Knight",
    email: "michael@knight.com",
    phone: "+1 555-0101",
    vehicle: "Pontiac Firebird (Black)",
    status: "pending",
    submittedDate: "2024-05-14",
    documents: {
      license: "verified",
      insurance: "verified",
      backgroundCheck: "pending",
    },
  },
  {
    id: "APP-002",
    name: "Dominic Toretto",
    email: "dom@family.com",
    phone: "+1 555-0102",
    vehicle: "Dodge Charger (Black)",
    status: "reviewing",
    submittedDate: "2024-05-13",
    documents: {
      license: "verified",
      insurance: "verified",
      backgroundCheck: "verified",
    },
  },
  {
    id: "APP-003",
    name: "Baby Driver",
    email: "baby@driver.com",
    phone: "+1 555-0103",
    vehicle: "Subaru WRX (Red)",
    status: "rejected",
    submittedDate: "2024-05-10",
    documents: {
      license: "rejected",
      insurance: "verified",
      backgroundCheck: "verified",
    },
  },
  {
    id: "APP-004",
    name: "Max Rockatansky",
    email: "max@wasteland.com",
    phone: "+1 555-0104",
    vehicle: "Ford Falcon (Black)",
    status: "approved",
    submittedDate: "2024-05-01",
    documents: {
      license: "verified",
      insurance: "verified",
      backgroundCheck: "verified",
    },
  },
];

export function DriverApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Driver Applications
          </h1>
          <p className="text-muted-foreground">
            Review and manage new driver sign-ups
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved This Week
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+8 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Due to document issues
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Applications List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-[250px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applicants..."
                  className="pl-8"
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
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {APPLICATIONS.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.name}`}
                            />
                            <AvatarFallback>
                              {app.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{app.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {app.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />{" "}
                            {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />{" "}
                            {app.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          {app.vehicle}
                        </div>
                      </TableCell>
                      <TableCell>{app.submittedDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.status === "approved"
                              ? "default"
                              : app.status === "rejected"
                              ? "destructive"
                              : app.status === "reviewing"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedApp(app)}
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>
                                Application Review: {app.name}
                              </DialogTitle>
                              <DialogDescription>
                                Review submitted documents and approve or reject
                                the application.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" /> Personal Info
                                  </h4>
                                  <div className="text-sm space-y-1 text-muted-foreground">
                                    <p>Name: {app.name}</p>
                                    <p>Email: {app.email}</p>
                                    <p>Phone: {app.phone}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <Car className="h-4 w-4" /> Vehicle Info
                                  </h4>
                                  <div className="text-sm space-y-1 text-muted-foreground">
                                    <p>Model: {app.vehicle}</p>
                                    <p>Year: 2022</p>
                                    <p>Plate: ABC-1234</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <FileText className="h-4 w-4" /> Documents
                                  Status
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="border rounded p-2 text-center">
                                    <p className="text-xs font-medium mb-1">
                                      License
                                    </p>
                                    <Badge
                                      variant={
                                        app.documents.license === "verified"
                                          ? "default"
                                          : "destructive"
                                      }
                                    >
                                      {app.documents.license}
                                    </Badge>
                                  </div>
                                  <div className="border rounded p-2 text-center">
                                    <p className="text-xs font-medium mb-1">
                                      Insurance
                                    </p>
                                    <Badge
                                      variant={
                                        app.documents.insurance === "verified"
                                          ? "default"
                                          : "destructive"
                                      }
                                    >
                                      {app.documents.insurance}
                                    </Badge>
                                  </div>
                                  <div className="border rounded p-2 text-center">
                                    <p className="text-xs font-medium mb-1">
                                      Background
                                    </p>
                                    <Badge
                                      variant={
                                        app.documents.backgroundCheck ===
                                        "verified"
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {app.documents.backgroundCheck}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                              <Button
                                variant="destructive"
                                className="w-full sm:w-auto"
                              >
                                Reject Application
                              </Button>
                              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                Approve Application
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            {/* Other tabs would filter the data similarly */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
