import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChartLine, Rocket, TrendingUp, X, Briefcase, ArrowLeft, Eye, EyeOff } from "lucide-react";
import fundryLogoNew from "@assets/ChatGPT Image Jun 18, 2025, 07_16_52 AM_1750230510254.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordModal } from "./forgot-password-modal";

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
  const [currentStep, setCurrentStep] = useState<"userType" | "form" | "emailVerification">(defaultUserType ? "form" : "userType");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
    onSuccess: (data) => {
      setPendingUserId(data.userId);
      setUserEmail(registrationForm.getValues("email"));
      setCurrentStep("emailVerification");
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendVerificationEmailMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", "/api/send-verification-email", { userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    },
  });

  const resendVerificationEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/resend-verification-email", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email sent!",
        description: "A new verification email has been sent to your inbox.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
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
      
      // Use the user's actual userType from the login response
      const userType = data.user?.userType;
      
      // Check for investment context before redirecting
      const storedContext = localStorage.getItem('investmentContext');
      if (storedContext && userType === "investor") {
        try {
          const context = JSON.parse(storedContext);
          const isRecent = Date.now() - context.timestamp < 30 * 60 * 1000;
          if (isRecent) {
            // Don't redirect, let the investment modal handle continuation
            return;
          }
        } catch (error) {
          console.error('Error parsing investment context:', error);
        }
      }
      
      // Route based on user's actual userType from database
      const dashboardRoute = userType === "founder" ? "/founder-dashboard" : "/investor-dashboard";
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
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center mb-4">
              <img 
                src={fundryLogoNew} 
                alt="Fundry" 
                className="h-10 w-auto filter brightness-0 invert"
              />
            </div>
          </div>
          <DialogTitle>
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup" ? "Join Fundry today" : "Sign in to your account"}
          </DialogDescription>
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...registrationForm.register("password")}
                  className={registrationForm.formState.errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {registrationForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {registrationForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...registrationForm.register("confirmPassword")}
                  className={registrationForm.formState.errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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

        {currentStep === "emailVerification" && (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-fundry-orange/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-fundry-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-gray-600">
                  We've sent a verification link to <strong>{userEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Click the link in the email to verify your account and start using Fundry.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => pendingUserId && resendVerificationEmailMutation.mutate(userEmail)}
                disabled={resendVerificationEmailMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {resendVerificationEmailMutation.isPending ? "Sending..." : "Resend Email"}
              </Button>

              <Button
                onClick={handleClose}
                variant="ghost"
                className="w-full text-gray-600"
              >
                I'll verify later
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Check your spam folder if you don't see the email</p>
              <p>• The verification link expires in 24 hours</p>
              <p>• You can sign in after verification is complete</p>
            </div>
          </div>
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
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  {...loginForm.register("password")}
                  className={loginForm.formState.errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-fundry-orange hover:underline font-medium"
              >
                Forgot Password?
              </button>
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

    <ForgotPasswordModal 
      isOpen={showForgotPassword}
      onClose={() => setShowForgotPassword(false)}
    />
  </>
  );
}