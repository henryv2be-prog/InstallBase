const required = [
  {
    name: "DATABASE_URL",
    hint: "Reference your Postgres plugin: ${{Postgres.DATABASE_URL}}",
  },
  {
    name: "AUTH_SECRET",
    hint: "Generate with: openssl rand -base64 32",
  },
];

const missing = required.filter(({ name }) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.error("\n❌ Missing required environment variables:\n");
  for (const { name, hint } of missing) {
    console.error(`  • ${name} — ${hint}`);
  }
  console.error("");
  process.exit(1);
}

console.log("Environment variables OK.");
