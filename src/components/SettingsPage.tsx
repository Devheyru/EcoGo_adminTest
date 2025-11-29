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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  MapPin,
  DollarSign,
  Mail,
  Clock,
  Save,
  AlertCircle,
  Settings as SettingsIcon,
  ShieldAlert,
} from "lucide-react";
import { mockSettings } from "@/lib/mockData";
import { Settings } from "@/types";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Lock } from "lucide-react";

export function SettingsPage({
  defaultTab = "general",
}: {
  defaultTab?: string;
}) {
  const [settings, setSettings] = useState<Settings>(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    setHasChanges(false);
    toast.success("Settings saved successfully");
  };

  const handleReset = () => {
    setSettings(mockSettings);
    setHasChanges(false);
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div className=" flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            // style={{ color: "var(--charcoal-dark)" }}
            className="font-bold text-1xl sm:text-2xl  bg-(--charcoal-dark) text-white p-1 mt-3 rounded-md"
          >
            System Settings
          </h1>
          <p style={{ color: "var(--charcoal-dark)" }} className="text-lg pl-2">
            Configure system-wide settings and preferences
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="bg-(--charcoal-dark) text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {hasChanges && (
        <Card className="bg-white border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-700" />
              <p className="text-yellow-700 font-medium">
                You have unsaved changes. Don't forget to save your settings
                before leaving this page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="gap-3">
          <TabsTrigger
            className="bg-white border-none shadow-lg cursor-pointer hover:bg-green-400 hover:text-white "
            value="general"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            className="bg-white border-none shadow-lg cursor-pointer hover:bg-green-400 hover:text-white "
            value="pricing"
          >
            Pricing
          </TabsTrigger>
          <TabsTrigger
            className="bg-white border-none shadow-lg cursor-pointer hover:bg-green-400 hover:text-white "
            value="notifications"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            className="bg-white border-none shadow-lg cursor-pointer hover:bg-green-400 hover:text-white "
            value="security"
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-[#2F3A3F] w-fit text-white p-1 rounded-md">
                  <Building className="w-5 h-5 text-green-600" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Basic company details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 ">
                <div className="space-y-2 bg-white border-none rounded-lg">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) =>
                      handleChange("companyName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) =>
                        handleChange("supportEmail", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-[#2F3A3F] w-fit text-white p-1 rounded-md">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Booking Settings
                </CardTitle>
                <CardDescription>
                  Configure booking rules and limitations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxBookingDistance">
                      Max Booking Distance (km)
                    </Label>
                    <Input
                      id="maxBookingDistance"
                      type="number"
                      value={settings.maxBookingDistance}
                      onChange={(e) =>
                        handleChange(
                          "maxBookingDistance",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Max distance for a single booking
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancellationWindow">
                      Cancellation Window (min)
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="cancellationWindow"
                        type="number"
                        value={settings.cancellationWindow}
                        onChange={(e) =>
                          handleChange(
                            "cancellationWindow",
                            parseInt(e.target.value)
                          )
                        }
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Free cancellation time window
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-[#2F3A3F] w-fit text-white p-1 rounded-md">
                  <SettingsIcon className="w-5 h-5 text-green-600" />
                  System Controls
                </CardTitle>
                <CardDescription>
                  Control system-wide features and access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="maintenanceMode" className="text-base">
                      Maintenance Mode
                    </Label>
                    <p className="text-sm text-gray-500">
                      Temporarily disable the system for maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      handleChange("maintenanceMode", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="allowNewRegistrations"
                      className="text-base"
                    >
                      Allow New Registrations
                    </Label>
                    <p className="text-sm text-gray-500">
                      Allow new users to register for the service
                    </p>
                  </div>
                  <Switch
                    id="allowNewRegistrations"
                    checked={settings.allowNewRegistrations}
                    onCheckedChange={(checked) =>
                      handleChange("allowNewRegistrations", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <Card className="bg-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-[#2F3A3F] w-fit text-white p-1 rounded-md">
                <DollarSign className="w-5 h-5 text-green-600" />
                Pricing Settings
              </CardTitle>
              <CardDescription>
                Configure base rates and per-kilometer charges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Base Rate ($)</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    step="0.01"
                    value={settings.baseRate}
                    onChange={(e) =>
                      handleChange("baseRate", parseFloat(e.target.value))
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Base fare for every booking
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perKmRate">Per Kilometer Rate ($)</Label>
                  <Input
                    id="perKmRate"
                    type="number"
                    step="0.01"
                    value={settings.perKmRate}
                    onChange={(e) =>
                      handleChange("perKmRate", parseFloat(e.target.value))
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Charge per kilometer traveled
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <h4 className="mb-1 font-medium text-green-800">
                  Example Calculation
                </h4>
                <p className="text-sm text-green-700">
                  A 25km trip would cost:{" "}
                  <span className="font-bold">
                    ${settings.baseRate.toFixed(2)}
                  </span>{" "}
                  (base) +{" "}
                  <span className="font-bold">
                    ${(settings.perKmRate * 25).toFixed(2)}
                  </span>{" "}
                  (distance) ={" "}
                  <span className="font-bold text-lg">
                    ${(settings.baseRate + settings.perKmRate * 25).toFixed(2)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-[#2F3A3F] w-fit text-white p-1 rounded-md">
                <Bell className="w-5 h-5 text-green-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage email and push notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Notification settings coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="bg-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-red-400 w-fit text-white p-1 rounded-md">
                <ShieldAlert className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-yellow-500">
                Critical system operations - use with caution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Reset All Settings
                  </h4>
                  <p className="text-sm text-gray-500">
                    Reset all system settings to default values
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  Reset to Defaults
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Export Configuration
                  </h4>
                  <p className="text-sm text-gray-500">
                    Download current settings as JSON file
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(settings, null, 2)], {
                      type: "application/json",
                    });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `ecogo-settings-${new Date().toISOString()}.json`;
                    a.click();
                    toast.success("Settings exported");
                  }}
                >
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
