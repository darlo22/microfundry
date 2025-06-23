import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download, RefreshCw } from "lucide-react";

interface PitchDeckViewerProps {
  pitchDeckUrl: string;
}

export function PitchDeckViewer({ pitchDeckUrl }: PitchDeckViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [viewerType, setViewerType] = useState<'direct' | 'google' | 'fallback'>('direct');

  const normalizedUrl = pitchDeckUrl.startsWith('/') ? pitchDeckUrl : `/${pitchDeckUrl}`;
  const fullUrl = `${window.location.origin}${normalizedUrl}`;

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setViewerType('direct');
  }, [pitchDeckUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    if (viewerType === 'direct') {
      // Try Google PDF viewer as fallback
      setViewerType('google');
      setIsLoading(true);
    } else {
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setViewerType('direct');
  };

  const getViewerUrl = () => {
    switch (viewerType) {
      case 'google':
        return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
      case 'direct':
      default:
        return `${normalizedUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8">
        <FileText className="mx-auto h-20 w-20 mb-4 text-fundry-orange" />
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Preview Not Available</h3>
        <p className="mb-6 text-gray-500 text-center max-w-md">
          The pitch deck cannot be previewed in the browser. You can try again or open it directly.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.open(normalizedUrl, '_blank')}
            className="bg-fundry-orange hover:bg-orange-600 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const link = document.createElement('a');
              link.href = normalizedUrl;
              link.download = 'pitch-deck.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fundry-orange mb-4"></div>
          <p className="text-gray-600">Loading pitch deck...</p>
        </div>
      )}
      
      <iframe
        key={`${viewerType}-${pitchDeckUrl}`}
        src={getViewerUrl()}
        className="w-full h-full border-0"
        title="Pitch Deck Preview"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{ 
          display: isLoading ? 'none' : 'block',
          backgroundColor: '#f9fafb'
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
      
      {viewerType === 'google' && !isLoading && (
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
          Viewing via Google Docs
        </div>
      )}
    </div>
  );
}