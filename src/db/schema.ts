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
  // Additional fields for comprehensive college data
  ranking: integer("ranking"), // College ranking
  establishedYear: integer("established_year"), // Year college was established
  accreditation: varchar("accreditation", { length: 255 }), // AICTE, UGC, etc.
  hostelFees: integer("hostel_fees"), // Hostel fees per year
  hostelFeesCurrency: varchar("hostel_fees_currency", { length: 10 }).default("INR"),
  averagePackage: integer("average_package"), // Average placement package
  highestPackage: integer("highest_package"), // Highest placement package
  placementCurrency: varchar("placement_currency", { length: 10 }).default("INR"),
  entranceExams: jsonb("entrance_exams").$type<string[]>().default([]), // CAT, GMAT, etc.
  ownership: varchar("ownership", { length: 50 }), // Private, Government, Public
  campusSize: varchar("campus_size", { length: 100 }), // e.g., "50 acres"
  totalStudents: integer("total_students"), // Total student enrollment
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
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // Link to user if logged in
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
  role: varchar("role", { length: 50 }).default("student"), // admin, student
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

// Categories table (for navigation menu)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Menu Courses table (for navigation menu course links) - directly linked to categories
export const menuCourses = pgTable("menu_courses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "cascade" }).notNull(),
  href: varchar("href", { length: 500 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hero Slides table (for homepage hero section carousel)
export const heroSlides = pgTable("hero_slides", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  subtitle: varchar("subtitle", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  buttonText: varchar("button_text", { length: 100 }),
  buttonLink: varchar("button_link", { length: 500 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hero Rotating Texts table
export const heroRotatingTexts = pgTable("hero_rotating_texts", {
  id: serial("id").primaryKey(),
  text: varchar("text", { length: 500 }).notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// College Reviews table
export const collegeReviews = pgTable("college_reviews", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  reviewerName: varchar("reviewer_name", { length: 255 }), // Name if not logged in
  reviewerEmail: varchar("reviewer_email", { length: 255 }), // Email if not logged in
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  review: text("review").notNull(),
  course: varchar("course", { length: 255 }), // Course they studied
  batch: varchar("batch", { length: 50 }), // Graduation year
  isVerified: boolean("is_verified").default(false), // Admin verified
  isApproved: boolean("is_approved").default(false), // Admin approved for display
  helpfulCount: integer("helpful_count").default(0), // Number of helpful votes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Entrance Exams table
export const entranceExams = pgTable("entrance_exams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // CAT, GMAT, JEE, etc.
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  examDate: timestamp("exam_date"), // Next exam date
  registrationStartDate: timestamp("registration_start_date"),
  registrationEndDate: timestamp("registration_end_date"),
  resultDate: timestamp("result_date"),
  officialWebsite: varchar("official_website", { length: 500 }),
  eligibility: text("eligibility"), // Eligibility criteria
  examPattern: text("exam_pattern"), // Exam pattern details
  cutOffs: jsonb("cut_offs").$type<Record<string, any>>(), // Cut-off scores by college/course
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events & Webinars table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  type: varchar("type", { length: 50 }).default("webinar"), // webinar, workshop, info_session, campus_tour
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  registrationDeadline: timestamp("registration_deadline"),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  platform: varchar("platform", { length: 100 }), // Zoom, Google Meet, Microsoft Teams, In-person
  meetingLink: varchar("meeting_link", { length: 500 }),
  location: varchar("location", { length: 255 }), // For in-person events
  organizer: varchar("organizer", { length: 255 }), // Organizer name/college
  organizerEmail: varchar("organizer_email", { length: 255 }),
  imageUrl: varchar("image_url", { length: 500 }),
  recordingUrl: varchar("recording_url", { length: 500 }), // For past webinars
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(true),
  tags: jsonb("tags").$type<string[]>().default([]), // Topics, categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Event Registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // Optional - for logged-in users
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  status: varchar("status", { length: 50 }).default("registered"), // registered, attended, cancelled
  reminderSent: boolean("reminder_sent").default(false),
  attended: boolean("attended").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  testimonial: text("testimonial").notNull(),
  photoUrl: varchar("photo_url", { length: 500 }), // Photo URL for testimonial
  avatarColor: varchar("avatar_color", { length: 50 }).default("blue"), // blue, purple, green, etc.
  date: timestamp("date").defaultNow().notNull(), // Date of testimonial
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Study Goals table (for "Select Your Study Goal" section)
export const studyGoals = pgTable("study_goals", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Engineering, Management, etc.
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }).notNull(), // GraduationCap, Briefcase, etc.
  collegeCount: varchar("college_count", { length: 100 }), // "6348 Colleges"
  courses: jsonb("courses").$type<string[]>().default([]), // ["BE/B.Tech", "Diploma in Engineering"]
  link: varchar("link", { length: 500 }), // "/colleges/engineering"
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Saved Colleges table (for student favorites)
export const savedColleges = pgTable("saved_colleges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scholarships table
export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  provider: varchar("provider", { length: 255 }), // Organization providing the scholarship
  amount: integer("amount"), // Scholarship amount
  amountCurrency: varchar("amount_currency", { length: 10 }).default("INR"),
  amountType: varchar("amount_type", { length: 50 }), // fixed, percentage, full_tuition, etc.
  eligibilityCriteria: text("eligibility_criteria"), // Detailed eligibility requirements
  applicationDeadline: timestamp("application_deadline"), // Application deadline
  applicationStartDate: timestamp("application_start_date"), // When applications open
  applicationUrl: varchar("application_url", { length: 500 }), // External application link
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  category: varchar("category", { length: 100 }), // merit-based, need-based, sports, etc.
  level: varchar("level", { length: 50 }), // undergraduate, graduate, diploma, etc.
  course: varchar("course", { length: 255 }), // Specific course if applicable
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "set null" }), // Optional college-specific scholarship
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const collegesRelations = relations(colleges, ({ many }) => ({
  courses: many(courses),
  reviews: many(collegeReviews),
  savedBy: many(savedColleges),
  scholarships: many(scholarships),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  college: one(colleges, {
    fields: [courses.collegeId],
    references: [colleges.id],
  }),
}));

export const studentAnswersRelations = relations(studentAnswers, ({ one }) => ({
  user: one(users, {
    fields: [studentAnswers.userId],
    references: [users.id],
  }),
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
  studentAnswers: many(studentAnswers),
  savedColleges: many(savedColleges),
  reviews: many(collegeReviews),
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

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuCourses: many(menuCourses),
}));

export const menuCoursesRelations = relations(menuCourses, ({ one }) => ({
  category: one(categories, {
    fields: [menuCourses.categoryId],
    references: [categories.id],
  }),
}));

export const collegeReviewsRelations = relations(collegeReviews, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeReviews.collegeId],
    references: [colleges.id],
  }),
  user: one(users, {
    fields: [collegeReviews.userId],
    references: [users.id],
  }),
}));

export const usersReviewsRelations = relations(users, ({ many }) => ({
  reviews: many(collegeReviews),
}));

export const savedCollegesRelations = relations(savedColleges, ({ one }) => ({
  user: one(users, {
    fields: [savedColleges.userId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [savedColleges.collegeId],
    references: [colleges.id],
  }),
}));

export const scholarshipsRelations = relations(scholarships, ({ one }) => ({
  college: one(colleges, {
    fields: [scholarships.collegeId],
    references: [colleges.id],
  }),
}));

