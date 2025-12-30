// Audrey's 12 Use Cases with Baseline ROI Projections

export const AUDREY_PAIN_POINTS = [
  // Use Case 1: Automated Salesforce Opportunity Creation
  {
    id: "pp1",
    category: "Revenue & Growth" as const,
    question: "What would unlock 10% more revenue without headcount?",
    response: "Sellers without Salesforce access must complete manual forms, delaying opportunity creation by 3+ days.",
    theme: "Sales" as const
  },
  
  // Use Case 2: Intelligent Service Model Selection
  {
    id: "pp2",
    category: "Revenue & Growth" as const,
    question: "Which corridors are currently undermonetized?",
    response: "Complex service model selection (Correspondent vs. Sponsored vs. Treasury) requires manual battlecard review.",
    theme: "Pricing" as const
  },
  
  // Use Case 3: Automated NDA Verification
  {
    id: "pp3",
    category: "Accuracy & Risk" as const,
    question: "Which deals require the most back-and-forth for approval?",
    response: "Manual NDA verification (Visa vs. Non-Visa members) delays Discovery stage entry by 1-2 weeks.",
    theme: "Sales" as const
  },
  
  // Use Case 4: Automated Eligibility & Compliance Checks
  {
    id: "pp4",
    category: "Accuracy & Risk" as const,
    question: "Where do compliance risks arise?",
    response: "Manual eligibility checks for 'Collecting Fund Worldwide', 'Restricted Countries' lists, adverse media, sanctions screening, and AML/Financial Crime policies.",
    theme: "RevOps" as const
  },
  
  // Use Case 5: Automated Discovery Approval Routing
  {
    id: "pp5",
    category: "Time & Efficiency" as const,
    question: "Where are you leaving money on the table?",
    response: "Discovery Approval takes 3 days; Solution Approval takes another 3 days. Manual handoffs slow deal velocity.",
    theme: "Sales" as const
  },
  
  // Use Case 6: Automated Solution Approval & Technical Feasibility
  {
    id: "pp6",
    category: "Time & Efficiency" as const,
    question: "Which manual processes create bottlenecks?",
    response: "Solution Approval requires manual coordination between seller and solutioning team, adding 14-26 days to the process.",
    theme: "RevOps" as const
  },
  
  // Use Case 7: Automated Order Review & Validation
  {
    id: "pp7",
    category: "Time & Efficiency" as const,
    question: "Where do you spend time on work that should be automated?",
    response: "Sales Ops manually reviews every order (1-2 hours per order) to compare contract details against order forms.",
    theme: "RevOps" as const
  },
  
  // Use Case 8: Intelligent Finance Approval Routing
  {
    id: "pp8",
    category: "Time & Efficiency" as const,
    question: "Which manual processes create bottlenecks?",
    response: "Finance approval routing is manual; rejections require full resubmission and re-review cycles.",
    theme: "RevOps" as const
  },
  
  // Use Case 9: Automated Pricing Error Detection
  {
    id: "pp9",
    category: "Accuracy & Risk" as const,
    question: "Where do pricing errors happen most frequently?",
    response: "Manual verification of Start Dates, OTCs, SaaS tiering, and MMC tiering leads to billing errors.",
    theme: "Pricing" as const
  },
  
  // Use Case 10: Intelligent Support Ticket Triage
  {
    id: "pp10",
    category: "Intelligence & Insights" as const,
    question: "What takes your Sales Ops team the longest?",
    response: "Manually determining if support tickets are 'In Scope' (system error) or 'Out of Scope' (user error).",
    theme: "Customer" as const
  },
  
  // Use Case 11: Automated Issue Reproduction & Evidence Capture
  {
    id: "pp11",
    category: "Intelligence & Insights" as const,
    question: "Where do you lack visibility into user issues?",
    response: "Support agents must manually 'Login As' requester to reproduce issues, wasting time on context switching.",
    theme: "Customer" as const
  },
  
  // Use Case 12: Automated Screenshot Capture & Documentation
  {
    id: "pp12",
    category: "Accuracy & Risk" as const,
    question: "Where do you lack confidence due to incomplete data?",
    response: "Screenshots must be manually captured and attached to tickets to prove resolution to users.",
    theme: "Customer" as const
  }
];

// Baseline ROI Projections for each use case
// Assumptions based on typical cross-border payments business metrics
export const BASELINE_ROI_PROJECTIONS = {
  pp1: {
    name: "Automated Salesforce Opportunity Creation",
    category: "Sales",
    problem: "Sellers without Salesforce access must complete manual forms, delaying opportunity creation by 3+ days, reducing deal velocity and sales productivity.",
    agentRole: "Automatically create and update Salesforce opportunities from form submissions, validate data completeness, route for approval, and notify sellers of status changes.",
    dataRequired: "Seller information, client details, deal parameters, approval workflows",
    integration: "Salesforce Sales Cloud, Email, Forms API",
    revenueImpact: "$450,000 annually from 15% faster deal closure on 50 deals/year at $60k average deal size",
    costSavings: "$85,000 annually from eliminating 2 hours/week of admin overhead across 10 sellers",
    riskReduction: "Reduce opportunity data errors by 60% through automated validation",
    timeToValue: "6-8 weeks",
    calculatedRevenue: 450000,
    calculatedSavings: 85000,
    calculatedEfficiency: 20, // hours saved per week
    agentCount: "1",
    dataCloud: "50k",
    timeline: "Q1 2026"
  },
  
  pp2: {
    name: "Intelligent Service Model Selection",
    category: "Pricing",
    problem: "Complex service model selection (Correspondent vs. Sponsored vs. Treasury) requires manual battlecard review, slowing deal qualification and increasing risk of model misalignment.",
    agentRole: "Analyze client regulatory status, flow of funds, and business model to recommend optimal service model (Correspondent/Sponsored/Treasury) with confidence scoring and compliance validation.",
    dataRequired: "Client regulatory status, jurisdiction data, flow of funds patterns, historical service model selections",
    integration: "Salesforce, Compliance databases, Currencycloud service model rules engine",
    revenueImpact: "$280,000 annually from 8% increase in deal win rate through faster, more accurate model selection",
    costSavings: "$120,000 annually from reducing seller time spent on battlecard review by 3 hours/deal",
    riskReduction: "Reduce service model misalignment by 70%, preventing compliance issues and client churn",
    timeToValue: "8-10 weeks",
    calculatedRevenue: 280000,
    calculatedSavings: 120000,
    calculatedEfficiency: 15,
    agentCount: "1",
    dataCloud: "75k",
    timeline: "Q1 2026"
  },
  
  pp3: {
    name: "Automated NDA Verification & Routing",
    category: "Sales",
    problem: "Manual NDA verification (Visa vs. Non-Visa members) delays Discovery stage entry by 1-2 weeks, creating deal velocity bottlenecks.",
    agentRole: "Automatically verify NDA status based on client type (Visa/Non-Visa), check existing NDA database, generate NDA requests, track signature status, and auto-approve Discovery stage entry when complete.",
    dataRequired: "Client membership status, NDA database, signature tracking, approval workflows",
    integration: "Salesforce, DocuSign, Visa member database",
    revenueImpact: "$380,000 annually from 12% faster time-to-close by eliminating 1-2 week NDA delays",
    costSavings: "$65,000 annually from reducing manual NDA tracking and follow-up",
    riskReduction: "Eliminate 100% of deals proceeding without proper NDA coverage",
    timeToValue: "4-6 weeks",
    calculatedRevenue: 380000,
    calculatedSavings: 65000,
    calculatedEfficiency: 10,
    agentCount: "1",
    dataCloud: "30k",
    timeline: "Jan 31st 2025"
  },
  
  pp4: {
    name: "Automated Eligibility & Compliance Checks",
    category: "RevOps",
    problem: "Manual eligibility checks across multiple lists (Collecting Fund Worldwide, Restricted Countries, prohibited industries, sanctions, adverse media, AML policies) create compliance risk and delay deals by weeks.",
    agentRole: "Automatically run comprehensive compliance checks against all required lists, perform adverse media screening using AI, validate AML/Financial Crime policies, flag risks with severity scoring, and route to compliance team when needed.",
    dataRequired: "Client jurisdiction data, beneficial ownership, industry classification, sanctions lists, adverse media sources, AML policy database",
    integration: "Salesforce, Compliance databases, Adverse media APIs, Sanctions screening services",
    revenueImpact: "$520,000 annually from 18% reduction in deal cycle time by eliminating compliance bottlenecks",
    costSavings: "$180,000 annually from reducing manual compliance review time by 80%",
    riskReduction: "Reduce compliance violations by 90%, preventing regulatory fines and reputational damage",
    timeToValue: "10-12 weeks",
    calculatedRevenue: 520000,
    calculatedSavings: 180000,
    calculatedEfficiency: 25,
    agentCount: "2",
    dataCloud: "150k",
    timeline: "Q1 2026"
  },
  
  pp5: {
    name: "Automated Discovery Approval Routing",
    category: "Sales",
    problem: "Discovery Approval takes 3 days with manual handoffs, creating unnecessary delays in moving deals to Solution stage.",
    agentRole: "Automatically evaluate Discovery Approval criteria, route to appropriate approvers based on deal parameters, send reminders, escalate stalled approvals, and auto-advance to Solution stage upon approval.",
    dataRequired: "Discovery form data, approval criteria, approver assignments, deal parameters",
    integration: "Salesforce, Email, Slack",
    revenueImpact: "$340,000 annually from 10% faster deal velocity by reducing Discovery approval time from 3 days to 4 hours",
    costSavings: "$95,000 annually from eliminating manual approval tracking and follow-up",
    riskReduction: "Reduce approval bottlenecks by 85%, preventing deal stagnation",
    timeToValue: "4-6 weeks",
    calculatedRevenue: 340000,
    calculatedSavings: 95000,
    calculatedEfficiency: 12,
    agentCount: "1",
    dataCloud: "40k",
    timeline: "Jan 31st 2025"
  },
  
  pp6: {
    name: "Automated Solution Approval & Technical Feasibility",
    category: "RevOps",
    problem: "Solution Approval requires manual coordination between seller and solutioning team, adding 14-26 days to the sales cycle.",
    agentRole: "Automatically assign solutioner based on expertise and capacity, create project overview, gather solution requirements, validate technical feasibility against known blockers, route for approval, and track timeline.",
    dataRequired: "Solutioner availability, expertise mapping, technical requirements, known blockers, project templates",
    integration: "Salesforce, Project management tools, Technical documentation",
    revenueImpact: "$620,000 annually from 20% reduction in sales cycle length by cutting Solution phase from 14-26 days to 7-10 days",
    costSavings: "$145,000 annually from reducing manual coordination overhead",
    riskReduction: "Reduce technical feasibility errors by 75%, preventing late-stage deal failures",
    timeToValue: "8-10 weeks",
    calculatedRevenue: 620000,
    calculatedSavings: 145000,
    calculatedEfficiency: 18,
    agentCount: "1",
    dataCloud: "60k",
    timeline: "Q1 2026"
  },
  
  pp7: {
    name: "Automated Order Review & Validation",
    category: "RevOps",
    problem: "Sales Ops manually reviews every order (1-2 hours per order) to compare contract details against order forms, creating bottlenecks and billing errors.",
    agentRole: "Automatically compare closed opportunity contract details against order forms, validate Start Dates (first of month), OTCs, SaaS tiering, MMC tiering, check renewal orders, flag discrepancies, and route for approval.",
    dataRequired: "Opportunity contract data, order forms, pricing rules, renewal history",
    integration: "Salesforce CPQ, Order management system",
    revenueImpact: "$180,000 annually from 5% revenue protection by catching billing errors before they occur",
    costSavings: "$240,000 annually from reducing order review time from 1-2 hours to 10 minutes per order (assuming 200 orders/year)",
    riskReduction: "Reduce billing errors by 85%, preventing revenue leakage and customer disputes",
    timeToValue: "6-8 weeks",
    calculatedRevenue: 180000,
    calculatedSavings: 240000,
    calculatedEfficiency: 30,
    agentCount: "1",
    dataCloud: "50k",
    timeline: "Q1 2026"
  },
  
  pp8: {
    name: "Intelligent Finance Approval Routing",
    category: "RevOps",
    problem: "Finance approval routing is manual; rejections require full resubmission and re-review cycles, wasting time and delaying revenue recognition.",
    agentRole: "Automatically route orders to finance approvers, validate completeness before submission, provide context and recommendations, track approval status, identify rejection patterns, and enable one-click resubmission with corrections.",
    dataRequired: "Order data, approval criteria, rejection history, approver assignments",
    integration: "Salesforce, Finance systems, Email",
    revenueImpact: "$220,000 annually from 7% faster revenue recognition through streamlined approvals",
    costSavings: "$110,000 annually from reducing approval cycle time and eliminating rework",
    riskReduction: "Reduce approval rejections by 60% through pre-submission validation",
    timeToValue: "4-6 weeks",
    calculatedRevenue: 220000,
    calculatedSavings: 110000,
    calculatedEfficiency: 14,
    agentCount: "1",
    dataCloud: "35k",
    timeline: "Jan 31st 2025"
  },
  
  pp9: {
    name: "Automated Pricing Error Detection",
    category: "Pricing",
    problem: "Manual verification of Start Dates, OTCs, SaaS tiering, and MMC tiering leads to billing errors that cause revenue leakage and customer disputes.",
    agentRole: "Automatically validate all pricing components (Start Dates, OTCs, SaaS tiers, MMC tiers) against pricing rules, detect anomalies, flag errors before billing, and suggest corrections.",
    dataRequired: "Pricing rules, tiering structures, contract data, billing history",
    integration: "Salesforce CPQ, Billing system, Pricing engine",
    revenueImpact: "$420,000 annually from 12% revenue protection by preventing pricing errors and underbilling",
    costSavings: "$85,000 annually from reducing manual pricing validation time",
    riskReduction: "Reduce pricing errors by 90%, preventing customer disputes and revenue leakage",
    timeToValue: "6-8 weeks",
    calculatedRevenue: 420000,
    calculatedSavings: 85000,
    calculatedEfficiency: 10,
    agentCount: "1",
    dataCloud: "45k",
    timeline: "Q1 2026"
  },
  
  pp10: {
    name: "Intelligent Support Ticket Triage",
    category: "Customer",
    problem: "Manually determining if support tickets are 'In Scope' (system error) or 'Out of Scope' (user error) wastes time and delays resolution.",
    agentRole: "Automatically analyze support ticket content, classify as In Scope vs. Out of Scope using AI, route to appropriate team, suggest resolution paths, and flag tickets requiring escalation.",
    dataRequired: "Historical ticket data, resolution patterns, error classifications, user behavior data",
    integration: "Salesforce Service Cloud, Knowledge base",
    revenueImpact: "$95,000 annually from 3% reduction in churn through faster issue resolution",
    costSavings: "$160,000 annually from reducing average ticket resolution time by 40%",
    riskReduction: "Reduce misclassified tickets by 80%, improving customer satisfaction",
    timeToValue: "6-8 weeks",
    calculatedRevenue: 95000,
    calculatedSavings: 160000,
    calculatedEfficiency: 20,
    agentCount: "1",
    dataCloud: "70k",
    timeline: "Q2 2026"
  },
  
  pp11: {
    name: "Automated Issue Reproduction & Evidence Capture",
    category: "Customer",
    problem: "Support agents must manually 'Login As' requester to reproduce issues, wasting time on context switching and slowing resolution.",
    agentRole: "Automatically reproduce user issues by simulating user actions, capture relevant screenshots and logs, document reproduction steps, and attach evidence to tickets.",
    dataRequired: "User session data, system logs, UI state, reproduction scripts",
    integration: "Salesforce, Application monitoring tools, Screenshot APIs",
    revenueImpact: "$75,000 annually from 2% reduction in churn through improved support experience",
    costSavings: "$130,000 annually from reducing issue reproduction time by 70%",
    riskReduction: "Reduce unresolved tickets by 50% through better evidence capture",
    timeToValue: "8-10 weeks",
    calculatedRevenue: 75000,
    calculatedSavings: 130000,
    calculatedEfficiency: 16,
    agentCount: "1",
    dataCloud: "55k",
    timeline: "Q2 2026"
  },
  
  pp12: {
    name: "Automated Screenshot Capture & Documentation",
    category: "Customer",
    problem: "Screenshots must be manually captured and attached to tickets to prove resolution to users, creating documentation overhead.",
    agentRole: "Automatically capture screenshots at key resolution steps, annotate with explanations, attach to tickets, and generate resolution summaries for users.",
    dataRequired: "Ticket resolution steps, UI state, annotation templates",
    integration: "Salesforce Service Cloud, Screenshot tools, Documentation system",
    revenueImpact: "$50,000 annually from 1.5% reduction in churn through better communication",
    costSavings: "$95,000 annually from reducing documentation time by 60%",
    riskReduction: "Reduce documentation gaps by 85%, improving audit compliance",
    timeToValue: "4-6 weeks",
    calculatedRevenue: 50000,
    calculatedSavings: 95000,
    calculatedEfficiency: 12,
    agentCount: "1",
    dataCloud: "25k",
    timeline: "Q2 2026"
  }
};

// Summary metrics
export const TOTAL_BASELINE_ROI = {
  totalRevenue: 3630000, // $3.63M
  totalSavings: 1510000, // $1.51M
  totalROI: 5140000, // $5.14M
  totalEfficiency: 202, // hours saved per week
  totalAgents: 13,
  totalDataCloudCredits: "685k"
};
