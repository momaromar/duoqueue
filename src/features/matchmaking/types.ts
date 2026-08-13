import type { MemberColorKey } from "@/src/features/duo-profile/schemas";

export type MockMatchmakingStatus = "idle" | "waiting" | "matched";

export type MockQueueTicket = {
  id: string;
  duoId: string;
  status: "waiting" | "matched";
  queuedAt: number;
  eligibleAt: number;
};

export type MockMatchMember = {
  id: string;
  displayName: string;
  colorKey: MemberColorKey;
};

export type MockCombinedAnswer = {
  promptId: number;
  sortOrder: number;
  promptText: string;
  responseText: string;
  contributor: MockMatchMember;
};

export type MockDuoProfile = {
  id: string;
  name: string;
  city: string;
  description: string;
  members: [MockMatchMember, MockMatchMember];
  answers: MockCombinedAnswer[];
};

export type MockMatch = {
  id: string;
  currentDuoId: string;
  matchedAt: number;
  opponent: MockDuoProfile;
};
