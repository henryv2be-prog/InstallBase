"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformPurposePicker } from "@/components/auth/platform-purpose-picker";
import { SignupStepIndicator } from "@/components/auth/signup-step-indicator";
import { SPECIALTIES } from "@/lib/constants";
import { registerUser } from "@/lib/actions";
import {
  PASSWORD_MIN_LENGTH,
  type SignupField,
  type SignupValidationErrors,
  firstSignupError,
  signupStepForField,
  validateAccountInput,
  validateProfessionalSignupInput,
} from "@/lib/auth-validation";
import {
  needsProfessionalDetails,
  purposeIdsToRoles,
  type PlatformPurposeId,
} from "@/lib/platform-roles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const experienceLevels = [
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "ONE_TO_THREE", label: "1–3 years" },
  { value: "THREE_TO_FIVE", label: "3–5 years" },
  { value: "FIVE_TO_TEN", label: "5–10 years" },
  { value: "TEN_PLUS", label: "10+ years" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>;
}

export function SignupForm({ next = "/feed" }: { next?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [purposes, setPurposes] = useState<PlatformPurposeId[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SignupValidationErrors>({});
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    experience: "THREE_TO_FIVE",
    country: "South Africa",
    city: "",
  });

  const selectedRoles = purposeIdsToRoles(purposes);
  const requireProfessional = needsProfessionalDetails(selectedRoles);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
    if (field in fieldErrors) {
      setFieldErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[field as SignupField];
        return nextErrors;
      });
    }
  };

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const inputClass = (field: SignupField) =>
    cn(fieldErrors[field] && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30");

  const applyValidationErrors = (errors: SignupValidationErrors, professionalRequired: boolean) => {
    setFieldErrors(errors);
    const first = firstSignupError(errors);
    if (first) {
      setStep(signupStepForField(first.field, professionalRequired));
      toast.error(first.message);
    }
  };

  const continueToStep2 = () => {
    const errors = validateAccountInput(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const first = errors.name || errors.username || errors.email || errors.password;
      if (first) toast.error(first);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setStep(2);
  };

  const continueFromPurposes = () => {
    if (requireProfessional) {
      setStep(3);
      return;
    }
    submitRegistration();
  };

  const submitRegistration = () => {
    setFormError(null);

    const errors = {
      ...validateAccountInput(form),
      ...validateProfessionalSignupInput(form, requireProfessional),
    };

    if (Object.keys(errors).length > 0) {
      applyValidationErrors(errors, requireProfessional);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("username", form.username.trim().toLowerCase());
    formData.append("email", form.email.trim().toLowerCase());
    formData.append("password", form.password);
    formData.append("experience", form.experience);
    formData.append("country", form.country.trim());
    formData.append("city", form.city.trim());
    purposes.forEach((purpose) => formData.append("purposes", purpose));
    specialties.forEach((s) => formData.append("specialties", s));

    startTransition(async () => {
      try {
        const result = await registerUser(formData);
        if (result.error) {
          setFormError(result.error);
          toast.error(result.error);

          if (result.field) {
            setFieldErrors((prev) => ({ ...prev, [result.field!]: result.error }));
            setStep(signupStepForField(result.field, result.requireProfessional ?? requireProfessional));
          } else if (result.errors) {
            applyValidationErrors(result.errors, result.requireProfessional ?? requireProfessional);
          }
          return;
        }

        toast.success("Welcome to InstallBase!");
        router.push(next);
      } catch {
        const message = "Something went wrong. Check your connection and try again.";
        setFormError(message);
        toast.error(message);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRegistration();
  };

  return (
    <Card className="glass-card w-full max-w-lg border-border/80 shadow-xl">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl tracking-tight">Join InstallBase</CardTitle>
        <p className="text-sm text-muted">
          Your work is your CV — connect with installers, share jobs, and grow your reputation.
        </p>
        <SignupStepIndicator step={step} />
      </CardHeader>
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit}>
          {formError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {formError}
            </p>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Full name</label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  placeholder="John Smith"
                  className={inputClass("name")}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                <FieldError message={fieldErrors.name} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Username</label>
                <Input
                  value={form.username}
                  onChange={(e) => update("username", e.target.value.toLowerCase())}
                  required
                  placeholder="johnsecurity"
                  pattern="[a-z0-9_]+"
                  className={inputClass("username")}
                  aria-invalid={Boolean(fieldErrors.username)}
                />
                <FieldError message={fieldErrors.username} />
                <p className="mt-1 text-xs text-muted">Lowercase letters, numbers, and underscores only.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  placeholder="you@company.com"
                  className={inputClass("email")}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                <FieldError message={fieldErrors.email} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                  className={inputClass("password")}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                <FieldError message={fieldErrors.password} />
              </div>
              <Button type="button" className="w-full" onClick={continueToStep2}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-base font-semibold">What brings you here?</h3>
                <p className="mt-1 text-sm text-muted">
                  Pick everything that fits. We&apos;ll tailor your experience — you can change this anytime in
                  settings.
                </p>
              </div>
              <PlatformPurposePicker value={purposes} onChange={setPurposes} disabled={pending} />
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" className="flex-1" onClick={continueFromPurposes} disabled={pending}>
                  {requireProfessional ? "Continue" : pending ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-semibold">Professional details</h3>
                <p className="mt-1 text-sm text-muted">
                  Help other installers understand your background. You can update this anytime.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) => {
                    const selected = specialties.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpecialty(s)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-blue-500/60 bg-blue-500/10 text-blue-700 dark:text-cyan-300"
                            : "border-border bg-card/50 text-muted hover:border-blue-400/40 hover:text-foreground"
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Experience level</label>
                <select
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  required
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-border bg-card/60 px-3 text-sm shadow-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                    fieldErrors.experience && "border-red-500"
                  )}
                  aria-invalid={Boolean(fieldErrors.experience)}
                >
                  {experienceLevels.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.experience} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Country</label>
                  <Input
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    required
                    placeholder="South Africa"
                    className={inputClass("country")}
                    aria-invalid={Boolean(fieldErrors.country)}
                  />
                  <FieldError message={fieldErrors.country} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">City</label>
                  <Input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    required
                    placeholder="Johannesburg"
                    className={inputClass("city")}
                    aria-invalid={Boolean(fieldErrors.city)}
                  />
                  <FieldError message={fieldErrors.city} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </div>
          )}
        </form>
        <div className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-600 hover:underline dark:text-cyan-400">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
