"use client";

export function KfAdminDeleteButton({
  action,
  hiddenFields,
  label,
  confirmMessage,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className="kf-btn kf-btn-ghost w-full text-xs text-red-700">
        {label}
      </button>
    </form>
  );
}
