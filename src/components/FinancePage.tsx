"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { db } from "@/firebase/config";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";
import Logo from "./Logo";

// Mock data for charts (since aggregation is heavy for client)
const revenueData = [
  { name: "Mon", revenue: 4000, commission: 800 },
  { name: "Tue", revenue: 3000, commission: 600 },
  { name: "Wed", revenue: 2000, commission: 400 },
  { name: "Thu", revenue: 2780, commission: 556 },
  { name: "Fri", revenue: 1890, commission: 378 },
  { name: "Sat", revenue: 2390, commission: 478 },
  { name: "Sun", revenue: 3490, commission: 698 },
];

interface Transaction {
  id: string;
  type: "payment" | "payout" | "refund" | "commission";
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  description: string;
  user: string;
}

export function FinancePage({
  defaultTab = "payouts",
}: {
  defaultTab?: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd have a 'transactions' collection
    // For now, we'll simulate transactions from 'trips'
    const q = query(
      collection(db, "trips"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "payment", // Most trips are payments
          amount: data.fare?.total || 0,
          status: data.status === "completed" ? "completed" : "pending",
          date: data.createdAt,
          description: `Ride Payment - ${
            data.pickup?.address?.split(",")[0] || "Trip"
          }`,
          user: data.riderId || "Unknown",
        } as Transaction;
      });
      setTransactions(txs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = [
    {
      label: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Net Profit",
      value: "$12,345.00",
      change: "+15.2% from last month",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Pending Payouts",
      value: "$2,345.00",
      change: "45 drivers waiting",
      icon: Wallet,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Avg. Commission",
      value: "18.5%",
      change: "Target: 20%",
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="bg-white min-h-screen border-none shadow-md rounded-lg p-4">
      <div className="flex lg:hidden justify-center">
        <Logo />
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-1xl sm:text-3xl bg-(--charcoal-dark) text-white p-1 rounded-md inline-block">
              Finance & Revenue
            </h1>
            <p className="text-gray-500 mt-1 pl-1">
              Manage payments, payouts, and financial reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              This Month
            </Button>
            <Button className="bg-(--charcoal-dark) text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <Card className="lg:col-span-2 border-none shadow-md">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Gross revenue vs. Net commission over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                      name="Gross Revenue"
                    />
                    <Bar
                      dataKey="commission"
                      fill="#1F2937"
                      radius={[4, 4, 0, 0]}
                      name="Net Commission"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === "payment"
                            ? "bg-green-100 text-green-600"
                            : tx.type === "payout"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tx.type === "payment" ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          tx.type === "payout"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {tx.type === "payout" ? "-" : "+"}$
                        {tx.amount.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-[10px] h-5 px-1">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No recent transactions
                  </p>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed views */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList>
            <TabsTrigger value="payouts">Driver Payouts</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
          </TabsList>
          <TabsContent value="payouts" className="mt-4">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Pending Payouts</CardTitle>
                <CardDescription>
                  Approve or reject driver withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending payout requests at this time.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="commissions">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Commission Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Standard Ride</p>
                      <p className="text-2xl font-bold">20%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Premium Ride</p>
                      <p className="text-2xl font-bold">25%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Delivery</p>
                      <p className="text-2xl font-bold">15%</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
