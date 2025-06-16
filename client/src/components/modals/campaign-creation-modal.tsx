import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CloudUpload, FileText, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

const campaignSchema = z.object({
  title: z.string().min(1, "Campaign title is required"),
  businessSector: z.string().min(1, "Business sector is required"),
  shortPitch: z.string().min(1, "Short pitch is required"),
  fullPitch: z.string().min(10, "Full pitch must be at least 10 characters"),
  fundingGoal: z.number().min(100).max(5000, "Funding goal must be between $100 and $5,000"),
  minimumInvestment: z.number().min(25, "Minimum investment must be at least $25"),
  deadline: z.string().optional(),
  discountRate: z.number().min(0).max(50, "Discount rate must be between 0% and 50%"),
  valuationCap: z.number().min(10000, "Valuation cap must be at least $10,000"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignCreationModal({ isOpen, onClose }: CampaignCreationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      businessSector: "",
      shortPitch: "",
      fullPitch: "",
      fundingGoal: 5000,
      minimumInvestment: 25,
      deadline: "",
      discountRate: 20,
      valuationCap: 1000000,
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Append files
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (pitchDeckFile) {
        formData.append("pitchDeck", pitchDeckFile);
      }

      const response = await fetch("/api/campaigns", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/founder/" + user?.id] });
      onClose();
      form.reset();
      setLogoFile(null);
      setPitchDeckFile(null);
    },
    onError: (error) => {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file);
    }
  };

  const handlePitchDeckUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPitchDeckFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Create New Campaign</DialogTitle>
          <p className="text-gray-600 mt-2">Set up your fundraising campaign in a few simple steps</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., EcoTech Solar Solutions" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="businessSector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Sector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="fintech">FinTech</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="cleantech">CleanTech</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Campaign Details */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Campaign Details</h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="shortPitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Pitch (One-liner)</FormLabel>
                      <FormControl>
                        <Input placeholder="Revolutionary solar panel technology for residential use" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullPitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Pitch</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={6} 
                          placeholder="Describe your business, problem you're solving, solution, market opportunity, and why investors should invest..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Campaign Logo/Cover Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-fundry-orange transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        {logoFile ? logoFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Pitch Deck (PDF)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-fundry-orange transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePitchDeckUpload}
                      className="hidden"
                      id="pitch-deck-upload"
                    />
                    <label htmlFor="pitch-deck-upload" className="cursor-pointer">
                      <FileText className="mx-auto h-12 w-12 text-red-400 mb-4" />
                      <p className="text-gray-600">
                        {pitchDeckFile ? pitchDeckFile.name : "Upload your pitch deck"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">PDF up to 25MB</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Settings */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Funding Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="fundingGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funding Goal</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">$</span>
                          <Input 
                            type="number" 
                            className="pl-8" 
                            placeholder="5000" 
                            max={5000}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <p className="text-sm text-gray-500">Maximum: $5,000</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minimumInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Investment</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">$</span>
                          <Input 
                            type="number" 
                            className="pl-8" 
                            placeholder="25"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 25)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SAFE Agreement */}
            <div className="pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">SAFE Agreement Template</h3>
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="discountRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Rate (%)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                className="pr-8"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              <span className="absolute right-3 top-3 text-gray-500">%</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="valuationCap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valuation Cap</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-500">$</span>
                              <Input 
                                type="number" 
                                className="pl-8" 
                                placeholder="1000000"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Card className="mt-4 bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <Info className="text-blue-500 mt-1 mr-3 flex-shrink-0" size={20} />
                        <div>
                          <h4 className="font-medium text-blue-900">SAFE Agreement Info</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            A Simple Agreement for Future Equity (SAFE) allows investors to convert their investment to equity in future funding rounds. The discount rate and valuation cap protect early investors.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-fundry-orange hover:bg-orange-600"
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
