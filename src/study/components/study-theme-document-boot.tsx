import { STUDY_THEME_COOKIE } from "@/study/lib/constants";

/** Applies study document chrome from cookie before React hydrates (avoids body flash). */
export function StudyThemeDocumentBoot() {
  const escaped = STUDY_THEME_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const script = `(function(){try{var m=document.cookie.match(/(?:^|; )${escaped}=([^;]*)/);var v=m&&decodeURIComponent(m[1]);var t=v==="light"?"light":"dark";var h=document.documentElement;h.classList.add("study-coach-active",t==="light"?"study-coach-theme-light":"study-coach-theme-dark");document.body&&document.body.classList.add("study-coach-active");}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
