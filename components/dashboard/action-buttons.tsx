"use client"

import { useState } from "react"
import { supabase as supabaseClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, AlertTriangle, MessageCircle, BookOpen, Scroll, AlertOctagon, Flag, Upload, Send, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function ActionButtons() {
  const [studioRulesOpen, setStudioRulesOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [sessionCompleteOpen, setSessionCompleteOpen] = useState(false)
  const [reportForm, setReportForm] = useState({
    subject: "",
    description: "",
    contactInfo: "",
    reportType: "general",
    priority: "medium"
  })
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [isSubmittingSessionComplete, setIsSubmittingSessionComplete] = useState(false)
  
  const supabase = supabaseClient
  
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingReport(true)
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error("Please log in to submit a report")
        setIsSubmittingReport(false)
        return
      }

      // Get member ID
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (memberError || !member) {
        toast.error("User profile not found")
        setIsSubmittingReport(false)
        return
      }

      // Submit report to database
      const { data, error } = await supabase
        .from('reports')
        .insert({
          member_id: member.id,
          subject: reportForm.subject,
          description: reportForm.description,
          contact_info: reportForm.contactInfo || null,
          report_type: reportForm.reportType,
          priority: reportForm.priority,
          status: 'pending'
        })
        .select()

      if (error) {
        console.error('Report submission error:', error)
        toast.error("Failed to submit report. Please try again.")
      } else {
        toast.success("Report submitted successfully! We'll review it shortly.")
        setReportOpen(false)
        setReportForm({
          subject: "",
          description: "",
          contactInfo: "",
          reportType: "general",
          priority: "medium"
        })
      }
    } catch (error) {
      console.error('Report submission error:', error)
      toast.error("Failed to submit report. Please try again.")
    }
    
    setIsSubmittingReport(false)
  }

  const handleSessionComplete = async () => {
    setIsSubmittingSessionComplete(true)
    
    // Simulate session complete submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success("Session complete photos submitted! Thank you for keeping the studio clean! 🌟")
    setSessionCompleteOpen(false)
    setIsSubmittingSessionComplete(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      <div className="bg-black/40 backdrop-blur-md border border-border/30 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-2xl shadow-black/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Studio Rules Button */}
          <Sheet open={studioRulesOpen} onOpenChange={setStudioRulesOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-black/50 border-primary/50 text-primary hover:bg-primary/10 hover:text-accent transition-all duration-300 font-semibold px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px] w-full"
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="truncate">Studio Rules</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-black/95 border-border/50 backdrop-blur-sm h-[90vh] sm:h-[85vh] overflow-y-auto">
              <SheetHeader className="mb-4 sm:mb-6 px-2 sm:px-0">
                <SheetTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-2 justify-center sm:justify-start">
                  <Scroll className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                  <span className="text-center sm:text-left">Studio Rules & Guidelines</span>
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 sm:space-y-6 text-left px-2 sm:px-4 md:px-6">
                {/* Entry & Exit Protocols */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 sm:mb-4 flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    🚪 Entry & Exit Protocols (MANDATORY)
                  </h3>
                  <div className="space-y-3 sm:space-y-4 text-foreground/90">
                    <div className="bg-blue-500/10 border-l-4 border-blue-400 pl-3 sm:pl-4 py-2">
                      <p className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">Upon Arrival:</p>
                      <ul className="space-y-1 text-xs sm:text-sm">
                        <li>• <span className="font-medium">Remove shoes immediately</span> - use provided studio slides ONLY</li>
                        <li>• <span className="font-medium">Inspect the studio thoroughly</span> - check all equipment, surfaces, cleanliness, and supplies</li>
                        <li>• <span className="font-medium">Check for supplies</span> - ensure wet wipes, trash bags, and slides are available</li>
                        <li>• <span className="font-medium text-red-400">If ANY issues found → FILE A REPORT IMMEDIATELY</span></li>
                        <li>• <span className="text-blue-400 font-medium">🔘 Use "File a Report" button at top of dashboard RIGHT AWAY</span></li>
                        <li>• <span className="text-amber-400">📸 Photo taking is built into the report form</span> - no separate photo step needed</li>
                        <li>• <span className="text-red-300 font-medium">DO NOT start your session until you've reported any issues!</span></li>
                      </ul>
                    </div>
                    <div className="bg-green-500/10 border-l-4 border-green-400 pl-3 sm:pl-4 py-2">
                      <p className="font-semibold text-green-300 mb-2 text-sm sm:text-base">Before Leaving:</p>
                      <ul className="space-y-1 text-xs sm:text-sm">
                        <li>• <span className="font-medium">Clean ALL surfaces</span> - wipe tables, equipment, and high-touch areas with wet wipes</li>
                        <li>• <span className="font-medium">Handle trash properly:</span></li>
                        <li className="ml-4">→ <span className="text-yellow-300">Dry/non-food trash</span> - can go in studio trash bin</li>
                        <li className="ml-4">→ <span className="text-orange-300">Food/drink containers</span> - MUST take out with you after session</li>
                        <li>• <span className="font-medium">Return equipment to original positions</span></li>
                        <li>• <span className="text-green-400 font-medium">📸 Use "Session Complete" button to document clean studio</span></li>
                        <li>• <span className="font-medium">Change back to your shoes</span> - leave slides in studio</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-500/10 border border-amber-400/30 rounded p-3 mt-4">
                      <p className="font-semibold text-amber-300 mb-2">📋 IMPORTANT - Reporting Process:</p>
                      <ul className="space-y-1 text-xs text-foreground/90">
                        <li>• <span className="font-medium text-red-200">STEP 1:</span> Find issues? → Click "File a Report" button immediately</li>
                        <li>• <span className="font-medium text-blue-200">STEP 2:</span> Report form will guide you through photo taking (website camera only)</li>
                        <li>• <span className="font-medium text-green-200">STEP 3:</span> After cleaning → Use "Session Complete" button for final photos</li>
                        <li>• <span className="text-amber-200">No external photo uploads allowed - everything is built into the website</span></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Footwear Policy */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <Scroll className="h-5 w-5" />
                    👟 Strict No-Shoes Policy
                  </h3>
                  <div className="space-y-3 text-foreground/90">
                    <div className="bg-purple-500/10 border border-purple-400/30 rounded p-3">
                      <p className="font-semibold text-purple-300 mb-2">🚫 PROHIBITED:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• Wearing outdoor shoes inside the studio</li>
                        <li>• Taking studio slides outside</li>
                        <li>• Walking barefoot (hygiene concerns)</li>
                        <li>• Using dirty or wet footwear</li>
                      </ul>
                    </div>
                    <div className="bg-green-500/10 border border-green-400/30 rounded p-3">
                      <p className="font-semibold text-green-300 mb-2">✅ REQUIRED:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• Use provided studio slides immediately upon entry</li>
                        <li>• Keep slides clean and inside studio at all times</li>
                        <li>• Report damaged or missing slides immediately</li>
                        <li>• Clean feet before using slides if necessary</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Booking & Cancellation Rules */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    📅 Booking & Cancellation Rules
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-primary mb-2">Booking Guidelines:</p>
                      <ul className="space-y-1 text-sm text-foreground/90">
                        <li>• Reservations up to 2 weeks in advance</li>
                        <li>• Maximum 12 weekend slots per week (6 hours total)</li>
                        <li>• Be punctual - sessions start/end on time</li>
                        <li>• Late arrivals forfeit unused time</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-accent mb-2">Cancellation Policy:</p>
                      <ul className="space-y-1 text-sm text-foreground/90">
                        <li>• ≥24 hours: 100% point refund</li>
                        <li>• &lt;24 hours: 50% point refund</li>
                        <li>• No-shows: Full point loss</li>
                        <li>• Emergency exceptions considered</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Equipment & Studio Conduct */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                    <AlertOctagon className="h-5 w-5" />
                    🎛️ Equipment & Studio Conduct
                  </h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-orange-500/10 border border-orange-400/30 rounded p-3">
                        <p className="font-semibold text-orange-300 mb-2">Equipment Care:</p>
                        <ul className="space-y-1 text-sm text-foreground/90">
                          <li>• Handle all equipment with care</li>
                          <li>• Report damage immediately</li>
                          <li>• No food/drinks near electronics</li>
                          <li>• Return items to designated spots</li>
                          <li>• Ask if unsure about operation</li>
                        </ul>
                      </div>
                      <div className="bg-red-500/10 border border-red-400/30 rounded p-3">
                        <p className="font-semibold text-red-300 mb-2">Studio Etiquette:</p>
                        <ul className="space-y-1 text-sm text-foreground/90">
                          <li>• Keep noise levels reasonable</li>
                          <li>• Respect other members' time</li>
                          <li>• No smoking/vaping anywhere</li>
                          <li>• Personal hygiene expected</li>
                          <li>• Professional behavior always</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cleanliness & Maintenance */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    🧽 Cleanliness & Maintenance Standards
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-green-500/15 border border-green-400/40 rounded-lg p-4">
                      <p className="font-bold text-green-300 mb-3 text-center">🌟 YOUR RESPONSIBILITY = EVERYONE'S BENEFIT</p>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-green-200 mb-2">🧽 Surface Cleaning:</p>
                          <ul className="space-y-1 text-foreground/90">
                            <li>• Wipe ALL tables & surfaces</li>
                            <li>• Use provided wet wipes only</li>
                            <li>• Clean equipment after use</li>
                            <li>• Sanitize high-touch areas</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-green-200 mb-2">🗑️ Waste Management:</p>
                          <ul className="space-y-1 text-foreground/90">
                            <li>• Remove ALL personal trash</li>
                            <li>• Use provided trash bags</li>
                            <li>• Tie bags before disposal</li>
                            <li>• Don't leave anything behind</li>
                          </ul>
                        </div>                        <div>
                          <p className="font-semibold text-green-200 mb-2">📸 Documentation:</p>
                          <ul className="space-y-1 text-foreground/90">
                            <li>• Issues found → Use "File a Report" button (photos built-in)</li>
                            <li>• After cleaning → Use "Session Complete" button</li>
                            <li>• All photos taken through website camera only</li>
                            <li>• No external photo uploads allowed</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication & Reporting */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    📢 Communication & Reporting
                  </h3>
                  
                  {/* Positive Messaging Section */}
                  <div className="bg-green-500/15 border border-green-400/40 rounded-lg p-4 mb-4">
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-2">🌟</div>
                      <p className="font-bold text-green-300 text-lg">DON'T WORRY - WE REWARD HONESTY!</p>
                    </div>
                    <div className="text-sm text-foreground/90 space-y-2">
                      <p className="text-center font-medium text-green-200">
                        Accidents happen, equipment breaks, things get messy - <span className="text-green-400 font-bold">that's totally normal!</span>
                      </p>
                      <div className="bg-green-500/20 border border-green-400/50 rounded p-3 mt-3">
                        <p className="font-semibold text-green-300 mb-2">🎁 BONUS POINTS for Honest Reporting:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• <span className="font-medium">+2 points</span> for reporting equipment issues you discover</li>
                          <li>• <span className="font-medium">+1 point</span> for proactive cleanliness/maintenance reports</li>
                          <li>• <span className="font-medium">+3 points</span> for detailed, helpful incident reports</li>
                          <li>• <span className="font-medium">+1 point</span> for constructive suggestions/improvements</li>
                        </ul>
                      </div>
                      <p className="text-center text-green-200 font-medium">
                        Your honesty helps everyone and builds our amazing community! 💚
                      </p>
                    </div>
                  </div>                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-yellow-500/10 border border-yellow-400/30 rounded p-3">
                      <p className="font-semibold text-yellow-300 mb-2">🚨 Always Report (No Blame!):</p>
                      <ul className="space-y-1 text-sm text-foreground/90">
                        <li>• Broken or damaged equipment (even if you broke it!)</li>
                        <li>• Spills or stains you didn't cause</li>
                        <li>• Missing supplies (wipes, bags, slides)</li>
                        <li>• Safety hazards or concerns</li>
                        <li>• Anything that could be blamed on you</li>
                        <li>• <span className="text-red-300 font-medium">Report IMMEDIATELY upon arrival</span> - use website camera & dashboard button</li>
                      </ul>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-400/30 rounded p-3">
                      <p className="font-semibold text-amber-300 mb-2">📞 How to Report:</p>
                      <ul className="space-y-1 text-sm text-foreground/90">
                        <li>• <span className="font-bold text-blue-300">Use "File a Report" button</span> at top of dashboard</li>
                        <li>• Take photos with website camera only (no uploads)</li>
                        <li>• Report immediately when issues are discovered</li>
                        <li>• Contact kzhtin directly for urgent matters</li>
                        <li>• Be specific about time and location</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Response Times */}
                <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    ⏰ Response & Resolution Times
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-500/10 border border-red-400/30 rounded p-3 text-center">
                      <div className="text-2xl mb-2">🚨</div>
                      <p className="font-bold text-red-300">URGENT</p>
                      <p className="text-xs text-foreground/90">Safety/Emergency</p>
                      <p className="font-semibold text-red-400">Same Day</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-400/30 rounded p-3 text-center">
                      <div className="text-2xl mb-2">🔧</div>
                      <p className="font-bold text-yellow-300">EQUIPMENT</p>
                      <p className="text-xs text-foreground/90">Malfunctions/Repairs</p>
                      <p className="font-semibold text-yellow-400">24 Hours</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-400/30 rounded p-3 text-center">
                      <div className="text-2xl mb-2">💬</div>
                      <p className="font-bold text-blue-300">GENERAL</p>
                      <p className="text-xs text-foreground/90">Questions/Feedback</p>
                      <p className="font-semibold text-blue-400">48 Hours</p>
                    </div>
                  </div>
                </div>

                {/* Community Guidelines */}
                <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-violet-400 mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    🤝 Community Guidelines
                  </h3>
                  
                  {/* Community Philosophy */}
                  <div className="bg-violet-500/15 border border-violet-400/40 rounded-lg p-4 mb-4">
                    <p className="text-center font-bold text-violet-300 mb-3 text-lg">
                      ✨ WE'RE ALL IN THIS TOGETHER ✨
                    </p>
                    <div className="bg-violet-500/20 border border-violet-400/50 rounded p-3">
                      <p className="text-center text-sm text-foreground/90 mb-2">
                        <span className="font-semibold text-violet-200">Our Philosophy:</span> Things break, spills happen, mistakes occur - 
                        <span className="font-bold text-green-400"> that's life!</span> What matters is honest communication and looking out for each other.
                      </p>
                      <p className="text-center text-xs text-violet-300 font-medium">
                        We reward transparency, understanding, and community spirit over perfection! 💜
                      </p>
                    </div>
                  </div>

                  <div className="bg-violet-500/10 border border-violet-400/30 rounded-lg p-4">
                    <p className="text-center font-semibold text-violet-300 mb-3">
                      🌟 Creating an Amazing Experience for Everyone 🌟
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-foreground/90">
                      <ul className="space-y-1">
                        <li>• <span className="font-medium">Be honest</span> - mistakes are learning opportunities</li>
                        <li>• <span className="font-medium">Be accountable</span> - own your actions with pride</li>
                        <li>• <span className="font-medium">Be proactive</span> - report issues to protect everyone</li>
                        <li>• <span className="font-medium">Be collaborative</span> - share knowledge and help others</li>
                      </ul>
                      <ul className="space-y-1">
                        <li>• <span className="font-medium">Stay positive</span> - maintain a creative, inspiring environment</li>
                        <li>• <span className="font-medium">Stay clean</span> - your care shows respect for all</li>
                        <li>• <span className="font-medium">Stay safe</span> - look out for everyone's wellbeing</li>
                        <li>• <span className="font-medium">Stay connected</span> - communicate openly and kindly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* File a Report Button */}
          <Sheet open={reportOpen} onOpenChange={setReportOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-black/50 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400/70 transition-all duration-300 font-semibold px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px] w-full"
              >
                <Flag className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="truncate">File a Report</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-black/95 border-border/50 backdrop-blur-sm h-[95vh] sm:h-[90vh] overflow-y-auto">
              <SheetHeader className="mb-4 sm:mb-6 px-2 sm:px-0">
                <SheetTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 flex items-center gap-2 justify-center sm:justify-start">
                  <AlertOctagon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 flex-shrink-0" />
                  <span className="text-center sm:text-left">File a Report</span>
                </SheetTitle>
              </SheetHeader>
              
              <form onSubmit={handleReportSubmit} className="space-y-4 sm:space-y-6 max-w-2xl mx-auto px-2 sm:px-4">
                {/* Encouraging Header */}
                <div className="bg-green-500/15 border border-green-400/40 rounded-lg p-4">
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-2">🎁</div>
                    <p className="font-bold text-green-300">Thank You for Helping Our Community!</p>
                  </div>
                  <div className="text-sm text-foreground/90 space-y-2">
                    <p className="text-center">
                      <span className="font-medium text-green-200">Don't worry about reporting issues - accidents happen!</span> 
                      We actually <span className="font-bold text-green-400">reward honest reporting</span> with bonus points.
                    </p>
                    <div className="bg-green-500/20 border border-green-400/50 rounded p-2">
                      <p className="text-xs text-center font-medium text-green-300">
                        🌟 Earn <span className="font-bold">+1 to +3 bonus points</span> for helpful reports! 🌟
                      </p>
                    </div>
                  </div>
                </div>                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground font-semibold text-sm sm:text-base">
                    Report Subject *
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Brief summary of the issue..."
                    value={reportForm.subject}
                    onChange={(e) => setReportForm(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="bg-black/50 border-border/50 text-foreground placeholder:text-foreground/50 min-h-[44px] text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportType" className="text-foreground font-semibold text-sm sm:text-base">
                      Report Type *
                    </Label>
                    <Select 
                      value={reportForm.reportType} 
                      onValueChange={(value) => setReportForm(prev => ({ ...prev, reportType: value }))}
                    >
                      <SelectTrigger className="bg-black/50 border-border/50 text-foreground min-h-[44px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 border-border/50">
                        <SelectItem value="general">General Issue</SelectItem>
                        <SelectItem value="cleanliness">🧹 Cleanliness (+1 pt)</SelectItem>
                        <SelectItem value="equipment">🔧 Equipment (+2 pts)</SelectItem>
                        <SelectItem value="supply">📦 Missing Supplies (+1 pt)</SelectItem>
                        <SelectItem value="damage">⚠️ Damage (+3 pts)</SelectItem>
                        <SelectItem value="safety">🚨 Safety Concern (+2 pts)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-foreground font-semibold text-sm sm:text-base">
                      Priority *
                    </Label>
                    <Select 
                      value={reportForm.priority} 
                      onValueChange={(value) => setReportForm(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="bg-black/50 border-border/50 text-foreground min-h-[44px]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 border-border/50">
                        <SelectItem value="low">🟢 Low - Minor issue</SelectItem>
                        <SelectItem value="medium">🟡 Medium - Standard issue</SelectItem>
                        <SelectItem value="high">🟠 High - Needs attention</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent - Safety/blocking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground font-semibold text-sm sm:text-base">
                    Description * <span className="text-green-400 text-xs sm:text-sm font-normal">(The more details, the more helpful!)</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please share what happened - be honest and detailed! If you accidentally broke something or made a mess, just tell us what happened. We're here to help, not to blame. Include when it occurred, where in the studio, and any other relevant details..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                    className="bg-black/50 border-border/50 text-foreground placeholder:text-foreground/50 resize-none text-sm sm:text-base min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo" className="text-foreground font-semibold text-sm sm:text-base">
                    Contact Information (Optional) <span className="text-blue-400 text-xs sm:text-sm font-normal">- In case we want to thank you personally!</span>
                  </Label>
                  <Input
                    id="contactInfo"
                    type="text"
                    placeholder="Your preferred contact method if follow-up is needed (we promise it's only for good things!)"
                    value={reportForm.contactInfo}
                    onChange={(e) => setReportForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                    className="bg-black/50 border-border/50 text-foreground placeholder:text-foreground/50 min-h-[44px] text-sm sm:text-base"
                  />
                </div>                <div className="space-y-2">
                  <Label className="text-foreground font-semibold text-sm sm:text-base">
                    Take Photos (Optional) <span className="text-purple-400 text-xs sm:text-sm font-normal">- Pictures really help us understand!</span>
                  </Label>
                  
                  {/* Camera Interface Placeholder */}
                  <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-3 sm:p-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl mb-2">📸</div>
                      <p className="font-medium text-slate-300 mb-2 text-sm sm:text-base">Website Camera</p>
                      <div className="bg-black/50 border border-border/50 rounded-lg h-24 sm:h-32 flex items-center justify-center">
                        <p className="text-foreground/60 text-xs sm:text-sm">Camera interface will be implemented here</p>
                      </div>
                      <p className="text-xs text-foreground/60 mt-2">
                        Use this camera to take photos - no external uploads allowed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-foreground/90">
                      <p className="font-semibold text-blue-400 mb-1">Remember:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• You're helping make the studio better for everyone!</li>
                        <li>• Honest reporting earns you bonus points</li>
                        <li>• We understand that accidents happen - no judgment!</li>
                        <li>• For urgent safety issues, contact kzhtin directly</li>
                        <li>• Reports are reviewed within 24-48 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReportOpen(false)}
                    className="flex-1 bg-black/50 border-border/50 text-foreground hover:bg-border/20 min-h-[44px] text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!reportForm.subject || !reportForm.description || isSubmittingReport}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
                  >
                    {isSubmittingReport ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="hidden sm:inline">Submitting Report...</span>
                        <span className="sm:hidden">Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Send className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="hidden sm:inline">Submit Report & Earn Points! 🎁</span>
                        <span className="sm:hidden">Submit Report 🎁</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>            </SheetContent>
          </Sheet>

          {/* Session Complete Button */}
          <Sheet open={sessionCompleteOpen} onOpenChange={setSessionCompleteOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-black/50 border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 hover:border-green-400/70 transition-all duration-300 font-semibold px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px] w-full"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="truncate">Session Complete</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-black/95 border-border/50 backdrop-blur-sm h-[80vh] sm:h-[60vh] overflow-y-auto">
              <SheetHeader className="mb-4 sm:mb-6 px-2 sm:px-0">
                <SheetTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0" />
                  <span className="text-center sm:text-left">Session Complete - Document Clean Studio</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto px-2 sm:px-4">
                {/* Instructions Header */}
                <div className="bg-green-500/15 border border-green-400/40 rounded-lg p-4">
                  <div className="text-center mb-3">
                    <div className="text-2xl mb-2">🧽</div>
                    <p className="font-bold text-green-300">Great Job Cleaning the Studio!</p>
                  </div>
                  <div className="text-sm text-foreground/90 space-y-2">
                    <p className="text-center">
                      Now please take photos to document that you've left the studio clean for the next person.
                    </p>
                    <div className="bg-green-500/20 border border-green-400/50 rounded p-3">
                      <p className="text-xs text-center font-medium text-green-300">
                        📸 Use the website camera below to capture the clean studio state
                      </p>
                    </div>
                  </div>
                </div>

                {/* Camera Interface Placeholder */}
                <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-300 mb-3 sm:mb-4 text-center">
                    📷 Studio Camera
                  </h3>
                  <div className="bg-black/50 border border-border/50 rounded-lg h-48 sm:h-64 flex items-center justify-center">
                    <div className="text-center text-foreground/60">
                      <div className="text-3xl sm:text-4xl mb-2">📸</div>
                      <p className="font-medium text-sm sm:text-base">Camera interface will be implemented here</p>
                      <p className="text-xs sm:text-sm">Take photos of all cleaned areas</p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
                  <h3 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">📋 What to Photograph:</h3>
                  <ul className="space-y-1 text-xs sm:text-sm text-foreground/90">
                    <li>• All tables and work surfaces (showing they're clean)</li>
                    <li>• Equipment in proper positions</li>
                    <li>• Floor area (showing no trash or spills)</li>
                    <li>• Overall studio condition</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSessionCompleteOpen(false)}
                    className="flex-1 bg-black/50 border-border/50 text-foreground hover:bg-border/20 min-h-[44px] text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSessionComplete}
                    disabled={isSubmittingSessionComplete}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
                  >
                    {isSubmittingSessionComplete ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="hidden sm:inline">Submitting Photos...</span>
                        <span className="sm:hidden">Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="hidden sm:inline">Submit Clean Studio Photos 📸</span>
                        <span className="sm:hidden">Submit Photos 📸</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Reserve Your Time Button - Scrolls to time picker */}
          <Button 
            variant="default"
            size="lg"
            onClick={() => {
              const timePicker = document.getElementById('time-slot-picker');
              if (timePicker) {
                timePicker.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] w-full text-sm sm:text-base"
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            <span className="truncate">Reserve Your Time</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
