import { z } from "zod";

export const stopSchema = z.object({
  name: z.string().trim().min(1, "Stop name is required").max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  arrivalDate: z.string().date().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const photoSchema = z.object({
  publicUrl: z.string().url(),
  storagePath: z.string().min(1).nullable(),
  isCover: z.boolean(),
});

export const travelStyleSchema = z.enum([
  "road-trip",
  "trek",
  "backpacking",
  "family",
  "solo",
  "weekend",
]);
export const difficultySchema = z.enum(["easy", "moderate", "hard"]);
export const seasonSchema = z.enum(["spring", "summer", "monsoon", "autumn", "winter"]);

export const journeySchema = z
  .object({
    title: z.string().trim().min(3, "Give your journey a title").max(140),
    description: z.string().trim().min(20, "Describe your journey in at least 20 characters"),
    tips: z.string().trim().max(2000).optional().nullable(),
    location: z.string().trim().min(2, "Where did you go?").max(120),
    startDate: z.string().date("Add a start date"),
    endDate: z.string().date("Add an end date"),
    travelStyle: travelStyleSchema.nullable(),
    difficulty: difficultySchema.nullable(),
    season: seasonSchema.nullable(),
    stops: z.array(stopSchema).min(2, "Add at least two stops to draw a route"),
    photos: z.array(photoSchema).default([]),
  })
  .refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type JourneyInput = z.infer<typeof journeySchema>;
export type StopInput = z.infer<typeof stopSchema>;
export type PhotoInput = z.infer<typeof photoSchema>;

export const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(2, "Enter your name").max(80),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscores only"),
});
