import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  X
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
  errors: string[];
  duplicates: number;
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
                          className="text-white border-white/20 hover:bg-white/20"
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
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      Upload Results
                    </h4>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {uploadResult.successful}
                        </p>
                        <p className="text-sm text-orange-200">Successful</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">
                          {uploadResult.failed}
                        </p>
                        <p className="text-sm text-orange-200">Failed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">
                          {uploadResult.duplicates}
                        </p>
                        <p className="text-sm text-orange-200">Duplicates</p>
                      </div>
                    </div>
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-400 mb-2">Errors:</p>
                        <ul className="text-xs text-orange-200 space-y-1">
                          {uploadResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {uploadResult.errors.length > 5 && (
                            <li>• And {uploadResult.errors.length - 5} more...</li>
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
    </div>
  );
}