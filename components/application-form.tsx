"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ApplicationFormData {
  // Personal Information
  email: string
  fullName: string
  age: string
  city: string
  
  // Contact & Social Information
  phone: string
  instagramHandle: string
  twitterHandle: string
  linkedinProfile: string
  personalWebsite: string
  otherSocials: string
  
  // Professional Background
  profession: string
  currentJob: string
  creativeBackground: string
  
  // Studio Usage & Goals
  studioUsagePurpose: string
  creativeGoals: string
  experienceLevel: string
  equipmentFamiliarity: string
  
  // Availability & Commitment
  preferredTimeSlots: string
  weeklyHoursEstimate: string
  longTermCommitment: boolean
  
  // Background & Motivation
  aboutYourself: string
  whyJoinStudio: string
  previousStudioExperience: string
  
  // Community & References
  howDidYouHear: string
  referralName: string
  communityContribution: string
  collaborationInterest: boolean
  
  // Additional Information
  specialRequirements: string
  additionalComments: string
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-3 text-base font-semibold rounded-md h-12 shadow-md hover:shadow-lg transition-all"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting Application...
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Submit Application
        </>
      )}
    </Button>
  )
}

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    // Personal Information
    email: '',
    fullName: '',
    age: '',
    city: '',
    
    // Contact & Social Information
    phone: '',
    instagramHandle: '',
    twitterHandle: '',
    linkedinProfile: '',
    personalWebsite: '',
    otherSocials: '',
    
    // Professional Background
    profession: '',
    currentJob: '',
    creativeBackground: '',
    
    // Studio Usage & Goals
    studioUsagePurpose: '',
    creativeGoals: '',
    experienceLevel: '',
    equipmentFamiliarity: '',
    
    // Availability & Commitment
    preferredTimeSlots: '',
    weeklyHoursEstimate: '',
    longTermCommitment: false,
    
    // Background & Motivation
    aboutYourself: '',
    whyJoinStudio: '',
    previousStudioExperience: '',
    
    // Community & References
    howDidYouHear: '',
    referralName: '',
    communityContribution: '',
    collaborationInterest: false,
    
    // Additional Information
    specialRequirements: '',
    additionalComments: ''
  })

  const totalSteps = 6

  const handleInputChange = (field: keyof ApplicationFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error("Please sign in to submit an application")
        setIsLoading(false)
        return
      }

      // Submit application to database
      const { data, error } = await supabase
        .from('applications')
        .insert({
          email: formData.email || user.email,
          full_name: formData.fullName,
          age: formData.age ? parseInt(formData.age) : null,
          city: formData.city,
          phone: formData.phone || null,
          instagram_handle: formData.instagramHandle || null,
          twitter_handle: formData.twitterHandle || null,
          linkedin_profile: formData.linkedinProfile || null,
          personal_website: formData.personalWebsite || null,
          other_socials: formData.otherSocials || null,
          profession: formData.profession || null,
          current_job: formData.currentJob || null,
          creative_background: formData.creativeBackground || null,
          studio_usage_purpose: formData.studioUsagePurpose,
          creative_goals: formData.creativeGoals || null,
          experience_level: formData.experienceLevel || null,
          equipment_familiarity: formData.equipmentFamiliarity || null,
          preferred_time_slots: formData.preferredTimeSlots || null,
          weekly_hours_estimate: formData.weeklyHoursEstimate ? parseInt(formData.weeklyHoursEstimate) : null,
          long_term_commitment: formData.longTermCommitment,
          about_yourself: formData.aboutYourself,
          why_join_studio: formData.whyJoinStudio,
          previous_studio_experience: formData.previousStudioExperience || null,
          how_did_you_hear: formData.howDidYouHear || null,
          referral_name: formData.referralName || null,
          community_contribution: formData.communityContribution || null,
          collaboration_interest: formData.collaborationInterest,
          special_requirements: formData.specialRequirements || null,
          additional_comments: formData.additionalComments || null,
          status: 'pending'
        })
        .select()

      if (error) {
        console.error('Application submission error:', error)
        toast.error("Failed to submit application. Please try again.")
      } else {
        toast.success("Application submitted successfully! We'll review it and get back to you soon.")
        router.push("/apply") // Refresh to show status
      }
    } catch (error) {
      console.error('Application submission error:', error)
      toast.error("Failed to submit application. Please try again.")
    }
    
    setIsLoading(false)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground/80">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age" className="text-foreground/80">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="25"
                  min="16"
                  max="100"
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city" className="text-foreground/80">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Your city"
                  required
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone" className="text-foreground/80">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Social Media & Online Presence</h2>
              <p className="text-muted-foreground">Help us understand your creative presence</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagramHandle" className="text-foreground/80">Instagram Handle</Label>
                <Input
                  id="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                  placeholder="@yourusername"
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitterHandle" className="text-foreground/80">Twitter/X Handle</Label>
                <Input
                  id="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                  placeholder="@yourusername"
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedinProfile" className="text-foreground/80">LinkedIn Profile</Label>
                <Input
                  id="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  placeholder="linkedin.com/in/yourprofile"
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personalWebsite" className="text-foreground/80">Personal Website/Portfolio</Label>
                <Input
                  id="personalWebsite"
                  value={formData.personalWebsite}
                  onChange={(e) => handleInputChange('personalWebsite', e.target.value)}
                  placeholder="yourwebsite.com"
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="otherSocials" className="text-foreground/80">Other Social Media / Platforms</Label>
                <Textarea
                  id="otherSocials"
                  value={formData.otherSocials}
                  onChange={(e) => handleInputChange('otherSocials', e.target.value)}
                  placeholder="TikTok, YouTube, Behance, GitHub, etc."
                  className="bg-black/50 border-border/50 text-foreground min-h-[80px]"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Professional Background</h2>
              <p className="text-muted-foreground">Tell us about your creative and professional journey</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profession" className="text-foreground/80">Current Profession/Field</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  placeholder="e.g., Graphic Designer, Photographer, Student, etc."
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentJob" className="text-foreground/80">Current Job/Position</Label>
                <Input
                  id="currentJob"
                  value={formData.currentJob}
                  onChange={(e) => handleInputChange('currentJob', e.target.value)}
                  placeholder="e.g., Senior Designer at XYZ Company"
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creativeBackground" className="text-foreground/80">Creative Background & Experience</Label>
                <Textarea
                  id="creativeBackground"
                  value={formData.creativeBackground}
                  onChange={(e) => handleInputChange('creativeBackground', e.target.value)}
                  placeholder="Describe your experience in creative fields, projects you've worked on, artistic skills, etc."
                  className="bg-black/50 border-border/50 text-foreground min-h-[120px]"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Studio Usage & Goals</h2>
              <p className="text-muted-foreground">How do you plan to use the creative space?</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studioUsagePurpose" className="text-foreground/80">What would you primarily use the studio for? *</Label>
                <Textarea
                  id="studioUsagePurpose"
                  value={formData.studioUsagePurpose}
                  onChange={(e) => handleInputChange('studioUsagePurpose', e.target.value)}
                  placeholder="e.g., Photography shoots, video production, product design, streaming, music production, etc."
                  required
                  className="bg-black/50 border-border/50 text-foreground min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creativeGoals" className="text-foreground/80">What are your creative goals for the next year?</Label>
                <Textarea
                  id="creativeGoals"
                  value={formData.creativeGoals}
                  onChange={(e) => handleInputChange('creativeGoals', e.target.value)}
                  placeholder="Describe your creative projects, aspirations, and what you hope to achieve"
                  className="bg-black/50 border-border/50 text-foreground min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel" className="text-foreground/80">Experience Level</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                    <SelectTrigger className="bg-black/50 border-border/50 text-foreground">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weeklyHoursEstimate" className="text-foreground/80">Expected Weekly Hours</Label>
                  <Select value={formData.weeklyHoursEstimate} onValueChange={(value) => handleInputChange('weeklyHoursEstimate', value)}>
                    <SelectTrigger className="bg-black/50 border-border/50 text-foreground">
                      <SelectValue placeholder="Hours per week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3 hours</SelectItem>
                      <SelectItem value="4-6">4-6 hours</SelectItem>
                      <SelectItem value="7-10">7-10 hours</SelectItem>
                      <SelectItem value="11-15">11-15 hours</SelectItem>
                      <SelectItem value="16+">16+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="equipmentFamiliarity" className="text-foreground/80">Equipment & Software Familiarity</Label>
                <Textarea
                  id="equipmentFamiliarity"
                  value={formData.equipmentFamiliarity}
                  onChange={(e) => handleInputChange('equipmentFamiliarity', e.target.value)}
                  placeholder="List equipment and software you're familiar with (cameras, lighting, audio equipment, editing software, etc.)"
                  className="bg-black/50 border-border/50 text-foreground min-h-[80px]"
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">About You & Motivation</h2>
              <p className="text-muted-foreground">Help us get to know you better</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aboutYourself" className="text-foreground/80">Tell us about yourself *</Label>
                <Textarea
                  id="aboutYourself"
                  value={formData.aboutYourself}
                  onChange={(e) => handleInputChange('aboutYourself', e.target.value)}
                  placeholder="Share your personality, interests, creative passion, what drives you..."
                  required
                  className="bg-black/50 border-border/50 text-foreground min-h-[120px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whyJoinStudio" className="text-foreground/80">Why do you want to join ICU Creative Studio 1? *</Label>
                <Textarea
                  id="whyJoinStudio"
                  value={formData.whyJoinStudio}
                  onChange={(e) => handleInputChange('whyJoinStudio', e.target.value)}
                  placeholder="What attracts you to our community? How would membership benefit your creative journey?"
                  required
                  className="bg-black/50 border-border/50 text-foreground min-h-[120px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="previousStudioExperience" className="text-foreground/80">Previous Studio Experience</Label>
                <Textarea
                  id="previousStudioExperience"
                  value={formData.previousStudioExperience}
                  onChange={(e) => handleInputChange('previousStudioExperience', e.target.value)}
                  placeholder="Have you worked in creative studios before? What was your experience?"
                  className="bg-black/50 border-border/50 text-foreground min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="communityContribution" className="text-foreground/80">How would you contribute to our community?</Label>
                <Textarea
                  id="communityContribution"
                  value={formData.communityContribution}
                  onChange={(e) => handleInputChange('communityContribution', e.target.value)}
                  placeholder="What skills, knowledge, or positive energy would you bring to our creative community?"
                  className="bg-black/50 border-border/50 text-foreground min-h-[80px]"
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Final Details</h2>
              <p className="text-muted-foreground">Last few questions to complete your application</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="howDidYouHear" className="text-foreground/80">How did you hear about ICU Creative Studio 1?</Label>
                <Select value={formData.howDidYouHear} onValueChange={(value) => handleInputChange('howDidYouHear', value)}>
                  <SelectTrigger className="bg-black/50 border-border/50 text-foreground">
                    <SelectValue placeholder="Select how you found us" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="friend_referral">Friend/Referral</SelectItem>
                    <SelectItem value="google_search">Google Search</SelectItem>
                    <SelectItem value="creative_community">Creative Community</SelectItem>
                    <SelectItem value="event">Event/Workshop</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referralName" className="text-foreground/80">Referral Name (if applicable)</Label>
                <Input
                  id="referralName"
                  value={formData.referralName}
                  onChange={(e) => handleInputChange('referralName', e.target.value)}
                  placeholder="Name of person who referred you"
                  className="bg-black/50 border-border/50 text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredTimeSlots" className="text-foreground/80">Preferred Time Slots</Label>
                <Select value={formData.preferredTimeSlots} onValueChange={(value) => handleInputChange('preferredTimeSlots', value)}>
                  <SelectTrigger className="bg-black/50 border-border/50 text-foreground">
                    <SelectValue placeholder="When would you typically use the studio?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning_weekdays">Morning Weekdays (9am-12pm)</SelectItem>
                    <SelectItem value="afternoon_weekdays">Afternoon Weekdays (12pm-6pm)</SelectItem>
                    <SelectItem value="evening_weekdays">Evening Weekdays (6pm-10pm)</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="longTermCommitment"
                  checked={formData.longTermCommitment}
                  onChange={(e) => handleInputChange('longTermCommitment', e.target.checked)}
                  className="rounded border-border/50 bg-black/50 text-primary focus:ring-primary"
                />
                <Label htmlFor="longTermCommitment" className="text-foreground/80">
                  I'm interested in a long-term membership (6+ months)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="collaborationInterest"
                  checked={formData.collaborationInterest}
                  onChange={(e) => handleInputChange('collaborationInterest', e.target.checked)}
                  className="rounded border-border/50 bg-black/50 text-primary focus:ring-primary"
                />
                <Label htmlFor="collaborationInterest" className="text-foreground/80">
                  I'm interested in collaborating with other members
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialRequirements" className="text-foreground/80">Special Requirements or Accessibility Needs</Label>
                <Textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  placeholder="Any special equipment needs, accessibility requirements, or accommodations"
                  className="bg-black/50 border-border/50 text-foreground min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalComments" className="text-foreground/80">Additional Comments</Label>
                <Textarea
                  id="additionalComments"
                  value={formData.additionalComments}
                  onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                  placeholder="Anything else you'd like us to know?"
                  className="bg-black/50 border-border/50 text-foreground min-h-[80px]"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div
            className="bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-400 p-4 rounded-lg shadow-md flex items-center justify-center border border-slate-300/50"
            style={{
              background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 25%, #94a3b8 50%, #64748b 75%, #475569 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-5xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 tracking-tighter drop-shadow-sm">
              ICU
            </span>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-300 mb-4">
          Creative Studio{" "}
          <span className="text-5xl font-black text-amber-500 drop-shadow-lg"
                style={{ 
                  textShadow: '0 0 12px rgba(245, 158, 11, 0.8), 0 0 24px rgba(245, 158, 11, 0.6), 0 0 36px rgba(245, 158, 11, 0.4)' 
                }}>
            1
          </span>
        </h1>
        
        <p className="text-xl text-zinc-300 mb-8">Application for Membership</p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-border/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-black/80 backdrop-blur-sm border border-border/30 rounded-xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit}>
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="bg-black/50 border-border/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-primary to-accent"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <SubmitButton isLoading={isLoading} />
            )}
          </div>
        </form>
      </div>
      
      {/* Info Box */}
      <div className="mt-8 bg-primary/10 border border-primary/30 rounded-lg p-6">
        <h3 className="font-bold text-primary mb-2">Application Process</h3>
        <ul className="text-sm text-foreground/80 space-y-1">
          <li>• Applications are reviewed within 5-7 business days</li>
          <li>• We may contact you for additional information or a brief interview</li>
          <li>• Approved members will receive onboarding information via email</li>
          <li>• Questions? Contact us at studio@icu.space</li>
        </ul>
      </div>
    </div>
  )
}
