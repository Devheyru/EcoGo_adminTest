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
  Search,
  Download,
  AlertTriangle,
  Info,
  AlertCircle,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  Wallet,
} from "lucide-react";
import { mockAuditLogs } from "@/lib/mockData";
import { AuditLog } from "@/types";
import { RolePermissions } from "@/types/role";
import { hasPermission } from "@/lib/roles";

interface ReportsPageProps {
  userPermissions: RolePermissions;
  defaultTab?: string;
}

export function ReportsPage({
  userPermissions,
  defaultTab = "audit",
}: ReportsPageProps) {
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const canViewFinance = hasPermission(userPermissions, "finance", "read");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterSeverity === "all" || log.severity === filterSeverity;

    return matchesSearch && matchesFilter;
  });

  const getSeverityIcon = (severity: AuditLog["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityBadgeVariant = (severity: AuditLog["severity"]) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      default:
        return "outline";
    }
  };

  const handleExport = () => {
    const csv = [
      ["ID", "User", "Action", "Timestamp", "Details", "Severity"],
      ...filteredLogs.map((log) => [
        log.id,
        log.user,
        log.action,
        log.timestamp,
        log.details,
        log.severity,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const stats = [
    {
      label: "Total Logs",
      value: logs.length,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Critical Issues",
      value: logs.filter((l) => l.severity === "critical").length,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Warnings",
      value: logs.filter((l) => l.severity === "warning").length,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "System Info",
      value: logs.filter((l) => l.severity === "info").length,
      icon: Info,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full">
          <h1 className="font-bold text-1xl sm:text-2xl  bg-(--charcoal-dark) text-white p-1 mt-3 rounded-md">
            Reports & Analytics
          </h1>
          <p style={{ color: "var(--charcoal-dark)" }} className="text-lg pl-2">
            System audit logs, operational reports, and analytics
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Last 30 Days
        </Button>
        <Button
          onClick={handleExport}
          className="bg-(--charcoal-dark) text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-3 lg:w-[400px]">
          <TabsTrigger
            className="bg-white border-none shadow-lg cursor-pointer hover:bg-green-400 hover:text-white rounded-md "
            value="audit"
          >
            Audit Logs
          </TabsTrigger>
          <TabsTrigger
            className="bg-white border-none shadow-lg cursor-pointer hover:bg-green-400 hover:text-white rounded-md "
            value="operational"
          >
            Operational
          </TabsTrigger>
          {canViewFinance && (
            <TabsTrigger
              className="bg-white border-none shadow-lg cursor-pointer hover:bg-green-400 hover:text-white rounded-md "
              value="financial"
            >
              Financial
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="audit" className="mt-6">
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="bg-[#2F3A3F] w-fit p-1 text-white rounded-md">
                System Audit Logs
              </CardTitle>
              <CardDescription>
                Track all user activities and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "critical", "warning", "info"].map((severity) => (
                    <Button
                      key={severity}
                      variant={
                        filterSeverity === severity ? "default" : "outline"
                      }
                      onClick={() => setFilterSeverity(severity)}
                      className={
                        filterSeverity === severity
                          ? "bg-green-400 text-white"
                          : ""
                      }
                      size="sm"
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full mt-1 ${
                        log.severity === "critical"
                          ? "bg-red-100 text-red-600"
                          : log.severity === "warning"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {getSeverityIcon(log.severity)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {log.action}
                        </h4>
                        <Badge
                          variant={getSeverityBadgeVariant(log.severity) as any}
                        >
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2 text-sm">
                        {log.details}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">
                            User:
                          </span>{" "}
                          {log.user}
                        </span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-mono">{log.id}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">
                      No logs found
                    </h4>
                    <p className="text-gray-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="mt-6">
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="bg-[#2F3A3F] w-fit p-1 text-white rounded-md">
                Operational Reports
              </CardTitle>
              <CardDescription>
                Daily trip statistics and driver performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold">Trip Volume Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Daily, weekly, and monthly trip volume trends by region.
                  </p>
                </div>
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold">Driver Performance</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Acceptance rates, cancellation rates, and average ratings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canViewFinance && (
          <TabsContent value="financial" className="mt-6">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="bg-[#2F3A3F] w-fit p-1 text-white rounded-md">
                  Financial Reports
                </CardTitle>
                <CardDescription>
                  Revenue, commissions, and payout reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold">Revenue Report</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Detailed breakdown of gross revenue and net commissions.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold">Payout Reconciliation</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Driver payout history and status reports.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
