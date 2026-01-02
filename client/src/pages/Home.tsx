import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, ChevronRight, Clock, DollarSign, LayoutDashboard, LineChart, PieChart, Settings2, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkshop } from "@/contexts/WorkshopContext";
import { painPointsAPI, useCasesAPI } from "@/lib/api";
import { PDFReportComponent } from "@/components/PDFReport";
import { QuadrantPrioritization } from "@/components/QuadrantPrioritization";
import { BacklogPrioritization } from "@/components/BacklogPrioritization";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ThemeChart } from "@/components/ThemeChart";
import { AUDREY_PAIN_POINTS, BASELINE_ROI_PROJECTIONS } from "@/audrey_use_cases_with_roi";

// --- Types ---

type Step =
  | "welcome"
  | "identify"
  | "categorize"
  | "prioritize"
  | "deep-dive"
  | "roi"
  | "backlog"
  | "next-steps";

type PainPoint = {
  id: string;
  category: "Time & Efficiency" | "Accuracy & Risk" | "Intelligence & Insights" | "Revenue & Growth";
  question: string;
  response: string;
  theme?: "Pricing" | "Sales" | "RevOps" | "Customer" | "Competitive";
  priority?: "H1" | "H2" | "TBD" | "Deprioritize";
  quadrant?: "Quick Wins" | "Major Projects" | "Fill-in" | "Money Pit";
};

type UseCase = {
  id: string;
  painPointId: string;
  name: string;
  category: string;
  problem: string;
  agentRole: string;
  dataRequired: string;
  integration: string;
  revenueImpact: string;
  costSavings: string;
  riskReduction: string;
  timeToValue: string;
  impact: "High" | "Medium" | "Low";
  effort: "High" | "Medium" | "Low";
  priority: string;
  agentCount: string;
  dataCloud: string;
  otherLicenses: string[];
  timeline: string;
  calculatedRevenue: number;
  calculatedSavings: number;
  calculatedEfficiency: number;
  // Add index signature to allow dynamic property access
  [key: string]: any;
};

// --- Initial Data ---

const INITIAL_PAIN_POINTS: PainPoint[] = AUDREY_PAIN_POINTS;

const OLD_INITIAL_PAIN_POINTS: PainPoint[] = [
  // Extracted from SalesforceSalesOrderTicketHandlingProcess1.docx
  {
    id: "pp1",
    category: "Time & Efficiency",
    question: "Where do you spend time on work that should be automated?",
    response: "Sales Ops manually reviews every order (1-2 hours per order) to compare contract details against order forms.",
    theme: "RevOps"
  },
  {
    id: "pp2",
    category: "Accuracy & Risk",
    question: "Where do pricing errors happen most frequently?",
    response: "Manual verification of Start Dates, OTCs, SaaS tiering, and MMC tiering leads to billing errors.",
    theme: "Pricing"
  },
  {
    id: "pp3",
    category: "Time & Efficiency",
    question: "Which manual processes create bottlenecks?",
    response: "Finance approval routing is manual; rejections require full re-submission and re-review cycles.",
    theme: "RevOps"
  },

  // Extracted from SalesforceSalesSupportTicketHandlingProcess.docx
  {
    id: "pp4",
    category: "Intelligence & Insights",
    question: "Where do you lack visibility into user issues?",
    response: "Support agents must manually 'Login As' requester to reproduce issues, wasting time on context switching.",
    theme: "Customer"
  },
  {
    id: "pp5",
    category: "Time & Efficiency",
    question: "What takes your Sales Ops team the longest?",
    response: "Manually determining if support tickets are 'In Scope' (system error) or 'Out of Scope' (user error).",
    theme: "RevOps"
  },
  {
    id: "pp6",
    category: "Accuracy & Risk",
    question: "Where do you lack confidence due to incomplete data?",
    response: "Screenshots must be manually captured and attached to tickets to prove resolution to users.",
    theme: "RevOps"
  },

  // Extracted from 03-Deal-VXBSDealFlow.pdf
  {
    id: "pp7",
    category: "Revenue & Growth",
    question: "What would unlock 10% more revenue without headcount?",
    response: "Sellers without Salesforce access must complete manual forms, delaying opportunity creation by 3+ days.",
    theme: "Sales"
  },
  {
    id: "pp8",
    category: "Intelligence & Insights",
    question: "What data do you wish your sales team had in real-time?",
    response: "Manual eligibility checks for 'Collecting Fund Worldwide' and 'Restricted Countries' lists.",
    theme: "Sales"
  },
  {
    id: "pp9",
    category: "Accuracy & Risk",
    question: "Which deals require the most back-and-forth for approval?",
    response: "Manual NDA verification (Visa vs. Non-Visa members) delays Discovery stage entry by 1-2 weeks.",
    theme: "Sales"
  },
  {
    id: "pp10",
    category: "Revenue & Growth",
    question: "Which corridors are currently undermonetized?",
    response: "Complex service model selection (Correspondent vs. Sponsored vs. Treasury) requires manual battlecard review.",
    theme: "Pricing"
  },
  {
    id: "pp11",
    category: "Time & Efficiency",
    question: "Where are you leaving money on the table?",
    response: "Discovery Approval takes 3 days; Solution Approval takes another 3 days. Manual handoffs slow deal velocity.",
    theme: "Sales"
  },
  {
    id: "pp12",
    category: "Accuracy & Risk",
    question: "Where do compliance risks arise?",
    response: "Manual adverse media checks and sanctions screening for every new client onboarding.",
    theme: "RevOps"
  }
];

// --- Components ---

const Header = ({ onSave, isSaving, lastSaved, hasUnsavedChanges }: {
  onSave?: () => void,
  isSaving?: boolean,
  lastSaved?: Date | null,
  hasUnsavedChanges?: boolean
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (hasUnsavedChanges && onSave) {
      if (confirm('You have unsaved changes. Would you like to save before logging out?')) {
        onSave();
        setTimeout(logout, 1000); // Give time for save to complete
      } else {
        logout();
      }
    } else {
      logout();
    }
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 overflow-hidden flex items-center">
            <img
              src="/images/buyframe_logo_new.png"
              alt="BuyFrame"
              className="h-12 w-auto object-contain object-left -ml-2"
            />
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <img src="/images/salesforce_logo_new.png" alt="Salesforce" className="h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
            <span>Agentforce Discovery</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <img src="/images/visa_logo_new.png" alt="Visa" className="h-8 w-auto object-contain" />
          <div className="text-sm font-medium">Cross-Border Solutions</div>
          {user && (
            <div className="flex items-center gap-3">
              {/* Save Status */}
              {lastSaved && (
                <div className="text-xs text-muted-foreground">
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin">⏳</span> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      Saved {new Date(lastSaved).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
              {/* Save Button */}
              {onSave && (
                <Button
                  variant={hasUnsavedChanges ? "default" : "outline"}
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className={hasUnsavedChanges ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                >
                  {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Progress" : "Saved"}
                </Button>
              )}
              <div className="text-sm text-muted-foreground">{user.name}</div>
              <Button variant="outline" size="sm" onClick={() => {
                if (hasUnsavedChanges) {
                  if (confirm('You have unsaved changes. Are you sure you want to log out without saving?')) {
                    handleLogout();
                  }
                } else {
                  handleLogout();
                }
              }}>
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="fixed top-16 left-0 w-full h-1 bg-muted z-40">
      <motion.div
        className="h-full bg-[var(--color-buyframe-red)]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
};

// --- Main Page Component ---

export default function Home() {
  const { batchSaveUseCases, saveUseCaseState, savedUseCases, savedUseCaseStates, customPainPoints, saveCustomPainPoint, updateCustomPainPoint, deleteCustomPainPoint, isReady, sessionId,
    //anil
    // 🆕 NEW: Session management
    recentSessions,
    loadSession,
    createNewSession,
  } = useWorkshop();
  const [step, setStep] = useState<Step>("welcome");
  const [painPoints, setPainPoints] = useState<PainPoint[]>(INITIAL_PAIN_POINTS);
  const [recentPageIndex, setRecentPageIndex] = useState(0);

  // Debug: Log savedUseCaseStates when it changes
  useEffect(() => {
    if (savedUseCaseStates.size > 0) {
      console.log('📊 savedUseCaseStates loaded:', Array.from(savedUseCaseStates.entries()));
    }
  }, [savedUseCaseStates]);
  const [deletedPainPointIds, setDeletedPainPointIds] = useState<string[]>([]);
  const [painPointsLoaded, setPainPointsLoaded] = useState(false);
  const [hasAppliedSavedQuadrants, setHasAppliedSavedQuadrants] = useState(false);
  const [lastSavedStatesSize, setLastSavedStatesSize] = useState(0);
  const [lastSessionId, setLastSessionId] = useState<number | null>(null);

  // Load custom pain points from database when ready
  useEffect(() => {
    if (isReady && !painPointsLoaded) {
      console.log('✅ Initial load - setting up pain points');
      setPainPoints(INITIAL_PAIN_POINTS);
      setPainPointsLoaded(true);
    }
  }, [isReady, painPointsLoaded]);

  // Merge custom pain points from database whenever they change
  useEffect(() => {
    if (isReady && painPointsLoaded && customPainPoints.length > 0) {
      console.log('✅ Merging custom pain points from database:', customPainPoints.length);

      setPainPoints(currentPoints => {
        // Create a map of database pain points by their question (title)
        const dbPainPointsByQuestion = new Map();
        const dbPainPointsById = new Map();
        customPainPoints.forEach(p => {
          dbPainPointsByQuestion.set(p.question, p);
          dbPainPointsById.set(p.id, p);
        });

        // Merge: use database version if it exists (match by question or ID), otherwise use current version
        const mergedPoints = INITIAL_PAIN_POINTS.map(initialPoint => {
          const dbVersion = dbPainPointsByQuestion.get(initialPoint.question);
          if (dbVersion) {
            // Use database version but keep the original ID format
            console.log(`Replacing ${initialPoint.id} with database version:`, { theme: dbVersion.theme, priority: dbVersion.priority, quadrant: dbVersion.quadrant });
            return { ...dbVersion, id: initialPoint.id };
          }
          // Check if current points have modifications for this initial point
          const currentVersion = currentPoints.find(cp => cp.id === initialPoint.id);
          return currentVersion || initialPoint;
        });

        // Add any truly custom pain points that don't match any initial ones
        customPainPoints.forEach(p => {
          if (!INITIAL_PAIN_POINTS.find(ip => ip.question === p.question)) {
            // Check if this custom point is already in merged points by ID only
            const alreadyExists = mergedPoints.some(mp => mp.id === p.id);
            if (!alreadyExists) {
              console.log('Adding custom pain point:', p.id, p.question);
              mergedPoints.push(p);
            }
          }
        });

        console.log('Merged pain points:', mergedPoints.length, 'total');
        return mergedPoints;
      });
    }
  }, [isReady, painPointsLoaded, customPainPoints]);

  // Apply saved use-case quadrants/priorities back onto pain points (for persistence across sign-in)
  // Only run ONCE per session to avoid overwriting user drags
  useEffect(() => {
    // Detect discovery/session change and reset flags so saved quadrants re-apply
    if (sessionId && sessionId !== lastSessionId) {
      setLastSessionId(sessionId);
      setHasAppliedSavedQuadrants(false);
      setLastSavedStatesSize(0);
      return; // allow effect to re-run with reset flags
    }

    // Reset flag when savedUseCaseStates size changes (new session loaded)
    // This detects sign-out/sign-in because the Map gets recreated
    if (lastSavedStatesSize !== savedUseCaseStates.size && savedUseCaseStates.size > 0) {
      setLastSavedStatesSize(savedUseCaseStates.size);
      if (hasAppliedSavedQuadrants) {
        setHasAppliedSavedQuadrants(false);
        return; // Will re-run after flag is reset
      }
    }

    // Wait for data to be ready
    if (!isReady || !painPointsLoaded || savedUseCaseStates.size === 0) {
      return;
    }

    // Already applied - don't overwrite user changes
    if (hasAppliedSavedQuadrants) {
      return;
    }

    // Apply saved quadrants from database
    console.log('🔵 Applying saved quadrants. sessionId:', sessionId, 'savedUseCaseStates size:', savedUseCaseStates.size);
    setPainPoints(current => current.map(p => {
      const key = `uc-${sessionId}-${p.id}`;
      const savedState = savedUseCaseStates.get(key);
      console.log(`🔵 Pain point ${p.id}: key=${key}, savedState=`, savedState);
      if (!savedState) return p;

      const hasQuadrant = Object.prototype.hasOwnProperty.call(savedState, 'quadrant') && savedState.quadrant !== null;
      const hasPriority = Object.prototype.hasOwnProperty.call(savedState, 'priority') && savedState.priority !== null;

      console.log(`✅ Applying saved state to ${p.id}: quadrant=${savedState.quadrant}, priority=${savedState.priority}`);
      return {
        ...p,
        quadrant: hasQuadrant ? savedState.quadrant : p.quadrant,
        priority: hasPriority ? savedState.priority : p.priority,
      };
    }));

    setHasAppliedSavedQuadrants(true);
  }, [isReady, painPointsLoaded, painPoints.length, savedUseCaseStates.size, hasAppliedSavedQuadrants, lastSavedStatesSize, sessionId, lastSessionId]);

  /* Removed: Reset happens when customPainPoints.length changes naturally in the dependency array
  // Reset the flag when a new session is loaded (detected by customPainPoints change)
  useEffect(() => {
    setHasAppliedSavedQuadrants(false);
  }, [customPainPoints.length]);
  */


  const [useCases, setUseCases] = useState<UseCase[]>([]);
  //anil
  // 🆕 NEW: Track if we've already regenerated from saved state to avoid overwriting user edits
  const [hasRegenerated, setHasRegenerated] = useState(false);

  // Reset per-session UI state when switching discoveries
  useEffect(() => {
    if (!sessionId) return;
    setPainPoints(INITIAL_PAIN_POINTS);
    setPainPointsLoaded(true);
    setUseCases([]);
    setHasRegenerated(false);
    setHasAppliedSavedQuadrants(false);
    setLastSavedStatesSize(0);
    setDeletedPainPointIds([]);
  }, [sessionId]);

  // Reset hasRegenerated when savedUseCaseStates Map changes (new data loaded)
  // We track the Map reference itself, not just size, to detect page refreshes
  useEffect(() => {
    if (savedUseCaseStates.size > 0) {
      console.log('🔄 Saved states Map changed, resetting regeneration flag');
      setHasRegenerated(false);
    }
  }, [savedUseCaseStates]);

  const quadrantFromPriority = (priority?: string) => {
    if (!priority) return undefined;
    switch (priority) {
      case "H1":
        return "Quick Wins" as const;
      case "H2":
        return "Major Projects" as const;
      case "TBD":
        return "Fill-in" as const;
      case "Deprioritize":
        return "Money Pit" as const;
      default:
        return undefined;
    }
  };

  // 🆕 NEW: Regenerate use cases from saved data when savedUseCaseStates loads
  useEffect(() => {
    // Only regenerate once when savedUseCaseStates first loads
    // Don't regenerate again even if savedUseCaseStates updates (e.g., after save)
    if (isReady && painPointsLoaded && painPoints.length > 0 && savedUseCaseStates.size > 0 && !hasRegenerated) {
      console.log('🔄 Regenerating use cases from saved data...');
      console.log('📊 savedUseCaseStates size:', savedUseCaseStates.size);
      console.log('📊 Current useCases length:', useCases.length);

      const generateUseCaseFromPainPoint = (p: PainPoint) => {
        const baseline = BASELINE_ROI_PROJECTIONS[p.id as keyof typeof BASELINE_ROI_PROJECTIONS];
        const useCaseId = `uc-${sessionId}-${p.id}`;
        const savedState = savedUseCaseStates.get(useCaseId);
        const currentUseCase = useCases.find(uc => uc.id === useCaseId);

        // Check if saved priority is a backlog priority (P1, P2, P3)
        const isBacklogPriority = savedState?.priority && ['P1', 'P2', 'P3'].includes(savedState.priority);

        if (savedState) {
          console.log(`✅ Found saved data for ${useCaseId}:`, savedState);
        }

        const priority = isBacklogPriority
          ? "H1"
          : (savedState?.priority || currentUseCase?.priority || p.priority || "H1");

        // Do not infer quadrant from priority when backlog priorities are in play (P1/2/3)
        // Check if quadrant property exists (even if null) before falling through to other values
        const quadrant = (savedState && 'quadrant' in savedState) ? savedState.quadrant
          : (currentUseCase?.quadrant ?? undefined)
          || p.quadrant
          || (isBacklogPriority ? undefined : quadrantFromPriority(priority));

        return {
          id: useCaseId,
          painPointId: p.id,
          //name: baseline?.name || p.response,
          //problem: baseline?.problem || p.response,
          //agentRole: baseline?.agentRole || "",
          //dataRequired: baseline?.dataRequired || "",
          //integration: baseline?.integration || "",

          //anil
          name: savedState?.name || baseline?.name || p.response,
          category: savedState?.category || p.category,
          problem: savedState?.problem || baseline?.problem || p.response,
          agentRole: savedState?.agentRole || baseline?.agentRole || "",
          dataRequired: savedState?.dataRequired || baseline?.dataRequired || "",
          integration: savedState?.integration || baseline?.integration || "",


          revenueImpact: baseline?.revenueImpact || "",
          costSavings: baseline?.costSavings || "",
          riskReduction: baseline?.riskReduction || "",
          timeToValue: baseline?.timeToValue || "1-3 months",
          impact: "High" as const,
          effort: "Medium" as const,
          priority,
          quadrant,
          backlogPriority: isBacklogPriority
            ? savedState.priority as any
            : currentUseCase?.backlogPriority,
          agentCount: baseline?.agentCount || "1",
          dataCloud: baseline?.dataCloud || "",
          otherLicenses: [],
          timeline: savedState?.timeline || baseline?.timeline || "Jan 31st 2025",
          calculatedRevenue: savedState?.revenue ?? baseline?.calculatedRevenue ?? 0,
          calculatedSavings: savedState?.savings ?? baseline?.calculatedSavings ?? 0,
          calculatedEfficiency: baseline?.calculatedEfficiency || 0
        };
      };

      const regeneratedUseCases = painPoints.map(generateUseCaseFromPainPoint);
      console.log('✅ Regenerated', regeneratedUseCases.length, 'use cases from saved data');
      console.log('📊 Sample use case:', regeneratedUseCases[0]);

      setUseCases(regeneratedUseCases);
      setHasRegenerated(true);

      // Update cumulative ROI
      const totalRev = regeneratedUseCases.reduce((acc, c) => acc + (c.calculatedRevenue || 0), 0);
      const totalSav = regeneratedUseCases.reduce((acc, c) => acc + (c.calculatedSavings || 0), 0);
      const totalEff = regeneratedUseCases.reduce((acc, c) => acc + (c.calculatedEfficiency || 0), 0);
      setCumulativeROI({ revenue: totalRev, savings: totalSav, efficiency: totalEff });

      console.log('✅ Updated ROI:', { revenue: totalRev, savings: totalSav, efficiency: totalEff });
    }
  }, [isReady, painPointsLoaded, painPoints, savedUseCaseStates, hasRegenerated, sessionId]);

  //const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentUseCaseIndex, setCurrentUseCaseIndex] = useState(0);

  // Note: We don't load savedUseCases directly anymore
  // Instead, we merge savedUseCaseStates when generating use cases from pain points

  // ROI State
  const [cumulativeROI, setCumulativeROI] = useState({
    revenue: 0,
    savings: 0,
    efficiency: 0
  });

  // PDF Download handler
  const handleDownloadPDF = async () => {
    // Auto-save use cases before generating PDF to ensure current state is captured
    try {
      console.log('💾 Auto-saving use cases before PDF generation...');
      await batchSaveUseCases(useCases);
      console.log('✅ Use cases saved successfully');
    } catch (error) {
      console.error('❌ Failed to save use cases:', error);
    }
    
    // Open print dialog to save as PDF
    window.print();
  };

  // Save handler
  const handleSave = async () => {
    console.log('handleSave called');
    console.log('Current step:', step);
    console.log('Pain points:', painPoints.length);
    console.log('Use cases:', useCases.length);

    setIsSaving(true);
    try {
      let savedSomething = false;

      // Identify custom points that exist in DB and collect IDs to delete
      const customPointsInDB = customPainPoints.filter(cp => cp.id.startsWith('custom-'));
      const currentCustomPointIds = new Set(painPoints.filter(p => p.id.startsWith('custom-')).map(p => p.id));
      
      // Find custom points that were in DB but are now completely gone (explicitly deleted)
      const customPointsToDelete = customPointsInDB
        .filter(cp => !currentCustomPointIds.has(cp.id))
        .map(cp => cp.id);

      // Delete only explicitly removed custom pain points (not unassigned ones)
      const allPointsToDelete = [...new Set([...deletedPainPointIds, ...customPointsToDelete])];
      if (allPointsToDelete.length > 0) {
        const dbPainPointIds = allPointsToDelete.filter(id => {
          const match = id.match(/^custom-(\d+)$/);
          return match && !isNaN(parseInt(match[1]));
        });

        if (dbPainPointIds.length > 0) {
          console.log('Deleting', dbPainPointIds.length, 'custom pain points from database...');
          for (const id of dbPainPointIds) {
            try {
              await deleteCustomPainPoint(id);
              console.log(`✅ Deleted custom pain point ${id}`);
            } catch (error) {
              console.error('Failed to delete pain point', id, error);
            }
          }
          savedSomething = true;
        }
        
        // Also remove orphaned use cases (whose pain points were deleted) from memory
        const deletedPainPointIds_Set = new Set(allPointsToDelete);
        const orphanedUseCases = useCases.filter(uc => deletedPainPointIds_Set.has(uc.painPointId));
        if (orphanedUseCases.length > 0) {
          console.log(`🗑️ Removing ${orphanedUseCases.length} orphaned use cases from memory`);
          setUseCases(useCases.filter(uc => !deletedPainPointIds_Set.has(uc.painPointId)));
        }
        
        // Remove deleted custom points from painPoints state
        setPainPoints(painPoints.filter(p => !deletedPainPointIds_Set.has(p.id)));
        
        setDeletedPainPointIds([]);
      }

      // Save pain points that are custom OR have been categorized (theme/priority/quadrant)
      const pointsToSave = painPoints.filter(p =>
        p.id.startsWith('custom-') ||
        p.theme ||
        p.priority ||
        p.quadrant ||
        !INITIAL_PAIN_POINTS.find(ip => ip.id === p.id && ip.response === p.response)
      );

      if (pointsToSave.length > 0) {
        console.log('Saving', pointsToSave.length, 'pain points...');
        console.log('Points to save:', pointsToSave.map(p => ({ id: p.id, question: p.question, theme: p.theme, priority: p.priority, quadrant: p.quadrant })));

        // Group into new vs existing
        const newPoints = [];
        const existingPoints = [];

        for (const point of pointsToSave) {
          // Check if this pain point already exists in customPainPoints (loaded from database)
          const existsInDB = customPainPoints.some(cp => cp.id === point.id);

          // Only save if it's a custom point (starts with 'custom-')
          // Standard pain points should NOT be persisted to database
          if (point.id.startsWith('custom-')) {
            if (existsInDB) {
              existingPoints.push(point);
            } else {
              newPoints.push(point);
            }
          }
          // Skip standard pain points (they come from INITIAL_PAIN_POINTS and should not be saved)
        }

        console.log(`Categorized: ${newPoints.length} new, ${existingPoints.length} existing`);

        // Save new and existing pain points in parallel for better performance
        const savePromises = [
          ...newPoints.map(point =>
            saveCustomPainPoint(point)
              .then(() => console.log(`✅ Saved new pain point ${point.id}`))
              .catch(error => console.error(`❌ Failed to save pain point ${point.id}:`, error))
          ),
          ...existingPoints.map(point =>
            updateCustomPainPoint(point)
              .then(() => console.log(`✅ Updated pain point ${point.id}`))
              .catch(error => console.error(`❌ Failed to update pain point ${point.id}:`, error))
          )
        ];

        await Promise.all(savePromises);

        savedSomething = true;
        console.log('Pain points saved!');
      }

      // If no use cases yet (still in Step 3), clear saved use case state for custom pain points moved back to backlog
      if (useCases.length === 0) {
        const clearedCustomPoints = painPoints.filter(p => p.id.startsWith('custom-') && !p.quadrant);
        if (clearedCustomPoints.length > 0) {
          console.log('Clearing saved use case state for', clearedCustomPoints.length, 'custom pain points moved to backlog');
          await Promise.all(clearedCustomPoints.map(async (p) => {
            const savedState = savedUseCaseStates.get(`uc-${p.id}`) || {} as any;
            const useCaseToClear: UseCase = {
              id: `uc-${p.id}`,
              painPointId: p.id,
              name: savedState.name || p.response,
              category: savedState.category || p.category,
              problem: savedState.problem || p.response,
              agentRole: savedState.agentRole || "",
              dataRequired: savedState.dataRequired || "",
              integration: savedState.integration || "",
              revenueImpact: "",
              costSavings: "",
              riskReduction: "",
              timeToValue: "1-3 months",
              impact: "High",
              effort: "Medium",
              priority: null as any,
              quadrant: null,
              backlogPriority: undefined,
              agentCount: "1",
              dataCloud: "",
              otherLicenses: [],
              timeline: savedState.timeline || "",
              calculatedRevenue: savedState.revenue ?? 0,
              calculatedSavings: savedState.savings ?? 0,
              calculatedEfficiency: 0,
            };

            try {
              await saveUseCaseState(useCaseToClear as any);
            } catch (err) {
              console.error('Failed to clear use case state for', p.id, err);
            }
          }));
          savedSomething = true;
        }
      }

      // Save use cases if they exist
      if (useCases.length > 0) {
        console.log('Saving use cases...');

        const existingPainPointIds = new Set(painPoints.map(p => p.id));

        // Add placeholder use cases for custom pain points that are in backlog (no quadrant) so we can clear their saved state
        const customBacklog = painPoints.filter(p => p.id.startsWith('custom-') && !p.quadrant);
        const placeholderClears: UseCase[] = customBacklog
          .filter(p => !useCases.some(uc => uc.painPointId === p.id))
          .map(p => {
            const savedState = savedUseCaseStates.get(`uc-${p.id}`) || {} as any;
            return {
              id: `uc-${p.id}`,
              painPointId: p.id,
              name: savedState.name || p.response,
              category: savedState.category || p.category,
              problem: savedState.problem || p.response,
              agentRole: savedState.agentRole || "",
              dataRequired: savedState.dataRequired || "",
              integration: savedState.integration || "",
              revenueImpact: "",
              costSavings: "",
              riskReduction: "",
              timeToValue: "1-3 months",
              impact: "High",
              effort: "Medium",
              priority: null as any,
              quadrant: null,
              backlogPriority: undefined,
              agentCount: "1",
              dataCloud: "",
              otherLicenses: [],
              timeline: savedState.timeline || "",
              calculatedRevenue: savedState.revenue ?? 0,
              calculatedSavings: savedState.savings ?? 0,
              calculatedEfficiency: 0,
            } as UseCase;
          });

        const useCasesBase = [...useCases, ...placeholderClears];

        // Filter: only save use cases whose pain points still exist
        const useCasesToSave = useCasesBase.filter(uc => existingPainPointIds.has(uc.painPointId));
        console.log(`📊 Use cases: total ${useCasesBase.length}, to save: ${useCasesToSave.length} (filtered out ${useCasesBase.length - useCasesToSave.length} orphaned)`);

        // Align use cases to current quadrant assignments from pain points
        const useCasesAlignedToQuadrants = useCasesToSave.map(uc => {
          const painPoint = painPoints.find(p => p.id === uc.painPointId);

          const quadrant = painPoint ? (painPoint.quadrant ?? null) : null;
          const priorityFromPainPoint = painPoint ? painPoint.priority ?? null : null;
          const backlogPriority = (uc as any).backlogPriority ?? null;

          const priority = backlogPriority
            ?? priorityFromPainPoint
            ?? (quadrant ? (uc.priority ?? null) : null);

          return {
            ...uc,
            quadrant,
            priority,
          } as UseCase;
        });

        if (useCasesAlignedToQuadrants.length > 0) {
          await batchSaveUseCases(useCasesAlignedToQuadrants);
        }
        savedSomething = true;
        console.log('Use cases saved!');
      }

      if (!savedSomething && useCases.length === 0) {
        // Early in workflow, nothing to save yet
        alert('Progress will be saved automatically as you work through the steps. Continue to the next step to start creating use cases.');
        setIsSaving(false);
        return;
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      console.log('Save completed successfully!');

    } catch (error) {
      console.error('Failed to save:', error);
      alert(`Failed to save progress: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Note: Auto-save is now handled by the useEffect above that watches useCases changes



  // Navigation Helpers
  const nextStep = (next: Step) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(next);
  };

  // Breadcrumb navigation handler
  const handleBreadcrumbClick = (stepId: number) => {
    const stepMap: Record<number, Step> = {
      1: "welcome",
      2: "identify",
      3: "prioritize",
      4: "deep-dive",
      5: "roi"
    };
    const targetStep = stepMap[stepId];
    if (targetStep) {
      nextStep(targetStep);
    }
  };

  // Step 1: Welcome
  if (step === "welcome") {

    /*
        // 🆕 NEW: Handler for "Start Discovery" button
        const handleStartDiscovery = async () => {
          try {
            console.log('🚀 Starting new discovery...');
            await createNewSession();
            console.log('✅ New session created successfully');
            nextStep("identify");
          } catch (error) {
            console.error('❌ Failed to create new session:', error);
            alert('Failed to create new session. Please try again.');
          }
        };
    */
    // Handler for "Start Discovery" button
    const handleStartDiscovery = async () => {
      try {
        console.log('🚀 Starting new discovery...');

        // Create brand new session
        const newSession = await createNewSession();
        console.log('✅ New session created:', newSession.id);

        // IMPORTANT: Reset all UI state for fresh start
        setPainPoints(INITIAL_PAIN_POINTS);
        setUseCases([]);
        setCumulativeROI({ revenue: 0, savings: 0, efficiency: 0 });
        setDeletedPainPointIds([]);
        setHasUnsavedChanges(false);
        setHasRegenerated(false); // Reset regeneration flag for new session

        // Navigate to first step
        nextStep("identify");
      } catch (error) {
        console.error('❌ Failed to create new session:', error);
        alert('Failed to create new session. Please try again.');
      }
    };
    //anil
    // 🆕 NEW: Handler to load the most recent session with data
    const handleContinueFromLast = async () => {
      try {
        console.log('🔍 Finding most recent session with data...');

        // Find first session that has pain points or use cases
        for (const session of recentSessions) {
          try {
            const painPoints = await painPointsAPI.getBySession(session.id);
            const useCases = await useCasesAPI.getBySession(session.id);

            if (painPoints.length > 0 || useCases.length > 0) {
              console.log('✅ Found session with data:', session.id);
              await loadSession(session.id);
              nextStep("identify");
              return;
            } else {
              console.log('⏭️ Skipping empty session:', session.id);
            }
          } catch (error) {
            console.error('Error checking session:', session.id, error);
          }
        }

        // No sessions with data found
        alert('No previous workshops found with data. Please start a new discovery.');
      } catch (error) {
        console.error('❌ Failed to load session:', error);
        alert('Failed to load previous workshop. Please try again.');
      }
    };

    // 🆕 NEW: Handler for clicking a recent session
    const handleLoadSession = async (sessionId: number) => {
      try {
        console.log('📂 Loading session:', sessionId);
        await loadSession(sessionId);
        console.log('✅ Session loaded successfully');
        nextStep("identify");
      } catch (error) {
        console.error('❌ Failed to load session:', error);
        alert('Failed to load session. Please try again.');
      }
    };


    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
        <main className="flex-1 flex flex-col">
          <div className="relative h-[40vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img
              src="/images/hero-bg.jpg"
              alt="Industrial Background"
              className="w-full h-full object-cover grayscale"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="container max-w-4xl text-center text-white space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-sm font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--color-buyframe-red)] animate-pulse" />
                  Live Discovery Session
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-bold tracking-tight"
                >
                  Visa Agentforce <br /> Discovery
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-white/80 max-w-2xl mx-auto"
                >
                  Build a use case backlog to maximize Agentforce + Data Cloud investment before the Jan 31st renewal.
                </motion.p>
              </div>
            </div>
          </div>

          <div className="flex-1 container max-w-6xl py-16">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Identify Use Cases",
                  desc: "Identify high-impact agentic use cases for Sales Operations & Pricing"
                },
                {
                  step: "02",
                  title: "Quantify ROI",
                  desc: "Quantify projected ROI and define license requirements for each use case"
                },
                {
                  step: "03",
                  title: "Create Roadmap",
                  desc: "Create a phased roadmap that drives continuous license consumption"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="p-8 border border-border bg-card hover:border-primary/50 transition-colors group cursor-default"
                >
                  <div className="text-4xl font-bold text-muted-foreground/20 mb-4 group-hover:text-[var(--color-buyframe-red)]/20 transition-colors">{item.step}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 flex justify-center items-center gap-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-[var(--color-buyframe-red)] hover:bg-[var(--color-buyframe-red)]/90 text-white rounded-none shadow-lg hover:shadow-xl transition-all"
                //onClick={() => nextStep("identify")}
                onClick={handleStartDiscovery}
              >
                Start Discovery <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Continue From Last Workshop Button - Only show if there are recent sessions */}
              {recentSessions.length > 0 && (
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-[var(--color-buyframe-red)] text-[var(--color-buyframe-red)] hover:bg-[var(--color-buyframe-red)] hover:text-white rounded-none shadow-lg hover:shadow-xl transition-all"
                  // onClick={() => handleLoadSession(recentSessions[0].id)} 
                  onClick={handleContinueFromLast}
                >
                  Continue from Last Workshop <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Recent Discoveries List with Pagination */}
            {(() => {
              const pastSessions = recentSessions
                .slice(1) // Skip the most recent one (available in Continue button)
                .filter(session => (session.painPointsCount || 0) > 0 || (session.useCasesCount || 0) > 0);

              if (pastSessions.length === 0) return null;

              const ITEMS_PER_PAGE = 5;
              const totalPages = Math.ceil(pastSessions.length / ITEMS_PER_PAGE);
              const startIndex = recentPageIndex * ITEMS_PER_PAGE;
              const endIndex = startIndex + ITEMS_PER_PAGE;
              const currentItems = pastSessions.slice(startIndex, endIndex);

              return (
                <div className="mt-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-semibold mb-4 text-center text-muted-foreground uppercase tracking-widest">Recent Discoveries</h3>

                  <div className="space-y-3">
                    {currentItems.map(session => (
                      <div
                        key={session.id}
                        onClick={() => handleLoadSession(session.id)}
                        className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-[var(--color-buyframe-red)] hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-[var(--color-buyframe-red)]/10 transition-colors">
                            <Clock className="h-5 w-5 text-muted-foreground group-hover:text-[var(--color-buyframe-red)] transition-colors" />
                          </div>
                          <div>
                            <div className="font-medium text-base group-hover:text-[var(--color-buyframe-red)] transition-colors">
                              {session.name}
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                {new Date(session.updatedAt).toLocaleDateString()} {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                {session.useCasesCount || 0} use cases
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--color-buyframe-red)] group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>

                  {pastSessions.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={recentPageIndex === 0}
                        onClick={() => setRecentPageIndex(prev => Math.max(0, prev - 1))}
                        className="h-8 px-2 text-xs"
                      >
                        Previous
                      </Button>

                      <div className="text-xs text-center text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, pastSessions.length)} of {pastSessions.length}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={endIndex >= pastSessions.length}
                        onClick={() => setRecentPageIndex(prev => prev + 1)}
                        className="h-8 px-2 text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}



          </div>
        </main>
      </div>
    );
  }

  // Step 2: Identify
  if (step === "identify") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
        <Breadcrumbs currentStep={1} onStepClick={handleBreadcrumbClick} />
        <main className="flex-1 container max-w-5xl py-12 space-y-12">
          <div className="space-y-2">
            <div className="text-[var(--color-buyframe-red)] font-mono font-bold">STEP 01</div>
            <h2 className="text-4xl font-bold tracking-tight">Identify Pain Points</h2>
            <p className="text-muted-foreground text-lg">Review and validate the challenges identified in previous discussions.</p>
          </div>

          {/* Add New Pain Point Buttons */}
          <div className="flex justify-end gap-2 mb-4 flex-wrap">
            {["Time & Efficiency", "Accuracy & Risk", "Intelligence & Insights", "Revenue & Growth"].map((cat) => (
              <Button
                key={cat}
                variant="outline"
                size="sm"
                className="bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-gray-800 text-xs"
                onClick={() => {
                  const newId = `custom-${Date.now()}`;
                  const newPoint: PainPoint = {
                    id: newId,
                    category: cat as PainPoint['category'],
                    question: "Custom pain point",
                    response: "Describe your pain point here...",
                    theme: "Sales"
                  };
                  setPainPoints([...painPoints, newPoint]);
                  setHasUnsavedChanges(true);

                  // Scroll to the category section
                  setTimeout(() => {
                    const headings = Array.from(document.querySelectorAll('h3'));
                    const section = headings.find(h => h.textContent === cat);
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                + Add to {cat}
              </Button>
            ))}
          </div>

          <div className="space-y-12">
            {["Time & Efficiency", "Accuracy & Risk", "Intelligence & Insights", "Revenue & Growth"].map((category) => (
              <section key={category} className="space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">{category}</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {painPoints.filter(p => p.category === category).map(point => (
                    <Card key={point.id} className="h-full bg-yellow-100 border-2 border-yellow-200 hover:shadow-lg transition-all relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => {
                          setPainPoints(painPoints.filter(p => p.id !== point.id));
                          // Track deleted custom pain points
                          if (point.id.startsWith('custom-')) {
                            setDeletedPainPointIds([...deletedPainPointIds, point.id]);
                          }
                          setHasUnsavedChanges(true);
                        }}
                      >
                        ×
                      </Button>
                      <CardHeader>
                        <CardTitle className="text-xs font-medium text-gray-600 leading-relaxed pr-8">
                          {point.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          className="min-h-[100px] bg-yellow-50 border-yellow-200 text-gray-800 font-medium text-sm"
                          value={point.response}
                          onChange={(e) => {
                            const newPoints = painPoints.map(p =>
                              p.id === point.id ? { ...p, response: e.target.value } : p
                            );
                            setPainPoints(newPoints);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="flex justify-between pt-8 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              className="rounded-none"
              onClick={() => setStep("welcome")}
            >
              Previous
            </Button>
            <Button
              size="lg"
              className="bg-black text-white hover:bg-black/90 rounded-none"
              onClick={() => nextStep("categorize")}
            >
              Next: Categorize Themes <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Step 3: Categorize
  if (step === "categorize") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
        <Breadcrumbs currentStep={2} onStepClick={handleBreadcrumbClick} />
        <main className="flex-1 container max-w-5xl py-12 space-y-12">
          <div className="space-y-2">
            <div className="text-[var(--color-buyframe-red)] font-mono font-bold">STEP 02</div>
            <h2 className="text-4xl font-bold tracking-tight">Categorize Themes</h2>
            <p className="text-muted-foreground text-lg">Group pain points into strategic themes to identify patterns.</p>
          </div>

          {/* Theme Distribution Chart */}
          <ThemeChart painPoints={painPoints} />

          <div className="grid md:grid-cols-2 gap-8">
            {painPoints.map((point) => (
              <div key={point.id} className="flex gap-4 p-4 border border-border bg-card rounded-lg items-start">
                <div className="flex-1 space-y-2">
                  <p className="font-medium">{point.response}</p>
                  <p className="text-sm text-muted-foreground">{point.question}</p>
                </div>
                <Select
                  value={point.theme}
                  onValueChange={(val: any) => {
                    const newPoints = painPoints.map(p =>
                      p.id === point.id ? { ...p, theme: val } : p
                    );
                    setPainPoints(newPoints);
                    setHasUnsavedChanges(true);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pricing">Pricing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="RevOps">RevOps</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Competitive">Competitive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-8 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              className="rounded-none"
              onClick={() => setStep("identify")}
            >
              Previous
            </Button>
            <Button
              size="lg"
              className="bg-black text-white hover:bg-black/90 rounded-none"
              onClick={() => nextStep("prioritize")}
            >
              Next: Prioritize Impact <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Step 4: Prioritize
  if (step === "prioritize") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
        <Breadcrumbs currentStep={3} onStepClick={handleBreadcrumbClick} />
        <main className="flex-1 container max-w-6xl py-12 space-y-12">
          <div className="space-y-2">
            <div className="text-[var(--color-buyframe-red)] font-mono font-bold">STEP 03</div>
            <h2 className="text-4xl font-bold tracking-tight">Prioritize Impact</h2>
            <p className="text-muted-foreground text-lg">Drag and drop use cases into the quadrants to prioritize them.</p>
          </div>

          <div className="bg-background p-4 rounded-xl border border-border">
            <QuadrantPrioritization
              items={painPoints}
              onUpdate={(updated) => {
                setPainPoints(updated);
                setHasUnsavedChanges(true);
              }}
            />
          </div>

          <div className="flex justify-between pt-8 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              className="rounded-none"
              onClick={() => setStep("categorize")}
            >
              Previous
            </Button>
            <Button
              size="lg"
              className="bg-black text-white hover:bg-black/90 rounded-none"
              onClick={async () => {
                // Auto-save pain points with quadrant assignments before generating use cases
                const pointsWithQuadrants = painPoints.filter(p => p.quadrant);
                if (pointsWithQuadrants.length > 0) {
                  console.log('💾 Auto-saving pain points with quadrants before generating use cases:', pointsWithQuadrants.length);
                  try {
                    await handleSave();
                  } catch (error) {
                    console.error('Failed to auto-save pain points:', error);
                  }
                }
                
                // Smart merge: Sync with pain points while preserving user edits
                console.log('🔄 Generating use cases from painPoints:', {
                  totalPainPoints: painPoints.length,
                  painPointsWithQuadrants: painPoints.filter(p => p.quadrant).map(p => ({ id: p.id, quadrant: p.quadrant, response: p.response.substring(0, 50) })),
                });
                
                const generateUseCaseFromPainPoint = (p: PainPoint) => {
                  const baseline = BASELINE_ROI_PROJECTIONS[p.id as keyof typeof BASELINE_ROI_PROJECTIONS];
                  const useCaseId = `uc-${p.id}`;
                  const savedState = savedUseCaseStates.get(useCaseId);

                  // Determine if saved priority is a backlog priority (P1, P2, P3) or quadrant priority (H1, H2, TBD)
                  const isBacklogPriority = savedState?.priority && ['P1', 'P2', 'P3'].includes(savedState.priority);

                  if (p.id.startsWith('custom-')) {
                    console.log(`🔍 Custom pain point ${p.id}:`, {
                      useCaseId,
                      hasSavedState: !!savedState,
                      savedPriority: savedState?.priority,
                      isBacklogPriority,
                      willSetBacklogPriority: isBacklogPriority ? savedState.priority : undefined
                    });
                  }

                  const priority = isBacklogPriority ? "H1" : (savedState?.priority || p.priority || "H1");
                  //</div>const quadrant = (savedState && 'quadrant' in savedState) ? savedState.quadrant
                  //  : (p.quadrant || (isBacklogPriority ? undefined : quadrantFromPriority(priority)));
                 // const quadrant = p.quadrant || (isBacklogPriority ? undefined : quadrantFromPriority(priority)); 
                 const quadrant = p.quadrant; 
                  return {
                    id: useCaseId,
                    painPointId: p.id,
                    //name: baseline?.name || p.response,
                    //category: p.category,
                    // problem: baseline?.problem || p.response,
                    // agentRole: baseline?.agentRole || "",
                    //dataRequired: baseline?.dataRequired || "",
                    //integration: baseline?.integration || "",

                    //anil
                    name: savedState?.name || baseline?.name || p.response,
                    category: savedState?.category || p.category,
                    problem: savedState?.problem || baseline?.problem || p.response,
                    agentRole: savedState?.agentRole || baseline?.agentRole || "",
                    dataRequired: savedState?.dataRequired || baseline?.dataRequired || "",
                    integration: savedState?.integration || baseline?.integration || "",

                    revenueImpact: baseline?.revenueImpact || "",
                    costSavings: baseline?.costSavings || "",
                    riskReduction: baseline?.riskReduction || "",
                    timeToValue: baseline?.timeToValue || "1-3 months",
                    impact: "High" as const,
                    effort: "Medium" as const,
                    priority,
                    quadrant,
                    backlogPriority: isBacklogPriority ? savedState.priority : undefined,
                    agentCount: baseline?.agentCount || "1",
                    dataCloud: baseline?.dataCloud || "",
                    otherLicenses: [],
                    timeline: savedState?.timeline || baseline?.timeline || "Jan 31st 2025",
                    calculatedRevenue: savedState?.revenue ?? baseline?.calculatedRevenue ?? 0,
                    calculatedSavings: savedState?.savings ?? baseline?.calculatedSavings ?? 0,
                    calculatedEfficiency: baseline?.calculatedEfficiency || 0
                  };
                };

                if (useCases.length === 0) {
                  // First time: Generate all use cases
                  const newUseCases = painPoints.map(generateUseCaseFromPainPoint);
                  console.log('✅ Initial generation: Created', newUseCases.length, 'use cases');
                  console.log('📊 Generated use cases with quadrants:', newUseCases.filter(uc => uc.quadrant).map(uc => ({ name: uc.name, quadrant: uc.quadrant })));
                  setUseCases(newUseCases);

                  // Initialize cumulative ROI
                  const totalRev = newUseCases.reduce((acc, c) => acc + (c.calculatedRevenue || 0), 0);
                  const totalSav = newUseCases.reduce((acc, c) => acc + (c.calculatedSavings || 0), 0);
                  const totalEff = newUseCases.reduce((acc, c) => acc + (c.calculatedEfficiency || 0), 0);
                  setCumulativeROI({ revenue: totalRev, savings: totalSav, efficiency: totalEff });
                } else {
                  // Smart merge: Preserve edits, add new, remove deleted, update metadata
                  const existingUseCaseMap = new Map(useCases.map(uc => [uc.painPointId, uc]));
                  const currentPainPointIds = new Set(painPoints.map(p => p.id));

                  const mergedUseCases = painPoints.map(p => {
                    const existing = existingUseCaseMap.get(p.id);

                    if (existing) {
                      // Smart merge: Update metadata from pain point, preserve user-edited financial data
                      const baseline = BASELINE_ROI_PROJECTIONS[p.id as keyof typeof BASELINE_ROI_PROJECTIONS];

                      const backlogPriority = (existing as any).backlogPriority ?? null;
                      const priority = backlogPriority ?? p.priority ?? existing.priority ?? null;
                      const quadrant = p.quadrant ?? null;

                      console.log(`✅ Smart merge for pain point: ${p.id} - updating metadata, preserving financial edits`);
                      return {
                        ...existing,
                        // Update these fields from baseline/pain point (metadata)
                        name: baseline?.name || p.response,
                        category: p.category,
                        problem: baseline?.problem || p.response,
                        quadrant,
                        priority,
                        // Preserve user-edited financial fields
                        calculatedRevenue: existing.calculatedRevenue,
                        calculatedSavings: existing.calculatedSavings,
                        timeline: existing.timeline,
                      };
                    } else {
                      // New pain point: Generate new use case
                      console.log(`➕ Adding new use case for pain point: ${p.id}`);
                      return generateUseCaseFromPainPoint(p);
                    }
                  });

                  // Log removed use cases
                  useCases.forEach(uc => {
                    if (!currentPainPointIds.has(uc.painPointId)) {
                      console.log(`➖ Removing use case for deleted pain point: ${uc.painPointId}`);
                    }
                  });

                  console.log(`✅ Smart merge complete: ${mergedUseCases.length} use cases (${mergedUseCases.length - useCases.length} added, ${useCases.length - mergedUseCases.length} removed)`);
                  setUseCases(mergedUseCases);

                  // Recalculate cumulative ROI
                  const totalRev = mergedUseCases.reduce((acc, c) => acc + (c.calculatedRevenue || 0), 0);
                  const totalSav = mergedUseCases.reduce((acc, c) => acc + (c.calculatedSavings || 0), 0);
                  const totalEff = mergedUseCases.reduce((acc, c) => acc + (c.calculatedEfficiency || 0), 0);
                  setCumulativeROI({ revenue: totalRev, savings: totalSav, efficiency: totalEff });
                }
                nextStep("deep-dive");
              }}
              disabled={painPoints.length === 0}
            >
              Next: Deep Dive on Use Cases <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Step 5: Deep Dive
  if (step === "deep-dive") {
    // Ensure useCases is populated
    if (useCases.length === 0) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">No Use Cases Selected</h2>
            <p className="text-muted-foreground">Please go back and prioritize at least one use case as H1.</p>
            <Button onClick={() => setStep("prioritize")}>Go Back</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
        <Breadcrumbs currentStep={4} onStepClick={handleBreadcrumbClick} />
        <main className="flex-1 container max-w-full px-8 py-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="text-[var(--color-buyframe-red)] font-mono font-bold">STEP 04</div>
              <h2 className="text-4xl font-bold tracking-tight">Deep Dive on Use Cases</h2>
              <p className="text-muted-foreground text-lg">Review and customize all {useCases.length} use cases below. Edit any field directly in the table.</p>
            </div>

            {/* Table View of All Use Cases */}
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">#</th>
                    <th className="px-4 py-3 text-left font-bold min-w-[200px]">Use Case Name</th>
                    <th className="px-4 py-3 text-left font-bold">Category</th>
                    <th className="px-4 py-3 text-left font-bold min-w-[250px]">Problem Statement</th>
                    <th className="px-4 py-3 text-left font-bold min-w-[250px]">Agent Role</th>
                    <th className="px-4 py-3 text-left font-bold min-w-[200px]">Data Required</th>
                    <th className="px-4 py-3 text-left font-bold min-w-[200px]">Integration</th>
                    <th className="px-4 py-3 text-left font-bold">Revenue ($)</th>
                    <th className="px-4 py-3 text-left font-bold">Savings ($)</th>
                    <th className="px-4 py-3 text-left font-bold">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {useCases.map((useCase, index) => (
                    <tr key={useCase.id} className="border-b border-border hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Input
                          value={useCase.name}
                          onChange={(e) => {
                            const newCases = [...useCases];
                            newCases[index].name = e.target.value;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                          }}
                          className="min-w-[200px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={useCase.category}
                          onValueChange={(val) => {
                            const newCases = [...useCases];
                            newCases[index].category = val;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pricing">Pricing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="RevOps">RevOps</SelectItem>
                            <SelectItem value="Customer">Customer</SelectItem>
                            <SelectItem value="Competitive">Competitive</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Textarea
                          value={useCase.problem}
                          onChange={(e) => {
                            const newCases = [...useCases];
                            newCases[index].problem = e.target.value;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                          }}
                          className="min-h-[60px] min-w-[250px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Textarea
                          value={useCase.agentRole}
                          onChange={(e) => {
                            const newCases = [...useCases];
                            newCases[index].agentRole = e.target.value;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                          }}
                          className="min-h-[60px] min-w-[250px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={useCase.dataRequired}
                          onChange={(e) => {
                            const newCases = [...useCases];
                            newCases[index].dataRequired = e.target.value;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                          }}
                          className="min-w-[200px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={useCase.integration}
                          onChange={(e) => {
                            const newCases = [...useCases];
                            newCases[index].integration = e.target.value;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                          }}
                          className="min-w-[200px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={useCase.calculatedRevenue || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newCases = [...useCases];
                            newCases[index].calculatedRevenue = val;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                            // Recalculate cumulative
                            const totalRev = newCases.reduce((acc, c) => acc + (c.calculatedRevenue || 0), 0);
                            const totalSav = newCases.reduce((acc, c) => acc + (c.calculatedSavings || 0), 0);
                            setCumulativeROI({ ...cumulativeROI, revenue: totalRev, savings: totalSav });
                          }}
                          className="w-[120px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={useCase.calculatedSavings || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newCases = [...useCases];
                            newCases[index].calculatedSavings = val;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                            // Recalculate cumulative
                            const totalRev = newCases.reduce((acc, c) => acc + (c.calculatedRevenue || 0), 0);
                            const totalSav = newCases.reduce((acc, c) => acc + (c.calculatedSavings || 0), 0);
                            setCumulativeROI({ ...cumulativeROI, revenue: totalRev, savings: totalSav });
                          }}
                          className="w-[120px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={useCase.timeline}
                          onValueChange={(val) => {
                            const newCases = [...useCases];
                            newCases[index].timeline = val;
                            setUseCases(newCases);
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Jan 31st 2025">Jan 31st 2025</SelectItem>
                            <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                            <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ROI Summary Card */}
            <Card className="bg-black text-white border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--color-buyframe-red)]">
                  <Zap className="w-5 h-5" />
                  Cumulative ROI Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-5xl font-mono font-bold text-[var(--color-buyframe-red)]">
                      ${(cumulativeROI.revenue + cumulativeROI.savings).toLocaleString()}
                    </div>
                    <div className="text-sm text-white/60 mt-2">Total Annual Impact from {useCases.length} Use Cases</div>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-2xl font-mono font-bold">${cumulativeROI.revenue.toLocaleString()}</div>
                      <div className="text-xs text-white/60">Total Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-mono font-bold">${cumulativeROI.savings.toLocaleString()}</div>
                      <div className="text-xs text-white/60">Total Savings</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-8 border-t border-border">
              <Button
                variant="outline"
                size="lg"
                className="rounded-none"
                onClick={() => setStep("prioritize")}
              >
                Previous
              </Button>
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/90 rounded-none"
                onClick={() => nextStep("roi")}
              >
                View ROI Projection <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  // Step 6: ROI Projection
  if (step === "roi") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
        <Breadcrumbs currentStep={5} onStepClick={handleBreadcrumbClick} />
        <main className="flex-1 container max-w-6xl py-12 space-y-12">
          <div className="space-y-2">
            <div className="text-[var(--color-buyframe-red)] font-mono font-bold">STEP 05</div>
            <h2 className="text-4xl font-bold tracking-tight">ROI Projection Framework</h2>
            <p className="text-muted-foreground text-lg">Quantify the business case for revenue impact to justify license expansion.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Your ROI Projection */}
            <div className="border border-black p-8 flex flex-col bg-white relative overflow-hidden shadow-xl ring-1 ring-black/5">
              <div className="absolute top-0 right-0 bg-[var(--color-buyframe-red)] text-white text-xs font-bold px-4 py-1.5 shadow-sm">YOUR PROJECTION</div>

              <div className="text-[var(--color-buyframe-red)] font-bold text-2xl mb-1">Currencycloud</div>
              <div className="text-xs text-muted-foreground mb-10 font-medium tracking-wide uppercase">FinTech • Cross-Border Payments (VISA-owned)</div>

              <div className="font-bold text-xl mb-10 leading-snug">"Unlocking <span className="text-[var(--color-buyframe-red)]">${(cumulativeROI.revenue + cumulativeROI.savings).toLocaleString()}</span> in annual value through Agentforce"</div>

              <div className="space-y-8 flex-1">
                <div>
                  <div className="text-[var(--color-buyframe-red)] text-xs font-bold uppercase tracking-widest mb-3 text-center">The Challenge</div>
                  <div className="text-sm text-muted-foreground text-center space-y-3">
                    {useCases.length > 0 ? (
                      useCases.slice(0, 3).map(uc => (
                        <div key={uc.id} className="line-clamp-2 leading-relaxed">• {uc.problem}</div>
                      ))
                    ) : (
                      <div className="italic text-muted-foreground/60">No use cases prioritized yet.</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[var(--color-buyframe-red)] text-xs font-bold uppercase tracking-widest mb-3 text-center">What We Discovered</div>
                  <div className="text-sm text-muted-foreground text-center space-y-3">
                    {useCases.length > 0 ? (
                      useCases.slice(0, 3).map(uc => (
                        <div key={uc.id} className="line-clamp-2 leading-relaxed">• <span className="font-medium text-foreground">{uc.name}</span>: {uc.impact} Impact</div>
                      ))
                    ) : (
                      <div className="italic text-muted-foreground/60">Prioritize use cases to see impact.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 border-2 border-[var(--color-buyframe-red)] bg-red-50/50 p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[var(--color-buyframe-red)] text-xs font-bold uppercase tracking-widest">Projected Result</div>
                <div className="text-center space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">${cumulativeROI.revenue.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Revenue Uplift</div>
                  </div>
                  <div className="w-12 h-px bg-border mx-auto"></div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">${cumulativeROI.savings.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cost Savings</div>
                  </div>
                  <div className="pt-2 text-[10px] text-muted-foreground italic">Based on {useCases.length} prioritized use cases</div>
                </div>
              </div>

              {/* Calculation Breakdown */}
              {useCases.length > 0 && (
                <div className="mt-6 border border-gray-300 bg-gray-50 p-4">
                  <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-3 text-center">Calculation Breakdown</div>
                  <div className="space-y-2 text-[10px]">
                    {useCases.map(uc => (
                      <div key={uc.id} className="flex justify-between items-start gap-2 pb-2 border-b border-gray-200 last:border-0">
                        <span className="text-gray-700 font-medium flex-1">{uc.name}</span>
                        <span className="text-gray-900 font-mono font-bold whitespace-nowrap">${((uc.calculatedRevenue || 0) + (uc.calculatedSavings || 0)).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-gray-400">
                      <span className="text-gray-900 font-bold uppercase tracking-wide">Total Annual ROI</span>
                      <span className="text-[var(--color-buyframe-red)] font-mono font-bold text-sm">${(cumulativeROI.revenue + cumulativeROI.savings).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-8 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              className="rounded-none"
              onClick={() => setStep("deep-dive")}
            >
              Previous
            </Button>
            <Button
              size="lg"
              className="bg-black text-white hover:bg-black/90 rounded-none"
              onClick={() => nextStep("backlog")}
            >
              Next: View Use Case Backlog <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Step 7: Backlog
  if (step === "backlog") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
        <Breadcrumbs currentStep={5} onStepClick={handleBreadcrumbClick} />
        <main className="flex-1 container max-w-full px-8 py-12">
          <div className="space-y-2 mb-8">
            <div className="text-[var(--color-buyframe-red)] font-mono font-bold">STEP 06</div>
            <h2 className="text-4xl font-bold tracking-tight">The Use Case Backlog</h2>
            <p className="text-muted-foreground text-lg">Drag and drop use cases to prioritize them for implementation.</p>
          </div>

          <BacklogPrioritization
            items={useCases}
            onUpdate={(updatedUseCases) => {
              setUseCases(updatedUseCases);
              setHasUnsavedChanges(true);
              // Recalculate cumulative ROI
              const totalRev = updatedUseCases.reduce((acc, c) => acc + (c.calculatedRevenue || 0), 0);
              const totalSav = updatedUseCases.reduce((acc, c) => acc + (c.calculatedSavings || 0), 0);
              const totalEff = updatedUseCases.reduce((acc, c) => acc + (c.calculatedEfficiency || 0), 0);
              setCumulativeROI({ revenue: totalRev, savings: totalSav, efficiency: totalEff });
            }}
          />

          <div className="flex justify-between pt-8 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              className="rounded-none"
              onClick={() => setStep("roi")}
            >
              Previous
            </Button>
            <Button
              size="lg"
              className="bg-black text-white hover:bg-black/90 rounded-none"
              onClick={() => nextStep("next-steps")}
            >
              Next: Review Next Steps <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Step 8: Next Steps
  if (step === "next-steps") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onSave={handleSave} isSaving={isSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
        <Breadcrumbs currentStep={5} onStepClick={handleBreadcrumbClick} />
        <main className="flex-1 container max-w-4xl py-20 space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-5xl font-bold tracking-tight">Discovery Complete</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              You've identified {useCases.length} high-impact use cases with a projected annual value of <span className="text-[var(--color-buyframe-red)] font-bold">${(cumulativeROI.revenue + cumulativeROI.savings).toLocaleString()}</span>.
            </p>
          </div>

          <div className="grid gap-8">
            {[
              {
                id: "01",
                title: "Complete the Workbench",
                desc: "Capture use cases, prioritize, and quantify ROI in preparation for Workshop Dec 17th",
                status: "Completed"
              },
              {
                id: "02",
                title: "Finalize the Business Case",
                desc: "BuyFrame delivers the backlog document to support your Jan 31st renewal request",
                status: "Pending"
              },
              {
                id: "03",
                title: "Kickoff Phase 1",
                desc: "Launch first use case to demonstrate immediate value",
                status: "Pending"
              }
            ].map((step) => (
              <div key={step.id} className="flex gap-6 p-6 border border-border bg-card items-start">
                <div className="text-2xl font-mono font-bold text-muted-foreground/30">{step.id}</div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
                  step.status === "Completed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {step.status}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <Button
              variant="outline"
              size="lg"
              className="mr-4 rounded-none"
              onClick={() => setStep("backlog")}
            >
              Previous
            </Button>
            <Button
              size="lg"
              className="bg-[var(--color-buyframe-red)] hover:bg-[var(--color-buyframe-red)]/90 text-white rounded-none"
              onClick={handleDownloadPDF}
            >
              Download Report PDF
            </Button>
          </div>
        </main>

        {/* Hidden PDF Report - Only visible when printing */}
        <div style={{ display: 'none' }} className="pdf-report-print-wrapper">
          <PDFReportComponent data={{
            painPoints,
            useCases,
            cumulativeROI
          }} />
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            * {
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box;
            }
            
            body, html {
              margin: 0;
              padding: 0;
              background: white;
              width: 100%;
              height: auto;
            }
            
            /* Show PDF report and hide everything else */
            .pdf-report-print-wrapper {
              display: block !important;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            
            .pdf-report-container {
              display: block !important;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            
            .pdf-page {
              page-break-after: always;
              page-break-inside: avoid;
              width: 100%;
              margin: 0;
              padding: 30px;
              background: white;
              box-sizing: border-box;
              display: block !important;
            }
            
            .pdf-page:last-child {
              page-break-after: avoid;
            }
            
            /* Hide all main content */
            main,
            .main-content,
            .workshop-steps,
            .step-navigation,
            header,
            nav,
            footer,
            button,
            .button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
