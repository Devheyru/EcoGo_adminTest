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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Megaphone,
  Gift,
  Share2,
  Send,
  Plus,
  Users,
  BarChart3,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export function MarketingPage({
  defaultTab = "campaigns",
}: {
  defaultTab?: string;
}) {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Summer Sale",
      status: "active",
      reach: 1200,
      conversion: "5.2%",
    },
    {
      id: 2,
      name: "New Driver Bonus",
      status: "active",
      reach: 450,
      conversion: "12.5%",
    },
    {
      id: 3,
      name: "Winter Promo",
      status: "ended",
      reach: 3400,
      conversion: "4.8%",
    },
  ]);

  const handleCreateCampaign = () => {
    toast.success("Campaign creation wizard started");
  };

  const handleSendBroadcast = () => {
    toast.success("Broadcast message sent to queue");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Marketing Hub
          </h1>
          <p className="text-gray-500 mt-1">
            Manage campaigns, promotions, and user engagement
          </p>
        </div>
        <Button
          onClick={handleCreateCampaign}
          className="bg-(--charcoal-dark) text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Campaigns
              </p>
              <h3 className="text-2xl font-bold mt-1">2</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Megaphone className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reach</p>
              <h3 className="text-2xl font-bold mt-1">5,650</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Avg. Conversion
              </p>
              <h3 className="text-2xl font-bold mt-1">7.5%</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="referral">Referral Program</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>Manage your marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Megaphone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Reach: {campaign.reach}</span>
                          <span>•</span>
                          <span>Conv: {campaign.conversion}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        campaign.status === "active" ? "default" : "secondary"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Broadcast Message</CardTitle>
              <CardDescription>
                Send push notifications to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <select className="w-full p-2 border rounded-md">
                  <option>All Users</option>
                  <option>Drivers Only</option>
                  <option>Riders Only</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Title</label>
                <Input placeholder="e.g. Weekend Special!" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Body</label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Type your message here..."
                />
              </div>
              <Button
                onClick={handleSendBroadcast}
                className="w-full bg-(--charcoal-dark) text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Track referral performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Share2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">
                      Rider Referrals
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">1,245</p>
                  <p className="text-sm text-blue-600">
                    Total referrals this month
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">
                      Rewards Claimed
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-green-700">$4,500</p>
                  <p className="text-sm text-green-600">
                    Total rewards distributed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Rewards Management</CardTitle>
              <CardDescription>
                Configure user rewards and loyalty points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Sign-up Bonus</h4>
                    <p className="text-sm text-gray-500">
                      500 points for new users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Referral Reward</h4>
                    <p className="text-sm text-gray-500">
                      1000 points per referral
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Ride Milestone</h4>
                    <p className="text-sm text-gray-500">
                      200 points every 10 rides
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
