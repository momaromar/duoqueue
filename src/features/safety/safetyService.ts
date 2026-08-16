import {
  blockedDuosSchema,
  blockResultSchema,
  reportableSubjectSchema,
  reportSubmissionSchema,
  unblockResultSchema,
  type SafetySubjectType,
  type SubmitReportValues,
} from "@/src/features/safety/schemas";
import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";

function requireSupabase() {
  if (!supabase) throw new Error(`Missing Supabase configuration: ${missingPublicEnv.join(", ")}`);
  return supabase;
}

export async function getReportableSubject(subjectType: SafetySubjectType, subjectId: string) {
  const { data, error } = await requireSupabase().rpc("get_reportable_safety_subject", {
    subject_type: subjectType,
    subject_id: subjectId,
  });
  if (error) throw error;
  return reportableSubjectSchema.parse(data);
}

export async function submitSafetyReport(values: SubmitReportValues) {
  const details = values.details.trim();
  const { data, error } = await requireSupabase().rpc("submit_safety_report", {
    report_id: values.reportId,
    subject_type: values.subjectType,
    subject_id: values.subjectId,
    report_reason: values.reason,
    report_details: details || null,
  });
  if (error) throw error;
  return reportSubmissionSchema.parse(data);
}

export async function blockOpponentDuo(matchId: string) {
  const { data, error } = await requireSupabase().rpc("block_current_opponent_duo", {
    source_match_id: matchId,
  });
  if (error) throw error;
  return blockResultSchema.parse(data);
}

export async function getBlockedDuos() {
  const { data, error } = await requireSupabase().rpc("get_my_blocked_duos");
  if (error) throw error;
  return blockedDuosSchema.parse(data);
}

export async function unblockDuo(blockGroupId: string) {
  const { data, error } = await requireSupabase().rpc("unblock_duo_block_group", {
    block_group_id: blockGroupId,
  });
  if (error) throw error;
  return unblockResultSchema.parse(data);
}
