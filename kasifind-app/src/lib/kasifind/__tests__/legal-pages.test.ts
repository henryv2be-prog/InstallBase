import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  KF_SUPPORT_EMAIL,
  kfSupportMailtoUrl,
  kfSupportWhatsAppUrl,
} from "../support-contact";

const appRoot = path.join(process.cwd(), "src/app");

test("trust pages exist and are publicly routable", () => {
  for (const segment of ["about", "privacy", "terms", "contact"]) {
    const pagePath = path.join(appRoot, segment, "page.tsx");
    assert.ok(fs.existsSync(pagePath), `${segment} page missing`);
  }
});

test("about page includes supplied founder copy", () => {
  const text = fs.readFileSync(path.join(appRoot, "about/page.tsx"), "utf8");
  assert.match(text, /Henry Vogel/);
  assert.match(text, /sole proprietorship/);
  assert.match(text, /Local businesses deserve to be found/);
});

test("privacy page references actual cookies and POPIA caveat", () => {
  const text = fs.readFileSync(path.join(appRoot, "privacy/page.tsx"), "utf8");
  assert.match(text, /kf_vid/);
  assert.match(text, /kf_session/);
  assert.match(text, /POPIA/);
  assert.match(text, /Information Officer/);
  assert.match(text, /KF_SUPPORT_EMAIL/);
  assert.equal(KF_SUPPORT_EMAIL, "henry@dsiprojects.co.za");
});

test("contact support links are clickable formats", () => {
  assert.match(kfSupportMailtoUrl(), /^mailto:henry@dsiprojects\.co\.za/);
  const wa = kfSupportWhatsAppUrl();
  assert.match(wa, /^https:\/\/wa\.me\/27673955715\?text=/);
});

test("site footer includes legal links", () => {
  const text = fs.readFileSync(
    path.join(process.cwd(), "src/components/kasifind/kf-site-footer.tsx"),
    "utf8"
  );
  assert.match(text, /\/about/);
  assert.match(text, /\/privacy/);
  assert.match(text, /\/terms/);
  assert.match(text, /\/contact/);
  assert.match(text, /2026 KasiFind/);
  assert.match(text, /@kasifindsa/);
  assert.match(text, /tiktok\.com\/@kasifindsa/);
  assert.match(text, /instagram\.com\/kasifindsa/);
  assert.match(text, /facebook\.com\/kasifindsa/);
});
