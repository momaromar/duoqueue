import type {
  ChatFixtureInput,
  ChatParticipant,
  LocalChatMessage,
} from "@/src/features/chat/types";

const PAGE_SIZE = 8;

const previewLines = [
  "Hey everyone — excited that our duos matched!",
  "Same here. This local preview is a nice way to test the group chat layout.",
  "Should we start with a low-key coffee or a board-game café?",
  "Board games sounds fun, especially somewhere that also has snacks.",
  "We are always in favor of excellent snacks.",
  "What part of the city is easiest for everyone?",
  "Somewhere near transit would be ideal for us.",
  "That works. We can compare a few places before choosing anything.",
  "A weekend afternoon is usually easiest on our side.",
  "Saturday could work. Sunday is normally flexible too.",
  "Any favorite games, or should we pick something completely new?",
  "Something cooperative could be a good first group hangout.",
  "Agreed — less pressure and plenty to talk about.",
  "This message history is still local and will reset after restarting the app.",
  "Phase 11 will replace it with the real synchronized conversation.",
  "For now, we can test sending, failures, retries, unread state, and scrolling.",
];

function participantAt(participants: ChatParticipant[], index: number) {
  return participants[index % participants.length];
}

export function createLocalChatFixture(input: ChatFixtureInput) {
  const matchTime = Date.parse(input.matchedAt);
  let safeMatchTime = matchTime;
  if (Number.isNaN(matchTime)) safeMatchTime = Date.now();
  const endTime = Date.now() - 60_000;
  const availableSpan = Math.max(60_000, endTime - safeMatchTime);
  const step = Math.max(1000, Math.floor(availableSpan / (previewLines.length + 1)));
  const messages: LocalChatMessage[] = [
    {
      id: `local-system-${input.scope.conversationId}`,
      kind: "system",
      body: `${input.ownDuoName} matched with ${input.opponentDuoName}. This is a session-only chat preview.`,
      createdAt: new Date(safeMatchTime).toISOString(),
    },
  ];

  previewLines.forEach((body, index) => {
    messages.push({
      id: `local-fixture-${input.scope.conversationId}-${index + 1}`,
      kind: "text",
      body,
      createdAt: new Date(Math.min(endTime, safeMatchTime + step * (index + 1))).toISOString(),
      sender: participantAt(input.participants, index),
      deliveryStatus: "sent",
    });
  });

  return { messages, initialVisibleCount: PAGE_SIZE, pageSize: PAGE_SIZE };
}
