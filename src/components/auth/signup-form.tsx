"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  PLATFORM_PURPOSES,
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

  const togglePurpose = (id: PlatformPurposeId) => {
    setPurposes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setFormError(null);
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
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Join InstallBase</CardTitle>
        <p className="text-sm text-gray-500">Connect with the installation industry.</p>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${step >= s ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
            />
          ))}
        </div>
        <p className="text-xs text-muted">
          Step {step} of 3 — {step === 1 ? "Account" : step === 2 ? "What brings you here?" : "Professional details"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {formError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {formError}
            </p>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Full name</label>
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
                <label className="mb-1 block text-sm font-medium">Username</label>
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
                <label className="mb-1 block text-sm font-medium">Email</label>
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
                <label className="mb-1 block text-sm font-medium">Password</label>
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
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">What brings you to InstallBase?</label>
                <p className="mb-3 text-xs text-muted">Select all that apply. You can change these later in settings.</p>
                <div className="space-y-2">
                  {PLATFORM_PURPOSES.map((purpose) => {
                    const selected = purposes.includes(purpose.id);
                    return (
                      <button
                        key={purpose.id}
                        type="button"
                        onClick={() => togglePurpose(purpose.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                          selected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                        )}
                      >
                        <span className="text-xl leading-none" aria-hidden>
                          {purpose.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{purpose.title}</span>
                          <span className="mt-0.5 block text-xs text-muted">{purpose.description}</span>
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs",
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 dark:border-gray-600"
                          )}
                          aria-hidden
                        >
                          {selected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
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
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Help other professionals understand your background. You can update this anytime.
              </p>
              <div>
                <label className="mb-2 block text-sm font-medium">Specialties</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALTIES.map((s) => (
                    <label
                      key={s}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors",
                        specialties.includes(s)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={specialties.includes(s)}
                        onChange={() => toggleSpecialty(s)}
                        className="rounded"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Experience level</label>
                <select
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  required
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900",
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
              <div>
                <label className="mb-1 block text-sm font-medium">Country</label>
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
                <label className="mb-1 block text-sm font-medium">City</label>
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
              <div className="flex gap-2">
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
        <div className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
