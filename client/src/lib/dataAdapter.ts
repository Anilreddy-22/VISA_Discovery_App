/**
 * Adapter layer to map between existing UI types and backend API types
 * This allows us to keep the existing Home.tsx unchanged while persisting data
 */

import { UseCase as APIUseCase, PainPoint as APIPainPoint } from './api';

// UI UseCase type (from Home.tsx)
export interface UIUseCase {
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
  quadrant?: "Quick Wins" | "Major Projects" | "Fill-in" | "Money Pit";
  [key: string]: any;
}

// UI PainPoint type (from Home.tsx)
export interface UIPainPoint {
  id: string;
  category: "Time & Efficiency" | "Accuracy & Risk" | "Intelligence & Insights" | "Revenue & Growth";
  question: string;
  response: string;
  theme?: "Pricing" | "Sales" | "RevOps" | "Customer" | "Competitive";
  priority?: "H1" | "H2" | "TBD" | "Deprioritize";
  quadrant?: "Quick Wins" | "Major Projects" | "Fill-in" | "Money Pit";
}

/**
 * Convert API PainPoint to UI PainPoint
 */
export function apiToUIPainPoint(apiPainPoint: APIPainPoint): UIPainPoint {
  return {
    id: `custom-${apiPainPoint.id}`,
    category: mapCategoryToUI(apiPainPoint.category),
    question: apiPainPoint.title,
    response: apiPainPoint.description,
    theme: apiPainPoint.theme as any,
    priority: apiPainPoint.priority as any,
    quadrant: apiPainPoint.quadrant as any,
  };
}

/**
 * Convert UI PainPoint to API format for creation
 */
export function uiToAPIPainPoint(uiPainPoint: UIPainPoint) {
  return {
    category: mapCategoryToAPI(uiPainPoint.category),
    title: uiPainPoint.question,
    description: uiPainPoint.response,
    // Use null (not undefined) so server overwrites existing values when clearing
    theme: uiPainPoint.theme ?? null,
    priority: uiPainPoint.priority ?? null,
    quadrant: uiPainPoint.quadrant ?? null,
  };
}

/**
 * Map UI category to API category
 */
function mapCategoryToAPI(uiCategory: string): string {
  const mapping: Record<string, string> = {
    "Time & Efficiency": "time",
    "Accuracy & Risk": "accuracy",
    "Intelligence & Insights": "intelligence",
    "Revenue & Growth": "revenue",
  };
  return mapping[uiCategory] || "time";
}

/**
 * Map API category to UI category
 */
function mapCategoryToUI(apiCategory: string): "Time & Efficiency" | "Accuracy & Risk" | "Intelligence & Insights" | "Revenue & Growth" {
  const mapping: Record<string, any> = {
    "time": "Time & Efficiency",
    "accuracy": "Accuracy & Risk",
    "intelligence": "Intelligence & Insights",
    "revenue": "Revenue & Growth",
  };
  return mapping[apiCategory] || "Time & Efficiency";
}

/**
 * Convert API UseCase to UI UseCase
 */
export function apiToUIUseCase(apiUseCase: APIUseCase, baseUseCase: UIUseCase): UIUseCase {
  return {
    ...baseUseCase,
    priority: apiUseCase.priority || baseUseCase.priority,
    calculatedRevenue: apiUseCase.revenue || baseUseCase.calculatedRevenue,
    calculatedSavings: apiUseCase.savings || baseUseCase.calculatedSavings,
    timeline: apiUseCase.timeline || baseUseCase.timeline,

    // anil ADD THESE 6 FIELDS:
    name: apiUseCase.name || baseUseCase.name,
    category: apiUseCase.category || baseUseCase.category,
    problem: apiUseCase.problem || baseUseCase.problem,
    agentRole: apiUseCase.agentRole || baseUseCase.agentRole,
    dataRequired: apiUseCase.dataRequired || baseUseCase.dataRequired,
    integration: apiUseCase.integration || baseUseCase.integration,

  };
}

/**
 * Extract API-relevant data from UI UseCase
 */
export function uiToAPIUseCase(uiUseCase: UIUseCase) {
  // Prioritize backlogPriority (P1, P2, P3) over earlier priority (H1, H2, TBD)
  // This ensures backlog step changes override quadrant step priorities
  const priority = (uiUseCase as any).backlogPriority ?? uiUseCase.priority ?? null;

  // Allow clearing quadrant/priority by sending null (API treats undefined as keep-existing)
  const quadrant = uiUseCase.quadrant ?? null;

  return {
    useCaseId: uiUseCase.id,
    priority,
    quadrant,
    revenue: uiUseCase.calculatedRevenue,
    savings: uiUseCase.calculatedSavings,
    timeline: uiUseCase.timeline,

    // anil ADD THESE 6 FIELDS:
    name: uiUseCase.name,
    category: uiUseCase.category,
    problem: uiUseCase.problem,
    agentRole: uiUseCase.agentRole,
    dataRequired: uiUseCase.dataRequired,
    integration: uiUseCase.integration,
  };
}
