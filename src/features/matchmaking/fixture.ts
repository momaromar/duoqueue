import type { MockDuoProfile } from "@/src/features/matchmaking/types";

const mina = {
  id: "fixture-mina",
  displayName: "Mina",
  colorKey: "member_a",
} as const;

const jordan = {
  id: "fixture-jordan",
  displayName: "Jordan",
  colorKey: "member_b",
} as const;

export const fixtureDuoProfile: MockDuoProfile = {
  id: "fixture-side-quest",
  name: "Side Quest",
  city: "Toronto, Ontario",
  description: "Two friends looking for low-pressure adventures and excellent snacks.",
  members: [mina, jordan],
  answers: [
    {
      promptId: 1,
      sortOrder: 1,
      promptText: "What do you and your duo usually do together?",
      responseText: "We explore new food spots, play co-op games, and take long walks by the lake.",
      contributor: mina,
    },
    {
      promptId: 2,
      sortOrder: 2,
      promptText: "What activities would you want to do with another duo?",
      responseText: "Trivia nights, casual hikes, board-game cafés, and trying a class none of us has done.",
      contributor: mina,
    },
    {
      promptId: 3,
      sortOrder: 3,
      promptText: "What kind of people would fit your duo's vibe?",
      responseText: "Curious, kind people who can laugh at a failed plan and turn it into a better story.",
      contributor: mina,
    },
    {
      promptId: 4,
      sortOrder: 4,
      promptText: "What is your duo's usual energy level?",
      responseText: "Mostly relaxed with occasional bursts of ambitious weekend energy.",
      contributor: jordan,
    },
    {
      promptId: 5,
      sortOrder: 5,
      promptText: "What is an ideal first group hangout?",
      responseText: "A café with games or a casual activity where conversation can happen naturally.",
      contributor: jordan,
    },
    {
      promptId: 6,
      sortOrder: 6,
      promptText: "What should another duo know before chatting with you?",
      responseText: "We are friendly, a little nerdy, and happy to make the first plan if everyone is comfortable.",
      contributor: jordan,
    },
  ],
};
