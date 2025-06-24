import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, ExternalLink, Shield, Calendar, DollarSign, TrendingUp, Users, Scale } from "lucide-react";
import { useState } from "react";

interface SafeDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  safeData: {
    companyName: string;
    investorName: string;
    investorEmail: string;
    investmentAmount: number;
    discountRate: number;
    valuationCap: number;
    date: string;
    agreementId: string;
  };
}

export function SafeDocumentViewer({ isOpen, onClose, safeData }: SafeDocumentViewerProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const sections = [
    { id: "overview", title: "Overview", icon: FileText },
    { id: "terms", title: "Investment Terms", icon: DollarSign },
    { id: "definitions", title: "Definitions", icon: Scale },
    { id: "conversion", title: "Conversion Events", icon: TrendingUp },
    { id: "representations", title: "Representations", icon: Shield },
    { id: "signature", title: "Signature Page", icon: Users }
  ];

  const downloadSafeAgreement = () => {
    const content = generateFullSafeContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAFE_Agreement_${safeData.companyName}_${safeData.agreementId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateFullSafeContent = () => {
    return `
SIMPLE AGREEMENT FOR FUTURE EQUITY (SAFE)
Fundry Platform - Agreement #${safeData.agreementId}

Company: ${safeData.companyName}
Investor: ${safeData.investorName}
Email: ${safeData.investorEmail}
Investment Amount: ${formatCurrency(safeData.investmentAmount)}
Discount Rate: ${safeData.discountRate}%
Valuation Cap: ${formatCurrency(safeData.valuationCap)}
Date: ${safeData.date}

[Full SAFE agreement content would be generated here...]
    `.trim();
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-fundry-orange to-orange-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">SAFE Agreement</h3>
                  <p className="text-orange-100">Simple Agreement for Future Equity</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <FileText className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-fundry-orange">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-fundry-orange" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Investment Amount</p>
                      <p className="text-xl font-bold text-fundry-navy">{formatCurrency(safeData.investmentAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-fundry-navy">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-fundry-navy" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Discount Rate</p>
                      <p className="text-xl font-bold text-fundry-navy">{safeData.discountRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valuation Cap</p>
                      <p className="text-xl font-bold text-fundry-navy">{formatCurrency(safeData.valuationCap)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Agreement Date</p>
                      <p className="text-xl font-bold text-fundry-navy">{safeData.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">About SAFE Agreements</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      This SAFE (Simple Agreement for Future Equity) gives you the right to purchase shares 
                      of {safeData.companyName} in a future financing round. Your investment converts to equity 
                      when the company raises its next qualifying round, at either the discount rate or valuation 
                      cap - whichever gives you more shares.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "terms":
        return (
          <div className="space-y-6">
            <div className="bg-fundry-navy text-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Investment Terms</h3>
              <p className="text-blue-100">Key terms and conditions of your SAFE investment</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-fundry-navy mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Terms
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investment Amount:</span>
                        <span className="font-bold">{formatCurrency(safeData.investmentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount Rate:</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">{safeData.discountRate}%</Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valuation Cap:</span>
                        <span className="font-bold">{formatCurrency(safeData.valuationCap)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pro Rata Rights:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Included</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-fundry-navy mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Conversion Logic
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">
                      Your SAFE will convert to equity shares when {safeData.companyName} raises their next qualifying financing round.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-fundry-orange rounded-full"></div>
                        <span><strong>Discount Price:</strong> {100 - safeData.discountRate}% of the new round price</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-fundry-navy rounded-full"></div>
                        <span><strong>Cap Price:</strong> Based on {formatCurrency(safeData.valuationCap)} valuation cap</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span><strong>You get:</strong> Whichever price gives you more shares</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "signature":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-fundry-navy to-blue-700 text-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Signature Page</h3>
              <p className="text-blue-100">Digital signatures and agreement execution</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-fundry-navy border-b pb-2">Company</h4>
                      <div className="space-y-2">
                        <p><strong>Company:</strong> {safeData.companyName}</p>
                        <p><strong>Representative:</strong> [Founder Name]</p>
                        <p><strong>Title:</strong> Chief Executive Officer</p>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">Digital Signature</p>
                        <div className="h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Company Signature Required</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-fundry-navy border-b pb-2">Investor</h4>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {safeData.investorName}</p>
                        <p><strong>Email:</strong> {safeData.investorEmail}</p>
                        <p><strong>Investment:</strong> {formatCurrency(safeData.investmentAmount)}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
                        <p className="text-sm text-green-700 mb-2">Digital Signature</p>
                        <div className="h-12 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-700 font-medium">✓ Investor Signed</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Signed on {safeData.date}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-1">Legal Notice</h5>
                        <p className="text-yellow-700 text-sm">
                          This SAFE agreement is legally binding once executed by both parties. 
                          Please consult with qualified legal and financial advisors before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-fundry-navy mb-4">Section Content</h4>
                <p className="text-gray-600">Detailed legal content for {sections.find(s => s.id === activeSection)?.title}</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-white via-orange-50/20 to-blue-50/30">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-fundry-navy flex items-center gap-3">
              <div className="bg-fundry-orange p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              SAFE Agreement #{safeData.agreementId}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSafeAgreement}
                className="border-fundry-orange text-fundry-orange hover:bg-fundry-orange hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-[75vh] gap-6">
          {/* Navigation Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm border overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-fundry-navy">Document Sections</h3>
            </div>
            <div className="p-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-fundry-orange text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}