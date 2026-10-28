import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/generated/kasifind-prisma/client";
import { validatePassword } from "@/lib/auth-validation";

/**
 * Ensures a KasiFind admin exists from env (safe to run on every deploy/seed).
 *
 * - KASIFIND_ADMIN_EMAIL — required to bootstrap
 * - KASIFIND_ADMIN_PASSWORD — set on create; when changed in Railway and redeployed, password updates
 * - KASIFIND_ADMIN_NAME — optional display name
 */
export async function bootstrapKasiFindAdmin(prisma: PrismaClient): Promise<void> {
  const email = process.env.KASIFIND_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) return;

  const password = process.env.KASIFIND_ADMIN_PASSWORD?.trim();
  const name = process.env.KASIFIND_ADMIN_NAME?.trim() || "KasiFind Admin";

  const existing = await prisma.kfUser.findUnique({ where: { email } });

  if (!existing) {
    if (!password) {
      console.warn(
        `[kasifind] KASIFIND_ADMIN_EMAIL is set but KASIFIND_ADMIN_PASSWORD is missing — admin user not created.`
      );
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      console.error(`[kasifind] KASIFIND_ADMIN_PASSWORD invalid: ${passwordError}`);
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.kfUser.create({
      data: { email, passwordHash, name, role: "ADMIN" },
    });
    console.info(`[kasifind] Created admin user ${email}. Change password via Railway vars + redeploy.`);
    return;
  }

  const data: { role: "ADMIN"; name?: string; passwordHash?: string } = { role: "ADMIN" };
  if (name) data.name = name;
  if (password) {
    const passwordError = validatePassword(password);
    if (passwordError) {
      console.error(`[kasifind] KASIFIND_ADMIN_PASSWORD invalid: ${passwordError}`);
      process.exit(1);
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.kfUser.update({ where: { email }, data });
  console.info(
    `[kasifind] Admin user ${email} ensured (role ADMIN${password ? ", password updated" : ""}).`
  );
}
