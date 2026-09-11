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
import type { EmploymentStatus, ExperienceLevel } from "@/generated/prisma/client";

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "ONE_TO_THREE", label: "1–3 years" },
  { value: "THREE_TO_FIVE", label: "3–5 years" },
  { value: "FIVE_TO_TEN", label: "5–10 years" },
  { value: "TEN_PLUS", label: "10+ years" },
];

const employmentStatuses: { value: EmploymentStatus; label: string }[] = [
  { value: "EMPLOYED", label: "Employed" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "CONTRACTOR", label: "Contractor" },
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "STUDENT", label: "Student" },
  { value: "BETWEEN_JOBS", label: "Between jobs" },
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
  openToWork: boolean;
  availableForContract: boolean;
  availableForSubcontract: boolean;
  willingToTravel: boolean;
  serviceRadiusKm: number | null;
  employmentStatus: EmploymentStatus | null;
  certifications: string[];
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
  openToWork: initialOpenToWork,
  availableForContract: initialAvailableForContract,
  availableForSubcontract: initialAvailableForSubcontract,
  willingToTravel: initialWillingToTravel,
  serviceRadiusKm: initialServiceRadiusKm,
  employmentStatus: initialEmploymentStatus,
  certifications: initialCertifications,
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
  const [openToWork, setOpenToWork] = useState(initialOpenToWork);
  const [availableForContract, setAvailableForContract] = useState(initialAvailableForContract);
  const [availableForSubcontract, setAvailableForSubcontract] = useState(initialAvailableForSubcontract);
  const [willingToTravel, setWillingToTravel] = useState(initialWillingToTravel);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    initialServiceRadiusKm !== null ? String(initialServiceRadiusKm) : ""
  );
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | "">(
    initialEmploymentStatus ?? ""
  );
  const [certificationsText, setCertificationsText] = useState(initialCertifications.join(", "));

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
      formData.append("openToWork", openToWork ? "true" : "false");
      formData.append("availableForContract", availableForContract ? "true" : "false");
      formData.append("availableForSubcontract", availableForSubcontract ? "true" : "false");
      formData.append("willingToTravel", willingToTravel ? "true" : "false");
      if (serviceRadiusKm.trim()) formData.append("serviceRadiusKm", serviceRadiusKm.trim());
      if (employmentStatus) formData.append("employmentStatus", employmentStatus);
      certificationsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((cert) => formData.append("certifications", cert));
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
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div>
              <p className="text-sm font-medium">Profile preferences</p>
              <p className="mt-1 text-xs text-muted">
                Saved to your profile for future professional discovery on InstallBase. These
                preferences are not shown publicly until matching and discovery features launch.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={openToWork} onChange={(e) => setOpenToWork(e.target.checked)} />
              Open to work
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={availableForContract}
                onChange={(e) => setAvailableForContract(e.target.checked)}
              />
              Available for contract work
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={availableForSubcontract}
                onChange={(e) => setAvailableForSubcontract(e.target.checked)}
              />
              Available for subcontracting
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={willingToTravel}
                onChange={(e) => setWillingToTravel(e.target.checked)}
              />
              Willing to travel
            </label>
            <div>
              <label className="mb-1 block text-sm font-medium">Service radius (km)</label>
              <Input
                type="number"
                min={0}
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(e.target.value)}
                placeholder="50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Employment status</label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus | "")}
                className="flex h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              >
                <option value="">Prefer not to say</option>
                {employmentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Self-reported certifications</label>
              <Input
                value={certificationsText}
                onChange={(e) => setCertificationsText(e.target.value)}
                placeholder="Hikvision certified, ECSA wireman..."
              />
              <p className="mt-1 text-xs text-muted">
                Comma-separated. Shown on your profile as self-reported — not verified by
                InstallBase.
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">
          Enable &ldquo;Show my work&rdquo; or &ldquo;Find work&rdquo; above to edit experience, specialties, and availability.
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
