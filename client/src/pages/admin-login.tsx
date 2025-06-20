import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { FundryLogo } from "@/components/ui/fundry-logo";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the Admin Command Centre",
        });
        // Invalidate auth cache to refresh authentication state
        await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/admin/verify'] });
        setLocation("/admin-dashboard");
      } else {
        setError(data.message || "Invalid admin credentials");
      }
    } catch (error) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Header */}
      <div className="absolute top-6 left-6">
        <FundryLogo className="h-12 w-auto cursor-pointer" linkToHome={true} />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-fundry-navy to-blue-800 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-fundry-navy">
            Admin Command Centre
          </CardTitle>
          <CardDescription className="text-gray-600">
            Secure administrative access to Fundry platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Admin Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@fundry.com"
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter admin password"
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-fundry-navy to-blue-800 hover:from-blue-800 hover:to-fundry-navy text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Access Admin Centre</span>
                </div>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>🔒 This is a secure admin portal</p>
              <p>All access attempts are logged and monitored</p>
            </div>
          </div>

          {/* Back to Platform */}
          <div className="text-center">
            <Link href="/landing">
              <Button variant="ghost" className="text-sm text-gray-500 hover:text-fundry-orange">
                ← Back to Platform
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}