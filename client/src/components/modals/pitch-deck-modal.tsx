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
    enabled: isOpen
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

  const downloadPDF = () => {
    // Download original PDF if available
    window.open(`/api/campaigns/${campaignId}/pitch-deck`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw] p-0 bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border-0 shadow-2xl">
        <DialogHeader className="p-6 pb-3 bg-gradient-to-r from-fundry-navy to-blue-800 text-white">
          <DialogTitle className="text-xl font-semibold text-white">
            {campaignTitle} - Pitch Deck
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            View the campaign pitch deck slides or download the original PDF document
          </DialogDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin w-8 h-8 border-4 border-fundry-orange border-t-transparent rounded-full" />
              <span className="ml-3 text-gray-600">Converting pitch deck to slides...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-600 mb-4">Failed to load pitch deck slides</p>
                <Button onClick={downloadPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Original PDF
                </Button>
              </div>
            </div>
          ) : hasConversionError ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-amber-600 mb-2">PDF conversion failed - large file or timeout</p>
                <p className="text-gray-600 mb-4">Download the original pitch deck to view</p>
                <Button onClick={downloadPDF} className="bg-fundry-orange hover:bg-orange-600 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Download Original PDF
                </Button>
              </div>
            </div>
          ) : slides.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-gray-600 mb-4">No pitch deck available</p>
              </div>
            </div>
          ) : (
            <>
              {/* Slide Display */}
              <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                <div className="relative w-full max-w-6xl">
                  <img
                    src={slides[currentSlide]}
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-auto max-h-[75vh] min-h-[400px] object-contain rounded-lg shadow-lg bg-white border border-gray-200"
                    onError={(e) => {
                      console.error('Failed to load slide:', slides[currentSlide]);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {slides.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                        disabled={slides.length <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                        disabled={slides.length <= 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Slide Controls */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Slide {currentSlide + 1} of {slides.length}
                    </span>
                    
                    {/* Slide Thumbnails */}
                    {slides.length > 1 && (
                      <div className="flex gap-2 max-w-2xl overflow-x-auto py-1">
                        {slides.map((slide: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`flex-shrink-0 w-20 h-14 rounded border-2 overflow-hidden transition-all ${
                              index === currentSlide 
                                ? 'border-fundry-orange ring-2 ring-orange-200' 
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

                  <Button onClick={downloadPDF} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
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