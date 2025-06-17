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

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignWithStats;
}

export function EditCampaignModal({ isOpen, onClose, campaign }: EditCampaignModalProps) {
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
            experience: member.experience || '',
            linkedinProfile: member.linkedinProfile || '',
            photo: member.photoUrl || ''
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
    useOfFunds: campaign.useOfFunds || '',
    teamStructure: campaign.teamStructure || '',
  });
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(parseTeamMembers());
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

            <div className="space-y-2">
              <Label htmlFor="useOfFunds">Use of Funds</Label>
              <Textarea
                id="useOfFunds"
                value={formData.useOfFunds}
                onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
                placeholder="Describe how you'll use the funding"
                rows={3}
              />
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
                                ? member.photo.name 
                                : member.photo && typeof member.photo === 'string' && member.photo !== ''
                                  ? 'Current photo uploaded'
                                  : 'Upload profile photo'
                              }
                            </span>
                          </label>
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