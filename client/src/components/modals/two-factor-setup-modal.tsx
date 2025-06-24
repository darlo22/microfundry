import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Smartphone, Mail, Shield, Copy, Download, Check, AlertTriangle, Key } from "lucide-react";

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TwoFactorSetupModal({ isOpen, onClose }: TwoFactorSetupModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeMethod, setActiveMethod] = useState<'app' | 'email'>('app');
  const [step, setStep] = useState<'method' | 'setup' | 'verify' | 'backup'>('method');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<any>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Get current 2FA status
  const { data: twoFactorStatus } = useQuery<{
    enabled: boolean;
    method: string | null;
    backupCodesCount: number;
  }>({
    queryKey: ['/api/2fa/status'],
    enabled: isOpen,
  });

  // App-based 2FA setup mutation
  const setupAppMutation = useMutation({
    mutationFn: () => apiRequest('/api/2fa/setup/app', 'POST'),
    onSuccess: (data) => {
      setSetupData(data);
      setStep('setup');
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to setup authenticator app 2FA",
        variant: "destructive",
      });
    },
  });

  // Email-based 2FA setup mutation
  const setupEmailMutation = useMutation({
    mutationFn: () => apiRequest('/api/2fa/setup/email', 'POST'),
    onSuccess: () => {
      setStep('verify');
      toast({
        title: "Code Sent",
        description: "Verification code sent to your email",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to setup email 2FA",
        variant: "destructive",
      });
    },
  });

  // Verify app-based 2FA mutation
  const verifyAppMutation = useMutation({
    mutationFn: (data: { secret: string; token: string }) =>
      apiRequest('/api/2fa/verify-setup/app', 'POST', data),
    onSuccess: (data: any) => {
      setBackupCodes(data.backupCodes || []);
      setStep('backup');
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
      toast({
        title: "2FA Enabled",
        description: "Authenticator app 2FA has been enabled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  // Verify email-based 2FA mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (data: { code: string }) =>
      apiRequest('/api/2fa/verify-setup/email', 'POST', data),
    onSuccess: (data: any) => {
      setBackupCodes(data.backupCodes || []);
      setStep('backup');
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
      toast({
        title: "2FA Enabled",
        description: "Email 2FA has been enabled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired verification code",
        variant: "destructive",
      });
    },
  });

  const handleMethodSelect = (method: 'app' | 'email') => {
    setActiveMethod(method);
    if (method === 'app') {
      setupAppMutation.mutate();
    } else {
      setupEmailMutation.mutate();
    }
  };

  const handleVerification = () => {
    if (activeMethod === 'app' && setupData) {
      verifyAppMutation.mutate({
        secret: setupData.secret,
        token: verificationCode,
      });
    } else if (activeMethod === 'email') {
      verifyEmailMutation.mutate({
        code: verificationCode,
      });
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = `Fundry 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleDateString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe! Each can only be used once.`;
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fundry-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    setStep('method');
    setVerificationCode('');
    setSetupData(null);
    setBackupCodes([]);
    setCopiedCodes(false);
    onClose();
  };

  if (twoFactorStatus?.enabled) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              2FA Enabled
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication is Active</h3>
              <p className="text-gray-600 mb-4">
                Your account is protected with {twoFactorStatus.method === 'app' ? 'authenticator app' : 'email'} 2FA
              </p>
              <Badge variant="secondary" className="mb-4">
                {twoFactorStatus.backupCodesCount} backup codes remaining
              </Badge>
            </div>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-fundry-orange" />
            Enable Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 'method' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
            </div>

            <Tabs value={activeMethod} onValueChange={(value) => setActiveMethod(value as 'app' | 'email')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="app" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Authenticator App
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="app" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Authenticator App
                    </CardTitle>
                    <CardDescription>
                      Use apps like Google Authenticator, Authy, or 1Password to generate time-based codes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4" />
                        More secure than email
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4" />
                        Works offline
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4" />
                        Industry standard
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Authentication
                    </CardTitle>
                    <CardDescription>
                      Receive verification codes via email for two-factor authentication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Check className="h-4 w-4" />
                        Easy to use
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Check className="h-4 w-4" />
                        No additional app required
                      </div>
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        Requires internet connection
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button 
              onClick={() => handleMethodSelect(activeMethod)} 
              className="w-full"
              disabled={setupAppMutation.isPending || setupEmailMutation.isPending}
            >
              {setupAppMutation.isPending || setupEmailMutation.isPending ? 'Setting up...' : `Setup ${activeMethod === 'app' ? 'Authenticator App' : 'Email'} 2FA`}
            </Button>
          </div>
        )}

        {step === 'setup' && activeMethod === 'app' && setupData && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-gray-600">
                Open your authenticator app and scan this QR code
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="border rounded-lg p-4 bg-white">
                <img 
                  src={setupData.qrCodeImage} 
                  alt="2FA QR Code" 
                  className="w-48 h-48"
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this key manually:</p>
                <div className="bg-gray-100 p-3 rounded border font-mono text-sm break-all">
                  {setupData.manualEntryKey}
                </div>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} className="w-full">
              I've Added the Account
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Verify Setup</h3>
              <p className="text-gray-600">
                {activeMethod === 'app' 
                  ? 'Enter the 6-digit code from your authenticator app'
                  : 'Enter the 6-digit code sent to your email'
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={handleVerification}
                disabled={verificationCode.length !== 6 || verifyAppMutation.isPending || verifyEmailMutation.isPending}
                className="w-full"
              >
                {verifyAppMutation.isPending || verifyEmailMutation.isPending ? 'Verifying...' : 'Verify & Enable 2FA'}
              </Button>

              {activeMethod === 'email' && (
                <Button 
                  variant="outline" 
                  onClick={() => setupEmailMutation.mutate()}
                  disabled={setupEmailMutation.isPending}
                  className="w-full"
                >
                  Resend Code
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2FA Enabled Successfully!</h3>
              <p className="text-gray-600">
                Save these backup codes in a secure place. Each code can only be used once.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Backup Codes
                </CardTitle>
                <CardDescription>
                  Use these codes if you lose access to your {activeMethod === 'app' ? 'authenticator app' : 'email'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded border">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-white border rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={copyBackupCodes}
                    className="flex-1"
                  >
                    {copiedCodes ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Codes
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={downloadBackupCodes}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-800">Important</h4>
                  <p className="text-sm text-orange-700">
                    Store these codes safely. If you lose both your {activeMethod === 'app' ? 'authenticator device' : 'email access'} and backup codes, you won't be able to access your account.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Complete Setup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}