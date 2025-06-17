import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartLine, Rocket, TrendingUp, X, Briefcase, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type RegistrationData = z.infer<typeof registrationSchema>;
type LoginData = z.infer<typeof loginSchema>;

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
  defaultUserType?: "founder" | "investor";
}

export default function OnboardingModal({ isOpen, onClose, mode, onModeChange, defaultUserType }: OnboardingModalProps) {
  const [selectedUserType, setSelectedUserType] = useState<"founder" | "investor" | null>(defaultUserType || null);
  const [currentStep, setCurrentStep] = useState<"userType" | "form">(defaultUserType ? "form" : "userType");
  const { toast } = useToast();

  // Reset modal state when defaultUserType changes
  useEffect(() => {
    setSelectedUserType(defaultUserType || null);
    setCurrentStep(defaultUserType ? "form" : "userType");
  }, [defaultUserType]);

  const registrationForm = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData & { userType: string }) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Welcome to Fundry!",
        description: "Your account has been created successfully.",
      });
      onClose();
      // Redirect based on user type
      window.location.href = selectedUserType === "founder" ? "/founder-dashboard" : "/investor-dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      onClose();
      // Route based on selected role during sign-in
      const dashboardRoute = selectedUserType === "founder" ? "/founder-dashboard" : "/investor-dashboard";
      window.location.href = dashboardRoute;
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    },
  });

  const handleRegistration = (data: RegistrationData) => {
    if (!selectedUserType) return;
    registerMutation.mutate({
      ...data,
      userType: selectedUserType,
    });
  };

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const resetModal = () => {
    setCurrentStep("userType");
    setSelectedUserType(null);
    registrationForm.reset();
    loginForm.reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleModeChange = (newMode: "signin" | "signup") => {
    resetModal();
    onModeChange(newMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-fundry-orange rounded-lg flex items-center justify-center">
                <ChartLine className="text-white" size={16} />
              </div>
              <span className="text-2xl font-bold text-fundry-navy">Fundry</span>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </DialogTitle>
          <p className="text-gray-600">
            {mode === "signup" ? "Join Fundry today" : "Sign in to your account"}
          </p>
        </DialogHeader>

        {mode === "signup" && currentStep === "userType" && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">I am a...</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUserType === "founder" 
                    ? "border-fundry-orange bg-orange-50" 
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedUserType("founder")}
              >
                <CardContent className="p-6 text-center">
                  <Rocket className="w-8 h-8 text-fundry-orange mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Founder</h4>
                  <p className="text-sm text-gray-600">Raise capital</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUserType === "investor" 
                    ? "border-fundry-orange bg-orange-50" 
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedUserType("investor")}
              >
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-fundry-orange mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Investor</h4>
                  <p className="text-sm text-gray-600">Invest in startups</p>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => setCurrentStep("form")}
              disabled={!selectedUserType}
              className="w-full bg-fundry-orange hover:bg-orange-600"
            >
              Continue
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => handleModeChange("signin")}
                className="text-fundry-orange hover:underline font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {mode === "signup" && currentStep === "form" && (
          <form onSubmit={registrationForm.handleSubmit(handleRegistration)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...registrationForm.register("firstName")}
                  className={registrationForm.formState.errors.firstName ? "border-red-500" : ""}
                />
                {registrationForm.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {registrationForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...registrationForm.register("lastName")}
                  className={registrationForm.formState.errors.lastName ? "border-red-500" : ""}
                />
                {registrationForm.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {registrationForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...registrationForm.register("email")}
                className={registrationForm.formState.errors.email ? "border-red-500" : ""}
              />
              {registrationForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {registrationForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...registrationForm.register("password")}
                className={registrationForm.formState.errors.password ? "border-red-500" : ""}
              />
              {registrationForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {registrationForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registrationForm.register("confirmPassword")}
                className={registrationForm.formState.errors.confirmPassword ? "border-red-500" : ""}
              />
              {registrationForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {registrationForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-fundry-orange hover:bg-orange-600"
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className="text-fundry-orange hover:underline font-medium"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {mode === "signin" && currentStep === "userType" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">Choose your role to continue</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUserType === "founder" 
                    ? "border-fundry-orange bg-orange-50" 
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedUserType("founder")}
              >
                <CardContent className="p-6 text-center">
                  <Briefcase className="w-8 h-8 text-fundry-orange mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Founder</h4>
                  <p className="text-sm text-gray-600">Access founder dashboard</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUserType === "investor" 
                    ? "border-fundry-orange bg-orange-50" 
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedUserType("investor")}
              >
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-fundry-orange mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Investor</h4>
                  <p className="text-sm text-gray-600">Access investor dashboard</p>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => setCurrentStep("form")}
              disabled={!selectedUserType}
              className="w-full bg-fundry-orange hover:bg-orange-600"
            >
              Continue
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className="text-fundry-orange hover:underline font-medium"
              >
                Create account
              </button>
            </div>
          </div>
        )}

        {mode === "signin" && currentStep === "form" && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep("userType")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                {selectedUserType === "founder" ? (
                  <Briefcase className="w-5 h-5 text-fundry-orange" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-fundry-orange" />
                )}
                <span className="text-sm font-medium capitalize">{selectedUserType}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="loginEmail">Email</Label>
              <Input
                id="loginEmail"
                type="email"
                {...loginForm.register("email")}
                className={loginForm.formState.errors.email ? "border-red-500" : ""}
              />
              {loginForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="loginPassword">Password</Label>
              <Input
                id="loginPassword"
                type="password"
                {...loginForm.register("password")}
                className={loginForm.formState.errors.password ? "border-red-500" : ""}
              />
              {loginForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-fundry-orange hover:bg-orange-600"
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className="text-fundry-orange hover:underline font-medium"
              >
                Create account
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}