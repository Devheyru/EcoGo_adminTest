"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import logo from "@/assets/ecogo-logo.png";
import Link from "next/link";
import { toast } from "sonner";

const ECO_GREEN = "#1CA547";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Login failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <style jsx global>{`
        :root {
          --eco-green: ${ECO_GREEN};
        }
      `}</style>

      <div className="w-full max-w-[500px] space-y-4">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Image
              src={logo}
              alt="EcoGo Logo"
              width={80}
              height={80}
              className="rounded-2xl shadow-md"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600">Drive Clean. Go Green.</p>
          </div>
        </div>

        <Card className="shadow-2xl border border-gray-100 rounded-xl">
          <CardHeader className="pt-6">
            <CardTitle className="text-center font-bold text-2xl text-gray-800">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@ecogo.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-gray-300 focus:border-[--eco-green] focus:ring-[--eco-green]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="font-semibold text-gray-700"
                  >
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: "var(--eco-green)" }}
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-gray-300 focus:border-[--eco-green] focus:ring-[--eco-green]"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-lg py-4 coursor-pointer hover:brightness-110 transition-all duration-200"
                  style={{
                    backgroundColor: "var(--eco-green)",
                    color: "white",
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-500">
                Need help? Contact{" "}
                <Link
                  href="mailto: support@ecogoclub.com"
                  className="font-medium hover:underline transition-colors"
                  style={{ color: "var(--eco-green)" }}
                >
                  support@ecogoclub.com
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                &copy; 2025 EcoGo Management. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
