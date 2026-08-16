import { LegalScreen } from "@/src/features/legal/LegalScreen";

export function CommunityGuidelinesScreen() {
  return <LegalScreen title="Community Guidelines" subtitle="How DuoQueue members should treat one another." sections={[
    { heading: "Adults only", body: "DuoQueue is currently intended only for people aged 18 or older. Technical age verification is not implemented yet and is required before production release." },
    { heading: "Respect and consent", body: "Do not harass, threaten, discriminate against, sexually pressure, impersonate, scam, or expose private information about another person." },
    { heading: "Meet carefully", body: "DuoQueue shows a broad city or region, not a verified location. For in-person plans, choose a public place, tell someone you trust, arrange your own transportation, and leave if you feel unsafe." },
    { heading: "Report and block", body: "Reports preserve context for later review. Blocking ends the current match and conversation and prevents future matching with those accounts. If there is immediate danger, contact local emergency services; DuoQueue is not an emergency service." },
  ]} />;
}

export function PrivacyPolicyScreen() {
  return <LegalScreen title="Privacy Policy" subtitle="Development summary of DuoQueue data handling." sections={[
    { heading: "Private account data", body: "Authentication emails are used for account access and are not shown in duo profiles, matchmaking results, invitation previews, or chats." },
    { heading: "Shared profile data", body: "Duo names, broad regions, display names, submitted prompt answers, and optional images are shown to authorized duo members and matched opponents." },
    { heading: "Safety evidence", body: "Reports may preserve account IDs, display names, duo and match context, conversation IDs, and reported message text. Ordinary users cannot browse submitted reports." },
    { heading: "Location and notifications", body: "The MVP stores a user-selected broad city or region, not continuous precise location. Notification preferences are saved, but push delivery is not implemented yet." },
  ]} />;
}

export function TermsScreen() {
  return <LegalScreen title="Terms" subtitle="Development conditions for using DuoQueue." sections={[
    { heading: "Eligibility", body: "You must be at least 18 years old to use the current DuoQueue MVP and must provide accurate account information." },
    { heading: "Acceptable use", body: "Do not misuse invitations, matchmaking, profiles, chat, reporting, blocking, or other accounts. Do not submit illegal, abusive, deceptive, or rights-infringing content." },
    { heading: "User responsibility", body: "Matches and broad regions are not identity, background, compatibility, or safety verification. You are responsible for deciding whether and how to communicate or meet." },
    { heading: "Enforcement", body: "DuoQueue may preserve reports, restrict access, or remove content or accounts when trusted moderation capabilities are available. Production terms require legal review before release." },
  ]} />;
}
