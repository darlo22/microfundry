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
import { CloudUpload, FileText, Info, Users, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

// Countries and registration types data
const COUNTRIES_STATES = {
  "United States": {
    states: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
    registrationTypes: ["C Corporation", "S Corporation", "LLC", "Partnership", "Sole Proprietorship", "Non-Profit Corporation"]
  },
  "United Kingdom": {
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    registrationTypes: ["Private Limited Company", "Public Limited Company", "Limited Liability Partnership", "Community Interest Company", "Sole Trader", "Partnership"]
  },
  "Canada": {
    states: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"],
    registrationTypes: ["Corporation", "Partnership", "Sole Proprietorship", "Co-operative", "Not-for-profit Corporation"]
  },
  "Australia": {
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
    registrationTypes: ["Proprietary Limited Company", "Public Company", "Partnership", "Sole Trader", "Trust", "Co-operative"]
  },
  "Germany": {
    states: ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
    registrationTypes: ["GmbH", "AG", "UG", "KG", "OHG", "Einzelunternehmen"]
  },
  "France": {
    states: ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire", "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine", "Occitania", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"],
    registrationTypes: ["SARL", "SAS", "SA", "EURL", "SNC", "Auto-entrepreneur"]
  },
  "India": {
    states: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"],
    registrationTypes: ["Private Limited Company", "Public Limited Company", "Limited Liability Partnership", "One Person Company", "Partnership Firm", "Sole Proprietorship"]
  },
  "Nigeria": {
    states: ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"],
    registrationTypes: ["Private Limited Company", "Public Limited Company", "Limited by Guarantee", "Unlimited Company", "Partnership", "Sole Proprietorship"]
  },
  "South Africa": {
    states: ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"],
    registrationTypes: ["Private Company", "Public Company", "Personal Liability Company", "Close Corporation", "Sole Proprietorship", "Partnership"]
  }
};

const COUNTRIES = Object.keys(COUNTRIES_STATES);

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional(),
  linkedin: z.string().optional(),
  photo: z.string().optional(), // Will store base64 encoded image data
});

const fundAllocationSchema = z.object({
  id: z.string(),
  category: z.string().min(1, "Category is required"),
  percentage: z.number().min(1).max(100),
  description: z.string().optional(),
});

const directorSchema = z.object({
  name: z.string().min(1, "Director name is required"),
  title: z.string().min(1, "Director title is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Valid email is required").optional(),
  phone: z.string().optional(),
});

const campaignSchema = z.object({
  // Business Information (First Section)
  companyName: z.string().min(1, "Company/Business name is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State/Province is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  registrationStatus: z.enum(["registered", "in-process"], {
    required_error: "Registration status is required",
  }),
  registrationType: z.string().optional(),
  directors: z.array(directorSchema).min(1, "At least one director is required"),
  
  // Campaign Details
  title: z.string().min(1, "Campaign title is required"),
  businessSector: z.string().min(1, "Business sector is required"),
  shortPitch: z.string().min(1, "Short pitch is required"),
  fullPitch: z.string().min(10, "Full pitch must be at least 10 characters"),
  fundingGoal: z.number().min(100).max(5000, "Funding goal must be between $100 and $5,000"),
  minimumInvestment: z.number().min(25, "Minimum investment must be at least $25"),
  deadline: z.string().optional(),
  discountRate: z.number().min(0).max(50, "Discount rate must be between 0% and 50%"),
  valuationCap: z.number().min(10000, "Valuation cap must be at least $10,000"),
  
  // Business Strategy Fields
  problemStatement: z.string().min(10, "Problem statement is required"),
  solution: z.string().min(10, "Solution is required"),
  marketOpportunity: z.string().min(10, "Market opportunity is required"),
  businessModel: z.string().min(10, "Business model is required"),
  goToMarketStrategy: z.string().min(10, "Go-to-market strategy is required"),
  competitiveLandscape: z.string().min(10, "Competitive landscape is required"),
  
  // Traction & Stage
  startupStage: z.string().min(1, "Startup stage is required"),
  currentRevenue: z.string().optional(),
  customers: z.string().optional(),
  previousFunding: z.string().optional(),
  keyMilestones: z.string().optional(),
  
  // Team Information
  teamStructure: z.enum(["solo", "team"]),
  teamMembers: z.array(teamMemberSchema).optional(),
  
  // Use of Funds
  useOfFunds: z.array(fundAllocationSchema).refine(
    (allocations) => {
      const totalPercentage = allocations.reduce((sum, allocation) => sum + allocation.percentage, 0);
      return totalPercentage === 100;
    },
    {
      message: "Total percentage must equal 100%",
    }
  ),
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
  const [teamMemberPhotos, setTeamMemberPhotos] = useState<{[key: number]: string}>({});

  // Director management functions
  const addDirector = () => {
    const currentDirectors = form.getValues("directors");
    const newDirector = {
      name: "",
      title: "",
      nationality: "",
      address: "",
      email: "",
      phone: ""
    };
    form.setValue("directors", [...currentDirectors, newDirector]);
  };

  const removeDirector = (index: number) => {
    const currentDirectors = form.getValues("directors");
    if (currentDirectors.length > 1) {
      form.setValue("directors", currentDirectors.filter((_, i) => i !== index));
    }
  };

  const updateDirector = (index: number, field: keyof typeof directorSchema._type, value: string) => {
    const currentDirectors = form.getValues("directors");
    const updatedDirectors = currentDirectors.map((director, i) =>
      i === index ? { ...director, [field]: value } : director
    );
    form.setValue("directors", updatedDirectors);
  };

  // Use of Funds management functions
  const addFundAllocation = () => {
    const currentAllocations = form.getValues("useOfFunds");
    const newAllocation = {
      id: Date.now().toString(),
      category: "",
      percentage: 0,
      description: ""
    };
    form.setValue("useOfFunds", [...currentAllocations, newAllocation]);
  };

  const removeFundAllocation = (id: string) => {
    const currentAllocations = form.getValues("useOfFunds");
    form.setValue("useOfFunds", currentAllocations.filter(allocation => allocation.id !== id));
  };

  const updateFundAllocation = (id: string, field: keyof typeof fundAllocationSchema._type, value: any) => {
    const currentAllocations = form.getValues("useOfFunds");
    const updatedAllocations = currentAllocations.map(allocation =>
      allocation.id === id ? { ...allocation, [field]: value } : allocation
    );
    form.setValue("useOfFunds", updatedAllocations);
  };

  const getTotalPercentage = () => {
    const allocations = form.watch("useOfFunds");
    return allocations.reduce((sum, allocation) => sum + (allocation.percentage || 0), 0);
  };

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      // Business Information
      companyName: "",
      country: "",
      state: "",
      businessAddress: "",
      registrationStatus: "registered" as const,
      registrationType: "",
      directors: [{
        name: "",
        title: "",
        nationality: "",
        address: "",
        email: "",
        phone: ""
      }],
      
      // Campaign Details
      title: "",
      businessSector: "",
      shortPitch: "",
      fullPitch: "",
      fundingGoal: 5000,
      minimumInvestment: 25,
      deadline: "",
      discountRate: 20,
      valuationCap: 1000000,
      problemStatement: "",
      solution: "",
      marketOpportunity: "",
      businessModel: "",
      goToMarketStrategy: "",
      competitiveLandscape: "",
      startupStage: "",
      currentRevenue: "",
      customers: "",
      previousFunding: "",
      keyMilestones: "",
      teamStructure: "solo",
      teamMembers: [],
      useOfFunds: [
        {
          id: "1",
          category: "Product Development",
          percentage: 40,
          description: "Building and improving our core product"
        },
        {
          id: "2", 
          category: "Marketing & Sales",
          percentage: 30,
          description: "Customer acquisition and marketing campaigns"
        },
        {
          id: "3",
          category: "Operations",
          percentage: 20,
          description: "General business operations and overhead"
        },
        {
          id: "4",
          category: "Legal & Compliance",
          percentage: 10,
          description: "Legal fees and regulatory compliance"
        }
      ],
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          if ((key === 'teamMembers' || key === 'useOfFunds') && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
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
      // Invalidate both founder campaigns and public campaigns lists
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/founder/" + user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      onClose();
      form.reset();
      setLogoFile(null);
      setPitchDeckFile(null);
      setTeamMemberPhotos({});
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
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Company logo must be under 2MB. Please choose a smaller image.",
          variant: "destructive",
        });
        event.target.value = ''; // Clear the input
        return;
      }
      setLogoFile(file);
    }
  };

  const handlePitchDeckUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPitchDeckFile(file);
    }
  };

  const handleTeamMemberPhotoUpload = (memberIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Team member photo must be under 2MB. Please choose a smaller image.",
          variant: "destructive",
        });
        event.target.value = ''; // Clear the input
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setTeamMemberPhotos(prev => ({
          ...prev,
          [memberIndex]: base64String
        }));
        
        // Update the form data with the photo
        const currentTeamMembers = form.getValues("teamMembers") || [];
        if (currentTeamMembers[memberIndex]) {
          currentTeamMembers[memberIndex].photo = base64String;
          form.setValue("teamMembers", currentTeamMembers);
        }
      };
      reader.readAsDataURL(file);
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
            {/* Business Information - First Section */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
                Business Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Business Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., EcoTech Solar Solutions Ltd." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Country */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("state", ""); // Reset state when country changes
                          form.setValue("registrationType", ""); // Reset registration type
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State/Province */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state/province" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("country") && COUNTRIES_STATES[form.watch("country") as keyof typeof COUNTRIES_STATES]?.states?.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                          {(!form.watch("country") || !COUNTRIES_STATES[form.watch("country") as keyof typeof COUNTRIES_STATES]?.states) && (
                            <SelectItem value="none" disabled>Please select a country first</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Business Address */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter full business address including street, city, postal code" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Registration Status */}
                <FormField
                  control={form.control}
                  name="registrationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="registered">Registered</SelectItem>
                          <SelectItem value="in-process">In Process</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Registration Type - Only show if registered */}
                {form.watch("registrationStatus") === "registered" && (
                  <FormField
                    control={form.control}
                    name="registrationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select registration type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {form.watch("country") && COUNTRIES_STATES[form.watch("country") as keyof typeof COUNTRIES_STATES]?.registrationTypes?.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                            {(!form.watch("country") || !COUNTRIES_STATES[form.watch("country") as keyof typeof COUNTRIES_STATES]?.registrationTypes) && (
                              <SelectItem value="none" disabled>Please select a country first</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Directors Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Directors/Key Personnel</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDirector}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Director
                  </Button>
                </div>

                {form.watch("directors").map((director, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-gray-900">Director {index + 1}</h5>
                        {form.watch("directors").length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDirector(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`directors.${index}.name` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe" 
                                  {...field}
                                  onChange={(e) => updateDirector(index, "name", e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`directors.${index}.title` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title/Position *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="CEO, CTO, Director, etc." 
                                  {...field}
                                  onChange={(e) => updateDirector(index, "title", e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`directors.${index}.nationality` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nationality *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., American, British, Nigerian" 
                                  {...field}
                                  onChange={(e) => updateDirector(index, "nationality", e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`directors.${index}.email` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="john@company.com" 
                                  {...field}
                                  onChange={(e) => updateDirector(index, "email", e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name={`directors.${index}.address` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Full residential address" 
                                    {...field}
                                    onChange={(e) => updateDirector(index, "address", e.target.value)}
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Campaign Details - Second Section */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
                Campaign Details
              </h3>
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
                          <SelectItem value="agriculture">Agriculture & Food</SelectItem>
                          <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                          <SelectItem value="automotive">Automotive & Transportation</SelectItem>
                          <SelectItem value="biotechnology">Biotechnology</SelectItem>
                          <SelectItem value="blockchain">Blockchain & Crypto</SelectItem>
                          <SelectItem value="cleantech">CleanTech & Sustainability</SelectItem>
                          <SelectItem value="construction">Construction & Real Estate</SelectItem>
                          <SelectItem value="consumer-goods">Consumer Products</SelectItem>
                          <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                          <SelectItem value="data-analytics">Data & Analytics</SelectItem>
                          <SelectItem value="ecommerce">E-commerce & Retail</SelectItem>
                          <SelectItem value="education">Education & EdTech</SelectItem>
                          <SelectItem value="energy">Energy & Utilities</SelectItem>
                          <SelectItem value="entertainment">Entertainment & Media</SelectItem>
                          <SelectItem value="fashion">Fashion & Beauty</SelectItem>
                          <SelectItem value="fintech">FinTech</SelectItem>
                          <SelectItem value="fitness">Fitness & Wellness</SelectItem>
                          <SelectItem value="gaming">Gaming & Sports</SelectItem>
                          <SelectItem value="government">Government & Public Sector</SelectItem>
                          <SelectItem value="hardware">Hardware & IoT</SelectItem>
                          <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                          <SelectItem value="hospitality">Hospitality & Travel</SelectItem>
                          <SelectItem value="hr-recruiting">HR & Recruiting</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="legal">Legal & Compliance</SelectItem>
                          <SelectItem value="logistics">Logistics & Supply Chain</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                          <SelectItem value="mobility">Mobility & Transportation</SelectItem>
                          <SelectItem value="nonprofit">Non-profit & Social Impact</SelectItem>
                          <SelectItem value="pets">Pets & Animals</SelectItem>
                          <SelectItem value="productivity">Productivity & Tools</SelectItem>
                          <SelectItem value="robotics">Robotics & Automation</SelectItem>
                          <SelectItem value="saas">SaaS & Enterprise Software</SelectItem>
                          <SelectItem value="security">Security & Safety</SelectItem>
                          <SelectItem value="social-networking">Social Networking</SelectItem>
                          <SelectItem value="space">Space & Aerospace</SelectItem>
                          <SelectItem value="telecommunications">Telecommunications</SelectItem>
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
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
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

            {/* Business Strategy */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Business Strategy</h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="problemStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Statement</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Describe the specific, real-world problem your target users face. Make it relatable and urgent..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="solution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Present your product or service as the answer to the problem. Explain how it works at a high level and what makes it better, faster, or more efficient than current options..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketOpportunity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Opportunity</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Define who your target customers are. Present TAM, SAM, and SOM if possible to show market size. Emphasize the scale and potential of the opportunity..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Model</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Explain how your startup makes money (subscriptions, transaction fees, SaaS, etc.). Mention pricing strategy and key revenue streams. Include metrics or visuals to demonstrate momentum..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goToMarketStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Go-To-Market Strategy</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Explain how you'll acquire users or customers. Include marketing channels, partnerships, and sales tactics..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competitiveLandscape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitive Landscape</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Identify key competitors. Show how you're different (price, UX, technology, community, etc.). Highlight any unfair advantage..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Traction & Startup Stage */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Traction & Startup Stage</h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="startupStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startup Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="idea">Idea Stage</SelectItem>
                          <SelectItem value="prototype">Prototype/MVP</SelectItem>
                          <SelectItem value="beta">Beta Testing</SelectItem>
                          <SelectItem value="launched">Launched Product</SelectItem>
                          <SelectItem value="revenue">Generating Revenue</SelectItem>
                          <SelectItem value="scaling">Scaling</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="currentRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Monthly Revenue (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., $5,000 or $0 (pre-revenue)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Customers/Users (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 150 paying customers, 1,000 users" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="previousFunding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Funding (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $10,000 friends & family, bootstrapped" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keyMilestones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Milestones & Achievements (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          placeholder="e.g., Product launched, first 100 customers acquired, partnership with XYZ Corp..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Team Information */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Team Information</h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="teamStructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Structure</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="solo">Solo Founder</SelectItem>
                          <SelectItem value="team">Team (Co-founders/Key Members)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("teamStructure") === "team" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Team Members</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentMembers = form.getValues("teamMembers") || [];
                          form.setValue("teamMembers", [
                            ...currentMembers,
                            { name: "", role: "", bio: "", linkedin: "" }
                          ]);
                        }}
                      >
                        Add Team Member
                      </Button>
                    </div>
                    
                    {(form.watch("teamMembers") || []).map((_, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`teamMembers.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`teamMembers.${index}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Co-founder & CTO" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`teamMembers.${index}.bio`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bio (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      rows={2} 
                                      placeholder="Brief background and relevant experience..."
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`teamMembers.${index}.linkedin`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>LinkedIn URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://linkedin.com/in/username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Photo Upload */}
                          <div className="space-y-2">
                            <Label>Photo (Optional)</Label>
                            <div className="flex flex-col space-y-3">
                              {teamMemberPhotos[index] && (
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={teamMemberPhotos[index]} 
                                    alt={`Team member ${index + 1}`}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                  />
                                  <div className="text-sm text-gray-600">
                                    Photo uploaded successfully
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleTeamMemberPhotoUpload(index, e)}
                                  className="text-sm"
                                />
                                <span className="text-xs text-gray-400">Max size: 2MB</span>
                                {teamMemberPhotos[index] && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setTeamMemberPhotos(prev => {
                                        const updated = { ...prev };
                                        delete updated[index];
                                        return updated;
                                      });
                                      const currentMembers = form.getValues("teamMembers") || [];
                                      if (currentMembers[index]) {
                                        currentMembers[index].photo = "";
                                        form.setValue("teamMembers", currentMembers);
                                      }
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const currentMembers = form.getValues("teamMembers") || [];
                                const updatedMembers = currentMembers.filter((_, i) => i !== index);
                                form.setValue("teamMembers", updatedMembers);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {(!form.watch("teamMembers") || form.watch("teamMembers")?.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No team members added yet. Click "Add Team Member" to include co-founders and key team members.
                      </p>
                    )}
                  </div>
                )}

                {form.watch("teamStructure") === "solo" && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Solo Founder:</strong> You're building this venture independently. 
                      This shows investors you're taking full ownership and responsibility for the business.
                    </p>
                  </Card>
                )}
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

            {/* Use of Funds */}
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Use of Funds</h3>
              <p className="text-sm text-gray-600 mb-4">
                Break down how you plan to use the funding. Total must equal 100%.
              </p>
              
              <div className="space-y-4">
                {(form.watch("useOfFunds") || []).map((allocation, index) => (
                  <Card key={allocation.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-4">
                        <Label htmlFor={`category-${index}`}>Category</Label>
                        <Input
                          id={`category-${index}`}
                          placeholder="e.g., Product Development"
                          value={allocation.category}
                          onChange={(e) => updateFundAllocation(allocation.id, "category", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor={`percentage-${index}`}>Percentage</Label>
                        <div className="relative mt-1">
                          <Input
                            id={`percentage-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={allocation.percentage || ""}
                            onChange={(e) => updateFundAllocation(allocation.id, "percentage", parseInt(e.target.value) || 0)}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-3 text-gray-500">%</span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-5">
                        <Label htmlFor={`description-${index}`}>Description (Optional)</Label>
                        <Input
                          id={`description-${index}`}
                          placeholder="Brief description of this allocation"
                          value={allocation.description || ""}
                          onChange={(e) => updateFundAllocation(allocation.id, "description", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFundAllocation(allocation.id)}
                          className="text-red-600 hover:text-red-800 mt-6"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFundAllocation}
                    className="flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                  
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      getTotalPercentage() === 100 ? 'text-green-600' : 
                      getTotalPercentage() > 100 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      Total: {getTotalPercentage()}%
                    </div>
                    {getTotalPercentage() !== 100 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {getTotalPercentage() < 100 ? 
                          `${100 - getTotalPercentage()}% remaining` : 
                          `${getTotalPercentage() - 100}% over limit`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
