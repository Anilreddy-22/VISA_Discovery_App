import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'), // 'user' or 'admin'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Sessions table - stores workshop sessions
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'), // 'draft' or 'completed'
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Pain points table - stores custom pain points added by users
export const painPoints = pgTable('pain_points', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // 'time', 'accuracy', 'intelligence', 'revenue'
  title: text('title').notNull(),
  description: text('description').notNull(),
  theme: text('theme'), // 'Pricing', 'Sales', 'RevOps', 'Customer', 'Competitive'
  priority: text('priority'), // 'H1', 'H2', 'TBD', 'Deprioritize'
  quadrant: text('quadrant'), // 'Quick Wins', 'Major Projects', 'Fill-in', 'Money Pit'
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Use cases table - stores the state of use cases (priority, ROI, etc.)
export const useCases = pgTable('use_cases', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  useCaseId: text('use_case_id').notNull(), // References the ID from painPoints.ts
  priority: text('priority'), // 'H1', 'H2', 'TBD', 'deprioritize', 'P1', 'P2', 'P3'
  quadrant: text('quadrant'), // 'quickWins', 'majorProjects', 'fillIns', 'moneyPit'
  revenue: integer('revenue'), // Custom revenue override
  savings: integer('savings'), // Custom savings override
  timeline: text('timeline'), // Custom timeline override

  // anil ADD THESE 6 LINES HERE:
  name: text('name'),
  category: text('category'),
  problem: text('problem'),
  agentRole: text('agent_role'),
  dataRequired: text('data_required'),
  integration: text('integration'),
  // END OF NEW LINES

  updatedBy: integer('updated_by').notNull().references(() => users.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Auth tokens table - for JWT session management
export const authTokens = pgTable('auth_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type PainPoint = typeof painPoints.$inferSelect;
export type NewPainPoint = typeof painPoints.$inferInsert;
export type UseCase = typeof useCases.$inferSelect;
export type NewUseCase = typeof useCases.$inferInsert;
export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;
