import type { ModeId } from "./commands";
import type { Profile } from "./db";
import { OUTPUT_SPECS } from "./output-specs";
import { DEFAULT_LOCALE, type Locale } from "./i18n/locale";
import { MESSAGES } from "./i18n/messages";

export function buildSystemPrompt(
  mode: ModeId,
  profile: Profile,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const m = MESSAGES[locale].prompts;
  const persona = m.persona;
  const profileBlock = profileToBlock(profile, locale);
  const role = m.roles[mode];
  const outputSchema = OUTPUT_SPECS[mode]?.promptInstructions;
  // Hard language instruction last so it isn't buried — drives the content
  // language of both free-text and structured-card output.
  return [persona, profileBlock, role, outputSchema, m.language]
    .filter(Boolean)
    .join("\n\n");
}

function profileToBlock(profile: Profile, locale: Locale): string {
  const m = MESSAGES[locale].prompts;
  const parts: string[] = [m.profileHeader];
  if (profile.targetRole) parts.push(m.profileTargetRole(profile.targetRole));
  if (profile.yearsExp) parts.push(m.profileYearsExp(profile.yearsExp));
  if (profile.techStack.length)
    parts.push(m.profileTechStack(profile.techStack.join("、")));
  if (profile.targetCompanies.length)
    parts.push(m.profileCompanies(profile.targetCompanies.join("、")));
  if (profile.resumeFileName) parts.push(m.profileResume(profile.resumeFileName));
  if (parts.length === 1) parts.push(m.profileEmpty);
  return parts.join("\n");
}
