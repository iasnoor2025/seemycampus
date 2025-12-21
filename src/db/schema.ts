import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, serial, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Colleges table
export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default("India"),
  description: text("description"),
  images: jsonb("images").$type<string[]>().default([]),
  brochureUrl: varchar("brochure_url", { length: 500 }),
  website: varchar("website", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  isAcademicAlliance: boolean("is_academic_alliance").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  description: text("description"),
  duration: varchar("duration", { length: 50 }),
  fees: integer("fees"),
  feesCurrency: varchar("fees_currency", { length: 10 }).default("INR"),
  studyMode: varchar("study_mode", { length: 50 }), // online, offline, hybrid
  level: varchar("level", { length: 50 }), // undergraduate, graduate, diploma, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student answers (quiz responses)
export const studentAnswers = pgTable("student_answers", {
  id: serial("id").primaryKey(),
  interests: jsonb("interests").$type<string[]>().default([]),
  preferredLocation: varchar("preferred_location", { length: 255 }),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  budgetCurrency: varchar("budget_currency", { length: 10 }).default("INR"),
  studyMode: varchar("study_mode", { length: 50 }), // online, offline, hybrid
  academicLevel: varchar("academic_level", { length: 50 }), // high_school, undergraduate, graduate
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  quizData: jsonb("quiz_data").$type<Record<string, any>>(),
  studentAnswerId: integer("student_answer_id").references(() => studentAnswers.id),
  source: varchar("source", { length: 50 }).default("quiz"), // quiz, chat, form, etc.
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, qualified, converted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table (for NextAuth)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: varchar("image", { length: 500 }),
  password: varchar("password", { length: 255 }), // hashed password
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Accounts table (for NextAuth OAuth)
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: varchar("token_type", { length: 50 }),
  scope: varchar("scope", { length: 255 }),
  idToken: text("id_token"),
  sessionState: varchar("session_state", { length: 255 }),
});

// Sessions table (for NextAuth)
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expires: timestamp("expires").notNull(),
});

// Verification tokens (for NextAuth)
export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires").notNull(),
});

// Relations
export const collegesRelations = relations(colleges, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  college: one(colleges, {
    fields: [courses.collegeId],
    references: [colleges.id],
  }),
}));

export const studentAnswersRelations = relations(studentAnswers, ({ one }) => ({
  lead: one(leads, {
    fields: [studentAnswers.id],
    references: [leads.studentAnswerId],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  studentAnswer: one(studentAnswers, {
    fields: [leads.studentAnswerId],
    references: [studentAnswers.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

