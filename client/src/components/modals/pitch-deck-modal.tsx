import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  campaignTitle: string;
}

export function PitchDeckModal({ isOpen, onClose, campaignId, campaignTitle }: PitchDeckModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: slidesData, isLoading, error } = useQuery({
    queryKey: ['pitch-deck-slides', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/pitch-deck-slides/${campaignId}`);
      if (!response.ok) {
        throw new Error('Failed to load pitch deck slides');
      }
      return response.json();
    },
    enabled: isOpen,
    retry: false, // Prevent endless retry loops
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false // Don't refetch on focus
  });

  const slides = slidesData?.slides || [];
  const hasConversionError = slidesData?.error;
  const downloadUrl = slidesData?.downloadUrl;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const downloadPDF = async () => {
    try {
      // Fetch the PDF file
      const response = await fetch(`/api/campaigns/${campaignId}/pitch-deck`);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${campaignTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'pitch-deck'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // Fallback to opening in new tab if download fails
      window.open(`/api/campaigns/${campaignId}/pitch-deck`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw] p-0 bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border-0 shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3 bg-gradient-to-r from-fundry-navy to-blue-800 text-white flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg lg:text-xl font-semibold text-white pr-8">
            {campaignTitle} - Pitch Deck
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-xs sm:text-sm">
            View the campaign pitch deck slides or download the original PDF document
          </DialogDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 sm:right-4 top-2 sm:top-4 text-white hover:bg-white/20 p-1 sm:p-2"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96 p-4">
              <div className="text-center">
                <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-fundry-orange border-t-transparent rounded-full mx-auto mb-3" />
                <span className="text-xs sm:text-sm text-gray-600">Converting pitch deck to slides...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96 p-4">
              <div className="text-center max-w-sm">
                <p className="text-red-600 mb-4 text-sm sm:text-base">Failed to load pitch deck slides</p>
                <Button onClick={downloadPDF} variant="outline" className="text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Download Original PDF
                </Button>
              </div>
            </div>
          ) : hasConversionError ? (
            <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96 p-4">
              <div className="text-center max-w-sm">
                <p className="text-amber-600 mb-2 text-sm sm:text-base">PDF conversion failed - large file or timeout</p>
                <p className="text-gray-600 mb-4 text-xs sm:text-sm">Download the original pitch deck to view</p>
                <Button onClick={downloadPDF} className="bg-fundry-orange hover:bg-orange-600 text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Download Original PDF
                </Button>
              </div>
            </div>
          ) : slides.length === 0 ? (
            <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96 p-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4 text-sm sm:text-base">No pitch deck available</p>
              </div>
            </div>
          ) : (
            <>
              {/* Slide Display */}
              <div className="flex-1 p-2 sm:p-4 lg:p-6 bg-gray-50 min-h-0 overflow-auto">
                <div className="relative w-full max-w-6xl mx-auto">
                  <div className="overflow-auto max-h-[calc(80vh-120px)] sm:max-h-[calc(80vh-150px)] rounded-lg bg-white border border-gray-200 shadow-lg">
                    <img
                      src={slides[currentSlide]}
                      alt={`Slide ${currentSlide + 1}`}
                      className="w-full h-auto object-contain min-h-[300px] sm:min-h-[500px] lg:min-h-[700px] max-w-none"
                      style={{ imageRendering: 'crisp-edges' }}
                      onError={(e) => {
                        console.error('Failed to load slide:', slides[currentSlide]);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {/* Navigation Arrows */}
                  {slides.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousSlide}
                        className="absolute left-1 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10 p-1 sm:p-2"
                        disabled={slides.length <= 1}
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextSlide}
                        className="absolute right-1 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10 p-1 sm:p-2"
                        disabled={slides.length <= 1}
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Slide Controls - Fixed Footer */}
              <div className="flex-shrink-0 p-2 sm:p-3 lg:p-4 bg-white border-t">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto justify-center sm:justify-start">
                    <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
                      Slide {currentSlide + 1} of {slides.length}
                    </span>
                    
                    {/* Slide Thumbnails */}
                    {slides.length > 1 && (
                      <div className="flex gap-1 sm:gap-2 overflow-x-auto py-1 max-w-full sm:max-w-md">
                        {slides.map((slide: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`flex-shrink-0 w-10 h-8 sm:w-14 sm:h-10 lg:w-16 lg:h-12 rounded border-2 overflow-hidden transition-all ${
                              index === currentSlide 
                                ? 'border-fundry-orange ring-1 sm:ring-2 ring-orange-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={slide}
                              alt={`Slide ${index + 1}`}
                              className="w-full h-full object-cover bg-white"
                              onError={(e) => {
                                e.currentTarget.style.background = '#f3f4f6';
                                e.currentTarget.style.display = 'flex';
                                e.currentTarget.style.alignItems = 'center';
                                e.currentTarget.style.justifyContent = 'center';
                                e.currentTarget.textContent = `${index + 1}`;
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button onClick={downloadPDF} className="bg-fundry-orange hover:bg-orange-600 text-white flex-shrink-0 w-full sm:w-auto text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}