import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Upload, X, Plus, User, Trash2 } from "lucide-react";
import { CampaignWithStats } from "@/lib/types";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: string;
  linkedinProfile: string;
  photo?: File | string;
}

interface FundAllocation {
  id: string;
  category: string;
  percentage: number;
  description: string;
}

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithStats;
}

export function EditCampaignModal({ isOpen, onClose, campaign }: EditCampaignModalProps) {
  // Parse existing fund allocations from campaign data
  const parseFundAllocations = (): FundAllocation[] => {
    try {
      if (campaign.useOfFunds && Array.isArray(campaign.useOfFunds)) {
        return campaign.useOfFunds.map((allocation: any, index: number) => ({
          id: allocation.id || `allocation-${index}`,
          category: allocation.category || '',
          percentage: allocation.percentage || 0,
          description: allocation.description || ''
        }));
      }
    } catch (e) {
      console.error('Error parsing fund allocations:', e);
    }
    return [
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
    ];
  };

  // Parse existing team members from campaign data
  const parseTeamMembers = (): TeamMember[] => {
    try {
      if (typeof campaign.teamMembers === 'string' && campaign.teamMembers) {
        const parsed = JSON.parse(campaign.teamMembers);
        if (Array.isArray(parsed)) {
          return parsed.map((member: any, index: number) => ({
            id: member.id || `member-${index}`,
            name: member.name || '',
            role: member.role || '',
            experience: member.experience || member.bio || '',
            linkedinProfile: member.linkedinProfile || member.linkedin || '',
            photo: member.photoUrl || member.photo || ''
          }));
        }
      }
    } catch (e) {
      // If parsing fails, try to extract from text format
      if (typeof campaign.teamMembers === 'string' && campaign.teamMembers) {
        const lines = campaign.teamMembers.split('\n').filter(line => line.trim());
        return lines.map((line, index) => {
          const match = line.match(/^(.+?)\s*\((.+?)\)\s*-?\s*(.*)$/);
          if (match) {
            return {
              id: `member-${index}`,
              name: match[1].trim(),
              role: match[2].trim(),
              experience: '',
              linkedinProfile: match[3].trim(),
              photo: ''
            };
          }
          return {
            id: `member-${index}`,
            name: line.trim(),
            role: '',
            experience: '',
            linkedinProfile: '',
            photo: ''
          };
        });
      }
    }
    return [];
  };

  const [formData, setFormData] = useState({
    title: campaign.title,
    shortPitch: campaign.shortPitch,
    fullPitch: campaign.fullPitch,
    fundingGoal: campaign.fundingGoal,
    minimumInvestment: campaign.minimumInvestment,
    discountRate: campaign.discountRate,
    valuationCap: campaign.valuationCap,
    businessSector: campaign.businessSector || '',
    startupStage: campaign.startupStage || '',
    currentRevenue: campaign.currentRevenue || '',
    customers: campaign.customers || '',
    teamStructure: campaign.teamStructure || '',
  });
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(parseTeamMembers());
  const [fundAllocations, setFundAllocations] = useState<FundAllocation[]>(parseFundAllocations());
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fund allocation management functions
  const addFundAllocation = () => {
    const newAllocation: FundAllocation = {
      id: `allocation-${Date.now()}`,
      category: '',
      percentage: 0,
      description: ''
    };
    setFundAllocations([...fundAllocations, newAllocation]);
  };

  const removeFundAllocation = (id: string) => {
    setFundAllocations(fundAllocations.filter(allocation => allocation.id !== id));
  };

  const updateFundAllocation = (id: string, field: keyof FundAllocation, value: any) => {
    setFundAllocations(fundAllocations.map(allocation =>
      allocation.id === id ? { ...allocation, [field]: value } : allocation
    ));
  };

  const getTotalPercentage = () => {
    return fundAllocations.reduce((sum, allocation) => sum + (allocation.percentage || 0), 0);
  };

  // Team member management functions
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: '',
      role: '',
      experience: '',
      linkedinProfile: '',
      photo: ''
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string | File) => {
    setTeamMembers(members => 
      members.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(members => members.filter(member => member.id !== id));
  };

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        body: data,
      });
      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign Updated",
        description: "Your campaign has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns', campaign.id] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    
    // Append all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        submitData.append(key, value);
      }
    });

    // Append structured team members data
    submitData.append('teamMembers', JSON.stringify(teamMembers));
    
    // Append structured fund allocations data
    submitData.append('useOfFunds', JSON.stringify(fundAllocations));

    // Append files if selected
    if (logoFile) {
      submitData.append('logo', logoFile);
    }
    if (pitchDeckFile) {
      submitData.append('pitchDeck', pitchDeckFile);
    }

    // Append team member photos
    teamMembers.forEach((member, index) => {
      if (member.photo instanceof File) {
        submitData.append(`teamMemberPhoto_${member.id}`, member.photo);
      }
    });

    updateMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const businessSectors = [
    "AI/Machine Learning", "Blockchain/Cryptocurrency", "CleanTech/GreenTech", "Healthcare/Biotech",
    "FinTech", "EdTech", "E-commerce", "SaaS", "Mobile Apps", "IoT", "Cybersecurity", "AgTech",
    "FoodTech", "PropTech", "Transportation", "Gaming", "Media/Entertainment", "Manufacturing",
    "Robotics", "Space Tech", "Energy", "Social Impact", "B2B Services", "Consumer Goods",
    "Fashion/Beauty", "Sports/Fitness", "Travel/Hospitality", "Legal Tech", "HR Tech", "MarTech",
    "Supply Chain", "Construction", "Insurance", "Real Estate", "Automotive", "Telecommunications",
    "Retail", "Other"
  ];

  const startupStages = [
    "Idea Stage", "MVP Development", "Beta Testing", "Early Revenue", "Growth Stage", "Scaling"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Campaign
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter your campaign title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortPitch">Short Pitch</Label>
              <Textarea
                id="shortPitch"
                value={formData.shortPitch}
                onChange={(e) => handleInputChange('shortPitch', e.target.value)}
                placeholder="Brief description of your startup"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullPitch">Full Pitch</Label>
              <Textarea
                id="fullPitch"
                value={formData.fullPitch}
                onChange={(e) => handleInputChange('fullPitch', e.target.value)}
                placeholder="Detailed description of your startup, problem, solution, and market"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Funding Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Funding Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fundingGoal">Funding Goal ($)</Label>
                <Input
                  id="fundingGoal"
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                  placeholder="5000"
                  max="5000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumInvestment">Minimum Investment ($)</Label>
                <Input
                  id="minimumInvestment"
                  type="number"
                  value={formData.minimumInvestment}
                  onChange={(e) => handleInputChange('minimumInvestment', e.target.value)}
                  placeholder="25"
                  min="25"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountRate">Discount Rate (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  value={formData.discountRate}
                  onChange={(e) => handleInputChange('discountRate', e.target.value)}
                  placeholder="20"
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valuationCap">Valuation Cap ($)</Label>
                <Input
                  id="valuationCap"
                  type="number"
                  value={formData.valuationCap}
                  onChange={(e) => handleInputChange('valuationCap', e.target.value)}
                  placeholder="1000000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessSector">Business Sector</Label>
                <Select value={formData.businessSector} onValueChange={(value) => handleInputChange('businessSector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startupStage">Startup Stage</Label>
                <Select value={formData.startupStage} onValueChange={(value) => handleInputChange('startupStage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {startupStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentRevenue">Current Monthly Revenue ($)</Label>
                <Input
                  id="currentRevenue"
                  value={formData.currentRevenue}
                  onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customers">Number of Customers</Label>
                <Input
                  id="customers"
                  value={formData.customers}
                  onChange={(e) => handleInputChange('customers', e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            {/* Use of Funds */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Use of Funds</h4>
                  <p className="text-sm text-gray-600">Break down how you plan to use the funding. Total must equal 100%.</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {fundAllocations.map((allocation, index) => (
                  <div key={allocation.id} className="grid grid-cols-12 gap-3 items-start p-3 border rounded-lg">
                    <div className="col-span-4">
                      <Label htmlFor={`category-${index}`} className="text-sm font-medium">Category</Label>
                      <Input
                        id={`category-${index}`}
                        placeholder="e.g., Product Development"
                        value={allocation.category}
                        onChange={(e) => updateFundAllocation(allocation.id, "category", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor={`percentage-${index}`} className="text-sm font-medium">Percentage</Label>
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
                        <span className="absolute right-3 top-3 text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                    
                    <div className="col-span-5">
                      <Label htmlFor={`description-${index}`} className="text-sm font-medium">Description (Optional)</Label>
                      <Input
                        id={`description-${index}`}
                        placeholder="Brief description"
                        value={allocation.description || ""}
                        onChange={(e) => updateFundAllocation(allocation.id, "description", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
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
                ))}
                
                <div className="flex justify-between items-center pt-2">
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
          </div>

          {/* Team Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Team Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="teamStructure">Team Structure</Label>
              <Select value={formData.teamStructure} onValueChange={(value) => handleInputChange('teamStructure', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solo Founder">Solo Founder</SelectItem>
                  <SelectItem value="Co-founders">Co-founders</SelectItem>
                  <SelectItem value="Small Team (3-5)">Small Team (3-5)</SelectItem>
                  <SelectItem value="Medium Team (6-15)">Medium Team (6-15)</SelectItem>
                  <SelectItem value="Large Team (15+)">Large Team (15+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Team Members</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTeamMember}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </Button>
              </div>
              
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No team members added yet</p>
                  <p className="text-sm">Click "Add Member" to add your first team member</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Team Member #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${member.id}`}>Full Name</Label>
                          <Input
                            id={`name-${member.id}`}
                            value={member.name}
                            onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`role-${member.id}`}>Role/Title</Label>
                          <Input
                            id={`role-${member.id}`}
                            value={member.role}
                            onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                            placeholder="CEO, CTO, Designer, etc."
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`experience-${member.id}`}>Experience & Background</Label>
                        <Textarea
                          id={`experience-${member.id}`}
                          value={member.experience}
                          onChange={(e) => updateTeamMember(member.id, 'experience', e.target.value)}
                          placeholder="Brief description of their background and experience"
                          rows={2}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`linkedin-${member.id}`}>LinkedIn Profile</Label>
                        <Input
                          id={`linkedin-${member.id}`}
                          value={member.linkedinProfile}
                          onChange={(e) => updateTeamMember(member.id, 'linkedinProfile', e.target.value)}
                          placeholder="https://www.linkedin.com/in/username"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`photo-${member.id}`}>Profile Photo</Label>
                        <div className="space-y-3">
                          {/* Photo Preview */}
                          {(member.photo && typeof member.photo === 'string' && member.photo !== '') && (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <img 
                                src={member.photo} 
                                alt={member.name || 'Team member'}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  console.warn('Photo failed to load:', member.photo);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">Current Photo</div>
                                <div className="text-xs text-gray-500">Photo is uploaded and visible</div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => updateTeamMember(member.id, 'photo', '')}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Upload New Photo */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              id={`photo-${member.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  updateTeamMember(member.id, 'photo', file);
                                }
                              }}
                              className="hidden"
                            />
                            <label htmlFor={`photo-${member.id}`} className="cursor-pointer flex flex-col items-center gap-2">
                              <Upload className="w-6 h-6 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {member.photo instanceof File 
                                  ? `Selected: ${member.photo.name}`
                                  : (member.photo && typeof member.photo === 'string' && member.photo !== '')
                                    ? 'Upload new photo'
                                    : 'Upload profile photo'
                                }
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Add individual team members with their photos and information. This will be displayed in the Meet the Team section.
              </p>
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Assets</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="logo" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {logoFile ? logoFile.name : 'Upload new logo'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pitchDeck">Pitch Deck</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    id="pitchDeck"
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => setPitchDeckFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="pitchDeck" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {pitchDeckFile ? pitchDeckFile.name : 'Upload new pitch deck'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {updateMutation.isPending ? "Updating..." : "Update Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}