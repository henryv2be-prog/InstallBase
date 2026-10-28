import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    if (name === "__tests__" || name.endsWith(".test.ts") || name.endsWith(".test.tsx")) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?)$/.test(name)) acc.push(p);
  }
  return acc;
}

describe("kasifind standalone boundary", () => {
  it("does not reference InstallBase product routes in app source", () => {
    const files = walk(root);
    const forbidden = [/from "@\/lib\/session"/, /next-auth/, /SmartWatchDog/, /installbase-production/];
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        assert.equal(
          pattern.test(text),
          false,
          `${path.relative(process.cwd(), file)} must not match ${pattern}`
        );
      }
    }
  });
});
