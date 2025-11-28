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
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  User,
  Phone,
  FileText,
} from "lucide-react";

export function SupportPage({
  defaultTab = "tickets",
}: {
  defaultTab?: string;
}) {
  const [tickets, setTickets] = useState([
    {
      id: "T-1001",
      subject: "Ride not started",
      user: "John Doe",
      status: "open",
      priority: "high",
      created: "10 mins ago",
    },
    {
      id: "T-1002",
      subject: "Payment issue",
      user: "Jane Smith",
      status: "pending",
      priority: "medium",
      created: "1 hour ago",
    },
    {
      id: "T-1003",
      subject: "Driver rude behavior",
      user: "Mike Ross",
      status: "closed",
      priority: "low",
      created: "1 day ago",
    },
  ]);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Support Center
          </h1>
          <p className="text-gray-500 mt-1">
            Manage customer support tickets and complaints
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Phone className="w-4 h-4 mr-2" />
            Call Center
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Open Tickets</p>
              <h3 className="text-2xl font-bold mt-1">12</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Response
              </p>
              <h3 className="text-2xl font-bold mt-1">5</h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Resolved Today
              </p>
              <h3 className="text-2xl font-bold mt-1">28</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Latest support requests from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search tickets..." className="pl-10" />
                </div>
                <Button variant="outline">Filter</Button>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          ticket.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : ticket.priority === "medium"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {ticket.subject}
                          </h4>
                          <span className="text-xs text-gray-500 font-mono">
                            {ticket.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {ticket.user}
                          </span>
                          <span>•</span>
                          <span>{ticket.created}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          ticket.priority === "high" ? "destructive" : "outline"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge
                        variant={
                          ticket.status === "open"
                            ? "default"
                            : ticket.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Complaints</CardTitle>
              <CardDescription>Rider and Driver complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No active complaints.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Manage FAQs and help articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Knowledge base management coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
