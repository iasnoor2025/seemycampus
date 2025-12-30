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
  googlePlaceId: varchar("google_place_id", { length: 255 }), // Google Maps Place ID for reviews
  // JSONB fields for quick access to aggregated data
  cutoffData: jsonb("cutoff_data").$type<Record<string, any>>(), // Aggregated cutoff data for quick access
  placementData: jsonb("placement_data").$type<Record<string, any>>(), // Aggregated placement data for quick access
  rankingData: jsonb("ranking_data").$type<Record<string, any>>(), // Aggregated ranking data for quick access
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
  counselorId: integer("counselor_id").references(() => users.id, { onDelete: "set null" }), // Assigned counselor
  source: varchar("source", { length: 50 }).default("quiz"), // quiz, chat, form, etc.
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, qualified, converted
  phoneVerified: boolean("phone_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Phone verification OTP table
export const phoneVerifications = pgTable("phone_verifications", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table (for NextAuth)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: varchar("image", { length: 500 }),
  password: varchar("password", { length: 255 }), // hashed password
  role: varchar("role", { length: 50 }).default("student"), // admin, moderator, staff, counselor, student
  isApproved: boolean("is_approved").default(false), // Admin approval required
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
  category: varchar("category", { length: 100 }), // academics, infrastructure, placements, campus_life, faculty
  isVerified: boolean("is_verified").default(false), // Admin verified (verified student badge)
  isApproved: boolean("is_approved").default(false), // Admin approved for display
  helpfulCount: integer("helpful_count").default(0), // Number of helpful votes
  notHelpfulCount: integer("not_helpful_count").default(0), // Number of not helpful votes
  photos: jsonb("photos").$type<string[]>().default([]), // Photos uploaded with review
  videoUrl: varchar("video_url", { length: 500 }), // Video review URL
  replyFromCollege: text("reply_from_college"), // College's response to the review
  replyDate: timestamp("reply_date"), // Date when college replied
  // External review fields
  source: varchar("source", { length: 50 }), // 'internal', 'google_maps', 'college_website', 'internet'
  externalId: varchar("external_id", { length: 255 }), // External review ID for deduplication
  externalUrl: varchar("external_url", { length: 500 }), // Link to original review
  externalDate: timestamp("external_date"), // Original review date from external source
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

// Counseling Packages table
export const counselingPackages = pgTable("counseling_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Basic, Premium, VIP
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(),
  currency: varchar("currency", { length: 10 }).default("INR"),
  duration: integer("duration").notNull(), // Duration in minutes
  sessions: integer("sessions").notNull(), // Number of sessions included
  features: jsonb("features").$type<string[]>().default([]), // List of features
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Counselors table
export const counselors = pgTable("counselors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  bio: text("bio"),
  specialization: jsonb("specialization").$type<string[]>().default([]), // Areas of expertise
  experience: integer("experience"), // Years of experience
  qualifications: jsonb("qualifications").$type<string[]>().default([]),
  imageUrl: varchar("image_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Counseling Bookings table
export const counselingBookings = pgTable("counseling_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  packageId: integer("package_id").references(() => counselingPackages.id).notNull(),
  counselorId: integer("counselor_id").references(() => counselors.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  preferredDate: timestamp("preferred_date"),
  preferredTime: varchar("preferred_time", { length: 50 }), // e.g., "10:00 AM"
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, completed, cancelled
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // pending, paid, refunded
  paymentId: varchar("payment_id", { length: 255 }), // Payment gateway transaction ID
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("INR"),
  notes: text("notes"), // Student notes or requirements
  counselorNotes: text("counselor_notes"), // Counselor's notes
  sessionLink: varchar("session_link", { length: 500 }), // Meeting link for the session
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Blog Posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"), // Short description for listings
  content: text("content").notNull(), // Full blog content (can be markdown or HTML)
  authorId: integer("author_id").references(() => users.id), // Author user ID
  authorName: varchar("author_name", { length: 255 }), // Author name (if not linked to user)
  category: varchar("category", { length: 100 }), // blog, tip, guide
  tags: jsonb("tags").$type<string[]>().default([]), // Blog tags
  featuredImage: varchar("featured_image", { length: 500 }), // Featured image URL
  seoTitle: varchar("seo_title", { length: 255 }), // SEO title
  seoDescription: text("seo_description"), // SEO meta description
  publishedAt: timestamp("published_at"), // Publication date
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
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

// Cutoffs table - Store entrance exam cutoff data
export const cutoffs = pgTable("cutoffs", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  examName: varchar("exam_name", { length: 100 }).notNull(), // CAT, GMAT, JEE, NEET, etc.
  courseName: varchar("course_name", { length: 255 }), // MBA, B.Tech, MBBS, etc.
  year: integer("year").notNull(), // Year of cutoff (e.g., 2024)
  category: varchar("category", { length: 50 }), // General, OBC, SC, ST, EWS, etc.
  openingRank: integer("opening_rank"), // Opening rank for admission
  closingRank: integer("closing_rank"), // Closing rank for admission
  openingScore: integer("opening_score"), // Opening score/percentile
  closingScore: integer("closing_score"), // Closing score/percentile
  round: integer("round").default(1), // Round number (1, 2, 3, etc.)
  quota: varchar("quota", { length: 50 }), // All India, State, Management, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Placement Stats table - Detailed placement statistics
export const placementStats = pgTable("placement_stats", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  year: integer("year").notNull(), // Placement year (e.g., 2024)
  totalStudents: integer("total_students"), // Total students eligible for placement
  placedStudents: integer("placed_students"), // Number of students placed
  placementPercentage: integer("placement_percentage"), // Placement percentage
  averagePackage: integer("average_package"), // Average package in INR
  medianPackage: integer("median_package"), // Median package in INR
  highestPackage: integer("highest_package"), // Highest package in INR
  lowestPackage: integer("lowest_package"), // Lowest package in INR
  topRecruiters: jsonb("top_recruiters").$type<string[]>().default([]), // List of top recruiting companies
  departmentWiseData: jsonb("department_wise_data").$type<Record<string, any>>(), // Department-wise placement stats
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// College Rankings table - Multiple ranking sources
export const collegeRankings = pgTable("college_rankings", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  rankingSource: varchar("ranking_source", { length: 100 }).notNull(), // NIRF, QS, Times, Outlook, etc.
  year: integer("year").notNull(), // Year of ranking (e.g., 2024)
  rank: integer("rank").notNull(), // Rank number
  category: varchar("category", { length: 100 }), // Overall, Engineering, Management, Medical, etc.
  score: integer("score"), // Ranking score if available
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional ranking metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
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

export const cutoffsRelations = relations(cutoffs, ({ one }) => ({
  college: one(colleges, {
    fields: [cutoffs.collegeId],
    references: [colleges.id],
  }),
}));

export const placementStatsRelations = relations(placementStats, ({ one }) => ({
  college: one(colleges, {
    fields: [placementStats.collegeId],
    references: [colleges.id],
  }),
}));

export const collegeRankingsRelations = relations(collegeRankings, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeRankings.collegeId],
    references: [colleges.id],
  }),
}));

// College Infrastructure table - Labs, library, facilities
export const collegeInfrastructure = pgTable("college_infrastructure", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  facilityType: varchar("facility_type", { length: 100 }).notNull(), // lab, library, auditorium, sports, etc.
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Computer Lab 1", "Central Library"
  description: text("description"), // Detailed description
  capacity: integer("capacity"), // Capacity (e.g., number of students, seats)
  images: jsonb("images").$type<string[]>().default([]), // Images of the facility
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional metadata (equipment, features, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// College Hostels table - Hostel information
export const collegeHostels = pgTable("college_hostels", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  hostelName: varchar("hostel_name", { length: 255 }).notNull(), // e.g., "Boys Hostel A", "Girls Hostel"
  type: varchar("type", { length: 50 }).notNull(), // boys, girls, co-ed
  capacity: integer("capacity"), // Number of rooms/beds
  fees: integer("fees"), // Hostel fees per year
  facilities: jsonb("facilities").$type<string[]>().default([]), // WiFi, AC, Mess, Laundry, etc.
  rules: text("rules"), // Hostel rules and regulations
  images: jsonb("images").$type<string[]>().default([]), // Images of the hostel
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// College Faculty table - Faculty information
export const collegeFaculty = pgTable("college_faculty", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 100 }), // Professor, Associate Professor, Assistant Professor, etc.
  department: varchar("department", { length: 255 }), // Department name
  qualifications: text("qualifications"), // Educational qualifications
  experience: integer("experience"), // Years of experience
  email: varchar("email", { length: 255 }),
  photo: varchar("photo", { length: 500 }), // Photo URL
  bio: text("bio"), // Biography
  achievements: jsonb("achievements").$type<string[]>().default([]), // Awards, publications, etc.
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Infrastructure Relations
export const collegeInfrastructureRelations = relations(collegeInfrastructure, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeInfrastructure.collegeId],
    references: [colleges.id],
  }),
}));

export const collegeHostelsRelations = relations(collegeHostels, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeHostels.collegeId],
    references: [colleges.id],
  }),
}));

export const collegeFacultyRelations = relations(collegeFaculty, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeFaculty.collegeId],
    references: [colleges.id],
  }),
}));

// Application Guides table - Application form assistance
export const applicationGuides = pgTable("application_guides", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }), // Optional - course-specific guide
  guideContent: text("guide_content").notNull(), // Step-by-step application guide
  requiredDocs: jsonb("required_docs").$type<string[]>().default([]), // List of required documents
  feeInfo: jsonb("fee_info").$type<Record<string, any>>(), // Application fee details { amount, currency, paymentMethods, paymentLink }
  deadlines: jsonb("deadlines").$type<Record<string, any>>(), // Important dates { applicationStart, applicationEnd, documentSubmission, etc. }
  tips: text("tips"), // Form filling tips and common mistakes
  applicationUrl: varchar("application_url", { length: 500 }), // Link to application form
  contactInfo: jsonb("contact_info").$type<Record<string, any>>(), // Contact details for application queries
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Application Guides Relations
export const applicationGuidesRelations = relations(applicationGuides, ({ one }) => ({
  college: one(colleges, {
    fields: [applicationGuides.collegeId],
    references: [colleges.id],
  }),
  course: one(courses, {
    fields: [applicationGuides.courseId],
    references: [courses.id],
  }),
}));

// College Inquiries table - Contact & Inquiry System
export const collegeInquiries = pgTable("college_inquiries", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  studentId: integer("student_id").references(() => users.id, { onDelete: "set null" }), // Optional - can be anonymous
  inquiryType: varchar("inquiry_type", { length: 100 }).notNull(), // admission, course, fee, scholarship, general
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, responded, resolved, closed
  response: text("response"), // College/admin response
  respondedBy: integer("responded_by").references(() => users.id, { onDelete: "set null" }), // Admin/college staff who responded
  respondedAt: timestamp("responded_at"),
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// College Inquiries Relations
export const collegeInquiriesRelations = relations(collegeInquiries, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeInquiries.collegeId],
    references: [colleges.id],
  }),
  student: one(users, {
    fields: [collegeInquiries.studentId],
    references: [users.id],
  }),
  responder: one(users, {
    fields: [collegeInquiries.respondedBy],
    references: [users.id],
  }),
}));

// Site Settings table - Store site-wide settings like contact information
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., "contact_email", "contact_phone", "contact_address"
  value: text("value"), // The actual value
  label: varchar("label", { length: 255 }), // Human-readable label
  category: varchar("category", { length: 50 }).default("general"), // general, contact, social, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// College News table - News & Updates
export const collegeNews = pgTable("college_news", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // admissions, placements, events, achievements, general
  image: varchar("image", { length: 500 }), // Featured image URL
  author: integer("author").references(() => users.id, { onDelete: "set null" }),
  tags: jsonb("tags").$type<string[]>().default([]), // Array of tags
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// College News Relations
export const collegeNewsRelations = relations(collegeNews, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeNews.collegeId],
    references: [colleges.id],
  }),
  authorUser: one(users, {
    fields: [collegeNews.author],
    references: [users.id],
  }),
}));

// Feature Flags table - Enable/disable features and pages
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(), // e.g., "dashboard_leads", "public_colleges", "feature_chat"
  name: varchar("name", { length: 255 }).notNull(), // Display name
  description: text("description"), // Description of the feature
  category: varchar("category", { length: 100 }).notNull(), // "dashboard", "public_page", "feature"
  isEnabled: boolean("is_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Update colleges relations to include new tables
export const collegesRelations = relations(colleges, ({ many }) => ({
  courses: many(courses),
  reviews: many(collegeReviews),
  savedBy: many(savedColleges),
  scholarships: many(scholarships),
  cutoffs: many(cutoffs),
  placementStats: many(placementStats),
  rankings: many(collegeRankings),
  infrastructure: many(collegeInfrastructure),
  hostels: many(collegeHostels),
  faculty: many(collegeFaculty),
  applicationGuides: many(applicationGuides),
  inquiries: many(collegeInquiries),
  news: many(collegeNews),
}));

