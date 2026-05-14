import { z } from "zod";

export const LanguageCodeSchema = z.enum(["uz-Latn", "uz-Cyrl", "ru", "en"]);
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;

export const UserRoleSchema = z.enum(["USER", "ADMIN", "SUPER_ADMIN"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UsernameSchema = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-z0-9_]+$/);

export const PhoneSchema = z
  .string()
  .regex(/^\+?998\d{9}$|^998\d{9}$|^8\d{9,12}$/);

export const RegisterSchema = z.object({
  phone: PhoneSchema,
  password: z.string().min(8).max(128),
});

export const VerifyOtpSchema = z.object({
  otpToken: z.string().min(16),
  code: z.string().length(6),
});

export const LoginSchema = z.object({
  phone: PhoneSchema,
  password: z.string().min(1).max(128),
});

export const ProfileSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  username: UsernameSchema,
  businessName: z.string().max(120).optional(),
  city: z.string().max(80).optional(),
  bio: z.string().max(200).optional(),
});

export const GroupVisibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);
export type GroupVisibility = z.infer<typeof GroupVisibilitySchema>;

export const CreateGroupSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  visibility: GroupVisibilitySchema,
});

export const MessageKindSchema = z.enum([
  "TEXT",
  "IMAGE",
  "VIDEO",
  "VIDEO_NOTE",
  "VOICE",
]);
export type MessageKind = z.infer<typeof MessageKindSchema>;

export const SendMessageSchema = z.object({
  kind: MessageKindSchema.default("TEXT"),
  text: z.string().max(4000).optional(),
  mediaId: z.string().uuid().optional(),
  replyToId: z.string().uuid().optional(),
});

export const LessonStatusSchema = z.enum([
  "DRAFT",
  "PROCESSING",
  "PUBLISHED",
  "ARCHIVED",
  "FAILED",
]);
export type LessonStatus = z.infer<typeof LessonStatusSchema>;

export const LocaleTextSchema = z.object({
  "uz-Latn": z.string(),
  "uz-Cyrl": z.string(),
  ru: z.string(),
  en: z.string(),
});
export type LocaleText = z.infer<typeof LocaleTextSchema>;

export type ApiProblem = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Array<{ field: string; code: string }>;
};

export const reservedUsernames = [
  "admin",
  "api",
  "biznesjon",
  "help",
  "support",
  "root",
  "system",
] as const;
