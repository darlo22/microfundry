import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailVerification() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    const token = urlParams.get('token');

    // Handle status from server redirect
    if (statusParam) {
      switch (statusParam) {
        case 'success':
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          break;
        case 'already-verified':
          setStatus('success');
          setMessage('Your email has already been verified');
          break;
        case 'expired':
          setStatus('expired');
          setMessage('This verification link has expired or is invalid');
          break;
        case 'invalid':
          setStatus('error');
          setMessage('Invalid verification link - missing or malformed token');
          break;
        case 'error':
        default:
          setStatus('error');
          setMessage('An error occurred during verification');
          break;
      }
      return;
    }

    // Fallback for direct API calls (legacy support)
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link - missing token');
      return;
    }

    // Direct API verification (legacy)
    fetch(`/api/verify-email?token=${token}`)
      .then(response => {
        if (response.redirected) {
          // Handle redirect by parsing the URL
          const url = new URL(response.url);
          const redirectStatus = url.searchParams.get('status');
          if (redirectStatus) {
            window.location.href = response.url;
            return;
          }
        }
        return response.text();
      })
      .catch(error => {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification');
      });
  }, []);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-fundry-orange animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified!';
      case 'expired':
        return 'Link Expired';
      case 'error':
        return 'Verification Failed';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fundry-navy to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          {getIcon()}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {getTitle()}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {status === 'success' && (
          <div className="space-y-4">
            <Button
              onClick={() => setLocation('/landing')}
              className="w-full bg-fundry-orange hover:bg-fundry-orange/90"
            >
              Sign In Now
            </Button>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        )}

        {(status === 'error' || status === 'expired') && (
          <div className="space-y-4">
            <Button
              onClick={() => setLocation('/')}
              className="w-full bg-fundry-orange hover:bg-fundry-orange/90"
            >
              Return to Home
            </Button>
            {status === 'expired' && (
              <p className="text-sm text-gray-500">
                Please request a new verification email from the registration page.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            © 2025 Micro Fundry. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}