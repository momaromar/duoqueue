import * as Crypto from "expo-crypto";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { LoadingView } from "@/src/components/common/LoadingView";
import { ManagementInput } from "@/src/features/duo-management/components/ManagementInput";
import { DuoStateErrorScreen } from "@/src/features/duos/screens/DuoStateErrorScreen";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { LobbyHeader } from "@/src/features/main-menu/components/LobbyHeader";
import { LobbyScreen } from "@/src/features/main-menu/components/LobbyScreen";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { BlockOpponentPanel } from "@/src/features/safety/components/BlockOpponentPanel";
import {
  safetySubjectTypeSchema,
  type ReportReason,
  type ReportSubmission,
} from "@/src/features/safety/schemas";
import { useReportableSubject, useSubmitSafetyReport } from "@/src/features/safety/useSafety";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

const reasonOptions: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: "Harassment" },
  { value: "hate", label: "Hate or discrimination" },
  { value: "sexual_content", label: "Sexual content" },
  { value: "threats_or_violence", label: "Threats or violence" },
  { value: "spam_or_scam", label: "Spam or scam" },
  { value: "underage_concern", label: "Underage concern" },
  { value: "privacy_violation", label: "Privacy violation" },
  { value: "other", label: "Other" },
];

export function ReportScreen() {
  const params = useLocalSearchParams<{ subjectType?: string | string[]; subjectId?: string | string[] }>();
  const parsedType = safetySubjectTypeSchema.safeParse(params.subjectType);
  let subjectType;
  if (parsedType.success) subjectType = parsedType.data;
  let subjectId: string | undefined;
  if (typeof params.subjectId === "string") subjectId = params.subjectId;
  const subjectQuery = useReportableSubject(subjectType, subjectId);

  if (!subjectType || !subjectId) return <Redirect href="/matchmaking/matched" />;
  if (subjectQuery.isPending) return <LoadingView label="Loading report context…" />;
  if (subjectQuery.error) return <DuoStateErrorScreen error={subjectQuery.error} onRetry={subjectQuery.refetch} />;
  if (!subjectQuery.data) return <Redirect href="/matchmaking/matched" />;
  return <ReportForm subject={subjectQuery.data} />;
}

function ReportForm({ subject }: { subject: NonNullable<ReturnType<typeof useReportableSubject>["data"]> }) {
  const mutation = useSubmitSafetyReport();
  const reportId = useRef<string | null>(null);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submission, setSubmission] = useState<ReportSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!reason) {
      setError("Choose a reason for this report.");
      return;
    }
    if (!confirmed) {
      setError("Confirm that this report is accurate before submitting.");
      return;
    }
    if (details.trim().length > 1000) {
      setError("Report details must be 1,000 characters or fewer.");
      return;
    }
    if (!reportId.current) reportId.current = Crypto.randomUUID();
    try {
      const saved = await mutation.mutateAsync({
        reportId: reportId.current,
        subjectType: subject.subjectType,
        subjectId: subject.subjectId,
        reason,
        details,
      });
      setSubmission(saved);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    }
  };

  if (submission) {
    return (
      <LobbyScreen contentContainerStyle={styles.screen}>
        <LobbyHeader title="Report Submitted" subtitle="The safety report was stored for trusted review." />
        <View style={styles.success}>
          <Text style={styles.successTitle}>REPORT SAVED</Text>
          <Text style={styles.copy}>Reporting did not block anyone. You may now separately block both members of {submission.opponentDuoName}, or keep the current match.</Text>
        </View>
        <BlockOpponentPanel matchId={submission.matchId} opponentDuoName={submission.opponentDuoName} />
        <LobbyButton label="KEEP MATCH" onPress={() => router.replace("/matchmaking/matched")} />
      </LobbyScreen>
    );
  }

  return (
    <LobbyScreen contentContainerStyle={styles.screen}>
      <LobbyHeader showBack title="Report" subtitle="Reports are confidential and do not automatically block anyone." />
      <View style={styles.subject}>
        <Text style={styles.subjectType}>{subject.subjectType.toUpperCase()}</Text>
        <Text style={styles.subjectTitle}>{subject.title}</Text>
        <Text style={styles.copy}>{subject.description}</Text>
      </View>
      <Text style={styles.sectionTitle}>WHY ARE YOU REPORTING THIS?</Text>
      <View style={styles.reasons}>
        {reasonOptions.map((option) => {
          const selected = reason === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setReason(option.value)}
              style={({ pressed }) => [styles.reason, selected && styles.reasonSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <ManagementInput label="Optional details" value={details} maxLength={1000} multiline onChangeText={setDetails} />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: confirmed }}
        onPress={() => setConfirmed((current) => !current)}
        style={({ pressed }) => [styles.confirm, confirmed && styles.confirmed, pressed && styles.pressed]}
      >
        <Text style={styles.confirmMark}>{confirmed && "✓"}</Text>
        <Text style={styles.confirmText}>I confirm this report is accurate to the best of my knowledge.</Text>
      </Pressable>
      {error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
      <LobbyButton label="SUBMIT REPORT" disabled={mutation.isPending} onPress={() => void submit()} />
    </LobbyScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  subject: { gap: 7, borderWidth: 1, borderColor: lobbyColors.magenta, borderRadius: 12, backgroundColor: lobbyColors.surface, padding: 14 },
  subjectType: { color: lobbyColors.magenta, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  subjectTitle: { color: lobbyColors.text, fontSize: 18, fontWeight: "900" },
  sectionTitle: { color: lobbyColors.cyan, fontWeight: "900", letterSpacing: 1.2 },
  reasons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reason: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 9, backgroundColor: lobbyColors.surface, paddingHorizontal: 12 },
  reasonSelected: { borderColor: lobbyColors.cyan, backgroundColor: "#0A2840" },
  reasonText: { color: lobbyColors.muted, fontWeight: "700" },
  reasonTextSelected: { color: lobbyColors.cyan },
  confirm: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: lobbyColors.border, borderRadius: 10, padding: 12 },
  confirmed: { borderColor: lobbyColors.green },
  confirmMark: { width: 22, color: lobbyColors.green, fontSize: 20, fontWeight: "900" },
  confirmText: { flex: 1, color: lobbyColors.text, lineHeight: 20 },
  success: { gap: 8, borderWidth: 1, borderColor: lobbyColors.green, borderRadius: 12, backgroundColor: "#09241E", padding: 16 },
  successTitle: { color: lobbyColors.green, fontWeight: "900", letterSpacing: 1.5 },
  copy: { color: lobbyColors.text, lineHeight: 20 },
  error: { color: lobbyColors.danger, lineHeight: 20 },
  pressed: { opacity: 0.65 },
});
