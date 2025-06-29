import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Copy, Plus, Edit, Trash2, Check } from "lucide-react";

interface SafeTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafeTemplatesModal({ isOpen, onClose }: SafeTemplatesModalProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'create'>('templates');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    discountRate: '20',
    valuationCap: '1000000',
    description: ''
  });
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const defaultTemplates = [
    {
      id: 1,
      name: "Standard SAFE",
      discountRate: "20",
      valuationCap: "1000000",
      description: "Standard SAFE agreement with 20% discount and $1M valuation cap",
      isDefault: true
    },
    {
      id: 2,
      name: "Early Stage",
      discountRate: "25",
      valuationCap: "500000",
      description: "Higher discount for early stage investments",
      isDefault: false
    },
    {
      id: 3,
      name: "Growth Stage",
      discountRate: "15",
      valuationCap: "2000000",
      description: "Lower discount for more mature companies",
      isDefault: false
    }
  ];

  const handleCopyTemplate = async (template: any) => {
    const templateText = `
SAFE Agreement Template: ${template.name}

Discount Rate: ${template.discountRate}%
Valuation Cap: $${parseInt(template.valuationCap).toLocaleString()}

Description: ${template.description}

This template can be customized for your specific investment terms.
Generated by Fundry Platform
    `;

    try {
      await navigator.clipboard.writeText(templateText);
      setCopied(template.id.toString());
      toast({
        title: "Template Copied",
        description: "SAFE template has been copied to your clipboard",
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = (template: any) => {
    const templateContent = `
SIMPLE AGREEMENT FOR FUTURE EQUITY

Template: ${template.name}
Generated: ${new Date().toLocaleDateString()}

TERMS:
- Discount Rate: ${template.discountRate}%
- Valuation Cap: $${parseInt(template.valuationCap).toLocaleString()}

DESCRIPTION:
${template.description}

IMPORTANT LEGAL NOTICE:
This template is for informational purposes only and does not constitute legal advice. 
Please consult with a qualified attorney before using any legal documents for actual investments.

This instrument was prepared using the Y Combinator Safe template and adapted for use on the Fundry platform.

For more information about SAFE agreements, visit: /safe-agreement-template

Generated by Fundry - fundry.com
    `;

    const blob = new Blob([templateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAFE-Template-${template.name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: `${template.name} template has been downloaded`,
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.discountRate || !newTemplate.valuationCap) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Template Created",
      description: `${newTemplate.name} template has been created successfully`,
    });

    // Reset form
    setNewTemplate({
      name: '',
      discountRate: '20',
      valuationCap: '1000000',
      description: ''
    });
    setActiveTab('templates');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            SAFE Agreement Templates
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'templates'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Template Library
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'create'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Template
          </button>
        </div>

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Available Templates</h3>
              <Button
                onClick={() => setActiveTab('create')}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </div>

            <div className="grid gap-4">
              {defaultTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {template.name}
                          {template.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyTemplate(template)}
                          className="flex items-center gap-1"
                        >
                          {copied === template.id.toString() ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadTemplate(template)}
                          className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Discount Rate:</span>
                        <span className="ml-2 text-gray-900">{template.discountRate}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Valuation Cap:</span>
                        <span className="ml-2 text-gray-900">
                          ${parseInt(template.valuationCap).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2">About SAFE Agreements</h4>
              <p className="text-blue-800 text-sm mb-3">
                SAFE (Simple Agreement for Future Equity) agreements are investment contracts that provide 
                the investor the right to purchase stock in a future equity round, subject to certain parameters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/safe-agreement-template', '_blank')}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Learn More About SAFEs
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Create New SAFE Template</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name *</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Seed Round SAFE"
                  />
                </div>

                <div>
                  <Label htmlFor="discountRate">Discount Rate (%) *</Label>
                  <Input
                    id="discountRate"
                    type="number"
                    value={newTemplate.discountRate}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, discountRate: e.target.value }))}
                    placeholder="20"
                    min="0"
                    max="50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage discount investors receive on future equity rounds
                  </p>
                </div>

                <div>
                  <Label htmlFor="valuationCap">Valuation Cap ($) *</Label>
                  <Input
                    id="valuationCap"
                    type="number"
                    value={newTemplate.valuationCap}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, valuationCap: e.target.value }))}
                    placeholder="1000000"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum company valuation for conversion to equity
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe when this template should be used..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Template Preview</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Name:</strong> {newTemplate.name || 'Untitled Template'}</div>
                    <div><strong>Discount:</strong> {newTemplate.discountRate}%</div>
                    <div><strong>Cap:</strong> ${parseInt(newTemplate.valuationCap || '0').toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setActiveTab('templates')}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} className="bg-orange-600 hover:bg-orange-700">
                Create Template
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}