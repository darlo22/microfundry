import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Users, 
  Mail, 
  Building, 
  MapPin, 
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  AlertTriangle
} from "lucide-react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

interface InvestorRecord {
  id: number;
  name: string;
  email: string;
  company?: string;
  title?: string;
  location?: string;
  bio?: string;
  linkedinUrl?: string;
  investmentFocus?: string;
  minimumInvestment?: number;
  maximumInvestment?: number;
  tags?: string[];
  source: 'directory' | 'platform';
  addedBy?: string;
  createdAt: string;
}

interface UploadResult {
  successful: number;
  failed: number;
  duplicates: number;
  missingData: number;
  totalRows: number;
  errors: string[];
  duplicateEmails: string[];
  missingDataRows: number[];
  message: string;
  breakdown: {
    totalRows: number;
    successful: number;
    duplicates: number;
    missingData: number;
    otherErrors: number;
    skippedTotal: number;
  };
}

export default function AdminInvestorOutreach() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch investor directory
  const { data: investors = [], isLoading } = useQuery({
    queryKey: ['/api/admin/investor-directory'],
    queryFn: async () => {
      const response = await fetch('/api/admin/investor-directory', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch investors');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Delete investor mutation
  const deleteInvestorMutation = useMutation({
    mutationFn: (investorId: number) =>
      apiRequest('DELETE', `/api/admin/investor-directory/${investorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/investor-directory'] });
      toast({
        title: "Investor Deleted",
        description: "Investor has been removed from the directory.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete investor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload investors mutation
  const uploadInvestorsMutation = useMutation({
    mutationFn: (formData: FormData) =>
      fetch('/api/admin/investor-directory/upload', {
        method: 'POST',
        body: formData,
      }).then(res => res.json()),
    onSuccess: (result: UploadResult) => {
      setUploadResult(result);
      setIsUploading(false);
      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/investor-directory'] });
      
      if (result.successful > 0) {
        toast({
          title: "Upload Successful",
          description: `${result.successful} investors added to directory.`,
        });
      }
      
      if (result.failed > 0) {
        toast({
          title: "Partial Upload",
          description: `${result.failed} records failed to upload.`,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: "Failed to upload investor data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel (.xlsx, .xls) or CSV file.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  const handlePreviewFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('preview', 'true');

    try {
      const response = await fetch('/api/admin/investor-directory/preview', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Preview failed');
      }
      
      const data = await response.json();
      setPreviewData(data.preview || []);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Failed to preview file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    uploadInvestorsMutation.mutate(formData);
  };

  const downloadTemplate = () => {
    // Use the backend API to download the standardized template
    window.open('/api/admin/investor-directory/template', '_blank');
    
    toast({
      title: "Template Downloaded",
      description: "Standardized CSV template has been downloaded to your device.",
    });
  };

  return (
    <div className="min-h-screen bg-fundry-navy">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-fundry-navy hover:bg-blue-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-fundry-navy">Investor Outreach Management</h1>
            </div>
            <Badge className="bg-fundry-orange text-white">
              {investors.length} Investors in Directory
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
              <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                <CardTitle className="text-white flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-fundry-orange" />
                  Upload Investor Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-white">
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-fundry-orange mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Upload Excel or CSV File</p>
                    <p className="text-sm text-orange-200">
                      Drag and drop your file here, or click to browse
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="mt-4 bg-white/10 border-white/20 text-white"
                  />
                </div>

                {selectedFile && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileSpreadsheet className="h-8 w-8 text-fundry-orange" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-orange-200">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handlePreviewFile}
                          variant="outline"
                          size="sm"
                          className="text-fundry-navy border-white/20 hover:bg-white/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="bg-fundry-orange hover:bg-orange-600 text-white"
                        >
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>

                    {isUploading && (
                      <div className="mt-4">
                        <Progress value={uploadProgress} className="bg-white/20" />
                        <p className="text-sm text-orange-200 mt-2">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {uploadResult && (
                  <div className="bg-white/5 rounded-lg p-6">
                    <h4 className="font-medium mb-4 flex items-center text-white">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      Upload Analysis Report
                    </h4>
                    
                    {/* Total Summary */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 mb-4">
                      <h5 className="text-lg font-semibold text-white mb-2">File Processing Summary</h5>
                      <p className="text-orange-200">
                        Processed {uploadResult.totalRows || uploadResult.breakdown?.totalRows || 'N/A'} total rows from your file
                      </p>
                      <p className="text-white font-medium mt-1">
                        Result: {uploadResult.successful} investors successfully added to directory
                      </p>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center bg-green-600/20 rounded-lg p-3">
                        <p className="text-2xl font-bold text-green-400">
                          {uploadResult.successful}
                        </p>
                        <p className="text-sm text-green-200">Successfully Added</p>
                      </div>
                      <div className="text-center bg-yellow-600/20 rounded-lg p-3">
                        <p className="text-2xl font-bold text-yellow-400">
                          {uploadResult.duplicates}
                        </p>
                        <p className="text-sm text-yellow-200">Duplicate Emails</p>
                      </div>
                      <div className="text-center bg-red-600/20 rounded-lg p-3">
                        <p className="text-2xl font-bold text-red-400">
                          {uploadResult.missingData || 0}
                        </p>
                        <p className="text-sm text-red-200">Missing Data</p>
                      </div>
                      <div className="text-center bg-gray-600/20 rounded-lg p-3">
                        <p className="text-2xl font-bold text-gray-400">
                          {(uploadResult.breakdown?.otherErrors || 0)}
                        </p>
                        <p className="text-sm text-gray-200">Other Errors</p>
                      </div>
                    </div>

                    {/* Why entries were skipped */}
                    {(uploadResult.duplicates > 0 || uploadResult.missingData > 0 || uploadResult.failed > 0) && (
                      <div className="bg-amber-600/10 border border-amber-400/20 rounded-lg p-4 mb-4">
                        <h6 className="font-medium text-amber-300 mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Why {(uploadResult.breakdown?.skippedTotal || (uploadResult.duplicates + uploadResult.failed))} entries were skipped:
                        </h6>
                        <ul className="text-sm text-amber-200 space-y-1">
                          {uploadResult.duplicates > 0 && (
                            <li>• {uploadResult.duplicates} entries had email addresses already in the directory</li>
                          )}
                          {uploadResult.missingData > 0 && (
                            <li>• {uploadResult.missingData} entries were missing required name or email fields</li>
                          )}
                          {(uploadResult.breakdown?.otherErrors || 0) > 0 && (
                            <li>• {uploadResult.breakdown.otherErrors} entries had formatting or processing errors</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Sample duplicate emails */}
                    {uploadResult.duplicateEmails && uploadResult.duplicateEmails.length > 0 && (
                      <div className="bg-yellow-600/10 border border-yellow-400/20 rounded-lg p-4 mb-4">
                        <h6 className="font-medium text-yellow-300 mb-2">Sample Duplicate Emails Found:</h6>
                        <ul className="text-xs text-yellow-200 space-y-1">
                          {uploadResult.duplicateEmails.slice(0, 5).map((email, index) => (
                            <li key={index}>• {email}</li>
                          ))}
                          {uploadResult.duplicateEmails.length > 5 && (
                            <li className="text-yellow-300">• And {uploadResult.duplicateEmails.length - 5} more duplicate emails...</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Error details */}
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <div className="bg-red-600/10 border border-red-400/20 rounded-lg p-4">
                        <h6 className="font-medium text-red-300 mb-2">Processing Errors:</h6>
                        <ul className="text-xs text-red-200 space-y-1 max-h-32 overflow-y-auto">
                          {uploadResult.errors.slice(0, 10).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {uploadResult.errors.length > 10 && (
                            <li className="text-red-300">• And {uploadResult.errors.length - 10} more errors...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Preview */}
            {showPreview && previewData.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
                <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-fundry-orange" />
                      File Preview
                    </span>
                    <Button
                      onClick={() => setShowPreview(false)}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-white">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-2 text-orange-200">Name</th>
                          <th className="text-left p-2 text-orange-200">Email</th>
                          <th className="text-left p-2 text-orange-200">Company</th>
                          <th className="text-left p-2 text-orange-200">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-b border-white/10">
                            <td className="p-2">{row.name}</td>
                            <td className="p-2">{row.email}</td>
                            <td className="p-2">{row.company}</td>
                            <td className="p-2">{row.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 5 && (
                      <p className="text-sm text-orange-200 mt-2">
                        Showing 5 of {previewData.length} records
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Directory */}
            <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
              <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-fundry-orange" />
                  Current Investor Directory
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                {isLoading ? (
                  <div className="text-center py-8">Loading investors...</div>
                ) : investors.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-orange-200 mx-auto mb-4" />
                    <p className="text-orange-200">No investors in directory yet</p>
                    <p className="text-sm text-orange-300 mt-2">
                      Upload a CSV or Excel file to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {investors.map((investor: InvestorRecord) => (
                      <div
                        key={investor.id}
                        className="border border-white/20 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-white">{investor.name}</h4>
                              <Badge className={investor.source === 'directory' ? 'bg-fundry-orange text-white' : 'bg-fundry-navy text-white'}>
                                {investor.source === 'directory' ? 'Directory' : 'Platform'}
                              </Badge>
                            </div>
                            <p className="text-sm text-orange-100 mb-1">{investor.email}</p>
                            {investor.company && (
                              <p className="text-sm text-orange-200 flex items-center mb-1">
                                <Building className="h-3 w-3 mr-1 text-fundry-orange" />
                                {investor.company}
                                {investor.title && ` • ${investor.title}`}
                              </p>
                            )}
                            {investor.location && (
                              <p className="text-sm text-orange-200 flex items-center mb-1">
                                <MapPin className="h-3 w-3 mr-1 text-fundry-orange" />
                                {investor.location}
                              </p>
                            )}
                            {investor.tags && investor.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {investor.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs border-fundry-orange text-fundry-orange">
                                    {tag}
                                  </Badge>
                                ))}
                                {investor.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-200">
                                    +{investor.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {investor.linkedinUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-200 hover:bg-white/20"
                                onClick={() => window.open(investor.linkedinUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:bg-red-500/20"
                              onClick={() => deleteInvestorMutation.mutate(investor.id)}
                              disabled={deleteInvestorMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions & Template */}
          <div className="space-y-6">
            {/* Instructions */}
            <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
              <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                <CardTitle className="text-white flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-fundry-orange" />
                  Upload Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-orange-200 mb-2">File Format</h4>
                    <ul className="space-y-1 text-orange-100">
                      <li>• Excel (.xlsx, .xls) or CSV files</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• First row should contain headers</li>
                    </ul>
                  </div>

                  <Separator className="bg-white/20" />

                  <div>
                    <h4 className="font-medium text-orange-200 mb-2">Required Columns</h4>
                    <ul className="space-y-1 text-orange-100">
                      <li>• <strong>name</strong> - Investor's full name</li>
                      <li>• <strong>email</strong> - Valid email address</li>
                    </ul>
                  </div>

                  <Separator className="bg-white/20" />

                  <div>
                    <h4 className="font-medium text-orange-200 mb-2">Optional Columns</h4>
                    <ul className="space-y-1 text-orange-100">
                      <li>• company, title, location</li>
                      <li>• bio, linkedinUrl</li>
                      <li>• investmentFocus</li>
                      <li>• minimumInvestment, maximumInvestment</li>
                      <li>• tags (comma-separated)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Template */}
            <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
              <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                <CardTitle className="text-white flex items-center">
                  <Download className="h-5 w-5 mr-2 text-fundry-orange" />
                  Template Download
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="text-center space-y-4">
                  <div>
                    <FileSpreadsheet className="h-12 w-12 text-fundry-orange mx-auto mb-3" />
                    <p className="text-sm text-orange-200">
                      Download our CSV template with all required and optional columns
                    </p>
                  </div>
                  <Button
                    onClick={downloadTemplate}
                    className="w-full bg-fundry-orange hover:bg-orange-600 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card className="bg-white/10 backdrop-blur-sm border-orange-200">
              <CardHeader className="bg-gradient-to-r from-fundry-orange/20 to-fundry-navy/20">
                <CardTitle className="text-white flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-fundry-orange" />
                  Directory Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-fundry-orange">
                      {investors.length}
                    </p>
                    <p className="text-sm text-orange-200">Total Investors</p>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-400">
                      {investors.filter((inv: InvestorRecord) => inv.source === 'directory').length}
                    </p>
                    <p className="text-sm text-orange-200">Directory Entries</p>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-400">
                      {investors.filter((inv: InvestorRecord) => inv.source === 'platform').length}
                    </p>
                    <p className="text-sm text-orange-200">Platform Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-gradient-to-br from-white via-orange-50/70 to-blue-50/50 border border-orange-200 shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-fundry-navy flex items-center">
              <FileSpreadsheet className="h-6 w-6 mr-3 text-fundry-orange" />
              File Preview
            </DialogTitle>
          </DialogHeader>
          
          {previewData.length > 0 ? (
            <div className="overflow-auto max-h-[60vh]">
              <div className="bg-white rounded-lg border border-orange-200 shadow-sm">
                <div className="p-4 bg-gradient-to-r from-fundry-orange/10 to-fundry-navy/10 border-b border-orange-200">
                  <p className="text-sm font-medium text-fundry-navy">
                    Showing first {Math.min(previewData.length, 10)} rows from your file
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <th key={key} className="px-4 py-3 text-left font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-orange-50/30">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-3 text-gray-600 border-r border-gray-100 last:border-r-0">
                              {value || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {previewData.length > 10 && (
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-blue-50 border-t border-orange-200">
                    <p className="text-sm text-gray-600 text-center">
                      ... and {previewData.length - 10} more rows
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No preview data available</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white"
            >
              Close
            </Button>
            {previewData.length > 0 && (
              <Button
                onClick={() => {
                  setShowPreview(false);
                  handleUpload();
                }}
                className="bg-fundry-orange hover:bg-orange-600 text-white"
              >
                Proceed with Upload
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}