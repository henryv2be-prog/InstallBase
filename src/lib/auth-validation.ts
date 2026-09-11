import type { ExperienceLevel } from "@/generated/prisma/client";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const NAME_MAX_LENGTH = 100;

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "APPRENTICE",
  "ONE_TO_THREE",
  "THREE_TO_FIVE",
  "FIVE_TO_TEN",
  "TEN_PLUS",
];

export type SignupField =
  | "name"
  | "username"
  | "email"
  | "password"
  | "city"
  | "country"
  | "experience";

export type SignupInput = {
  name: string;
  username: string;
  email: string;
  password: string;
  city: string;
  country: string;
  experience: string;
};

export type SignupValidationErrors = Partial<Record<SignupField, string>>;

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`;
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address";
  }
  return null;
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim().toLowerCase();
  if (!trimmed) return "Username is required";
  if (trimmed.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
  }
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return `Username must be ${USERNAME_MAX_LENGTH} characters or fewer`;
  }
  if (!/^[a-z0-9_]+$/.test(trimmed)) {
    return "Username can only use lowercase letters, numbers, and underscores";
  }
  return null;
}

export function validateAccountInput(
  input: Pick<SignupInput, "name" | "username" | "email" | "password">
): SignupValidationErrors {
  const errors: SignupValidationErrors = {};

  const name = input.name.trim();
  if (!name) errors.name = "Full name is required";
  else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer`;
  }

  const usernameError = validateUsername(input.username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(input.password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validateProfessionalSignupInput(
  input: Pick<SignupInput, "city" | "country" | "experience">,
  required: boolean
): SignupValidationErrors {
  const errors: SignupValidationErrors = {};

  if (!required) return errors;

  if (!input.country.trim()) errors.country = "Country is required";
  if (!input.city.trim()) errors.city = "City is required";

  if (!input.experience || !EXPERIENCE_LEVELS.includes(input.experience as ExperienceLevel)) {
    errors.experience = "Please choose your experience level";
  }

  return errors;
}

export function validateSignupInput(
  input: SignupInput,
  options: { requireProfessional?: boolean } = {}
): SignupValidationErrors {
  return {
    ...validateAccountInput(input),
    ...validateProfessionalSignupInput(input, options.requireProfessional ?? true),
  };
}

export function signupStepForField(field: SignupField, requireProfessional = true): 1 | 2 | 3 {
  if (field === "name" || field === "username" || field === "email" || field === "password") {
    return 1;
  }
  if (field === "experience" || field === "country" || field === "city") {
    return requireProfessional ? 3 : 2;
  }
  return 2;
}

export function firstSignupError(errors: SignupValidationErrors): {
  field: SignupField;
  message: string;
} | null {
  const order: SignupField[] = [
    "name",
    "username",
    "email",
    "password",
    "experience",
    "country",
    "city",
  ];
  for (const field of order) {
    const message = errors[field];
    if (message) return { field, message };
  }
  return null;
}
