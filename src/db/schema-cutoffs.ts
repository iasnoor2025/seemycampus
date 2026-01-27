
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, serial, pgEnum, date, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
    colleges,
    courses,
    users,
    leads,
    studentAnswers,
    collegeReviews,
    scholarships,
    placementStats,
    collegeRankings,
    collegeInfrastructure,
    collegeHostels,
    collegeFaculty,
    applicationGuides,
    collegeInquiries,
    collegeNews,
    featuredColleges
} from "./schema";

// Cutoffs table - Stores past year cutoff data
export const cutoffs = pgTable("cutoffs", {
    id: serial("id").primaryKey(),
    collegeId: integer("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
    examName: varchar("exam_name", { length: 255 }).notNull(), // JEE Main, NEET, CAT, etc.
    courseName: varchar("course_name", { length: 255 }), // Computer Science, MBA, etc.
    category: varchar("category", { length: 100 }), // General, OBC, SC, ST, etc.
    year: integer("year").notNull(), // 2023, 2024
    round: integer("round").default(1), // Round 1, 2, 3...
    closingRank: integer("closing_rank"), // Closing Rank
    openingRank: integer("opening_rank"), // Opening Rank
    closingScore: integer("closing_score"), // Closing Score/Percentile
    openingScore: integer("opening_score"), // Opening Score/Percentile
    seatType: varchar("seat_type", { length: 100 }), // All India, Home State, etc.
    quota: varchar("quota", { length: 100 }), // AI, HS, OS
    gender: varchar("gender", { length: 50 }).default("Neutral"), // Neutral, Female, Male
    metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional details
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cutoff Relations
export const cutoffsRelations = relations(cutoffs, ({ one }) => ({
    college: one(colleges, {
        fields: [cutoffs.collegeId],
        references: [colleges.id],
    }),
}));
