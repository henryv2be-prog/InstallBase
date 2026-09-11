"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SPECIALTIES } from "@/lib/constants";
import { updateProfile } from "@/lib/actions";
import { getExperienceLabel } from "@/lib/utils";
import { toast } from "sonner";
import type { ExperienceLevel } from "@/generated/prisma/client";

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "ONE_TO_THREE", label: "1–3 years" },
  { value: "THREE_TO_FIVE", label: "3–5 years" },
  { value: "FIVE_TO_TEN", label: "5–10 years" },
  { value: "TEN_PLUS", label: "10+ years" },
];

interface ProfileSettingsFormProps {
  name: string;
  username: string;
  email: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  experience: ExperienceLevel;
  specialties: string[];
  website: string | null;
  showProfessionalFields: boolean;
}

export function ProfileSettingsForm({
  name: initialName,
  username,
  email,
  bio: initialBio,
  city: initialCity,
  country: initialCountry,
  experience: initialExperience,
  specialties: initialSpecialties,
  website: initialWebsite,
  showProfessionalFields,
}: ProfileSettingsFormProps) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio ?? "");
  const [city, setCity] = useState(initialCity ?? "");
  const [country, setCountry] = useState(initialCountry ?? "");
  const [experience, setExperience] = useState(initialExperience);
  const [specialties, setSpecialties] = useState<string[]>(initialSpecialties);
  const [website, setWebsite] = useState(initialWebsite ?? "");

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("bio", bio.trim());
    formData.append("city", city.trim());
    formData.append("country", country.trim());
    formData.append("experience", experience);
    formData.append("website", website.trim());
    formData.append("includeProfessional", showProfessionalFields ? "true" : "false");
    if (showProfessionalFields) {
      specialties.forEach((s) => formData.append("specialties", s));
    }

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Username</label>
        <Input value={`@${username}`} disabled className="text-muted" />
        <p className="mt-1 text-xs text-muted">Username cannot be changed</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input value={email} disabled className="text-muted" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Tell other installers about your work..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Johannesburg" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="South Africa" />
        </div>
      </div>
      {showProfessionalFields ? (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
              className="flex h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
            >
              {experienceLevels.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">Currently: {getExperienceLabel(experience)}</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Specialties</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className="focus:outline-none"
                >
                  <Badge variant={specialties.includes(s) ? "default" : "outline"}>{s}</Badge>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">
          Enable &ldquo;Show my work&rdquo; or &ldquo;Find work&rdquo; above to edit experience and specialties.
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">Website</label>
        <Input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourcompany.com"
          type="url"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
