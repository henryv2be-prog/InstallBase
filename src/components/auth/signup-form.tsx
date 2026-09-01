"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/constants";
import { registerUser } from "@/lib/actions";
import { toast } from "sonner";

const experienceLevels = [
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "ONE_TO_THREE", label: "1–3 years" },
  { value: "THREE_TO_FIVE", label: "3–5 years" },
  { value: "FIVE_TO_TEN", label: "5–10 years" },
  { value: "TEN_PLUS", label: "10+ years" },
];

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    experience: "THREE_TO_FIVE",
    country: "South Africa",
    city: "",
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const canContinueStep1 =
    form.name.trim() &&
    form.username.trim() &&
    form.email.trim() &&
    form.password.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city.trim()) {
      toast.error("Please enter your city");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("username", form.username.trim().toLowerCase());
    formData.append("email", form.email.trim());
    formData.append("password", form.password);
    formData.append("experience", form.experience);
    formData.append("country", form.country.trim());
    formData.append("city", form.city.trim());
    specialties.forEach((s) => formData.append("specialties", s));

    startTransition(async () => {
      const result = await registerUser(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Welcome to InstallBase!");
        router.push("/feed");
      }
    });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Join InstallBase</CardTitle>
        <p className="text-sm text-gray-500">Show your work. Share your knowledge.</p>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${step >= s ? "bg-blue-600" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Full name</label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Username</label>
                <Input
                  value={form.username}
                  onChange={(e) => update("username", e.target.value.toLowerCase())}
                  required
                  placeholder="johnsecurity"
                  pattern="[a-z0-9_]+"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                />
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={!canContinueStep1}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">What type of installer are you?</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALTIES.map((s) => (
                    <label
                      key={s}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${
                        specialties.includes(s)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
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
                <label className="mb-1 block text-sm font-medium">How experienced are you?</label>
                <select
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  required
                  className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {experienceLevels.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" className="flex-1" onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Country</label>
                <Input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  required
                  placeholder="South Africa"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">City</label>
                <Input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  required
                  placeholder="Johannesburg"
                />
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
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
