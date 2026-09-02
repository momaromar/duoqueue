import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import type { MemberColorKey } from "@/src/features/duo-profile/schemas";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import type { MatchmakingStateWithImages } from "@/src/features/matchmaking/schemas";

type Opponent = NonNullable<MatchmakingStateWithImages["match"]>["opponent"];
type OpponentMember = Opponent["members"][number];
type OpponentAnswer = Opponent["answers"][number];

function colorRank(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return 0;
  return 1;
}

export function orderOpponentMembers(members: Opponent["members"]) {
  return [...members].sort((left, right) => colorRank(left.colorKey) - colorRank(right.colorKey));
}

export function orderOpponentAnswers(answers: Opponent["answers"]) {
  return [...answers].sort((left, right) => left.sortOrder - right.sortOrder);
}

function memberBorder(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return styles.memberABorder;
  return styles.memberBBorder;
}

function answerColors(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return styles.memberAAnswer;
  return styles.memberBAnswer;
}

function contributorColor(colorKey: MemberColorKey) {
  if (colorKey === "member_a") return styles.memberAContributor;
  return styles.memberBContributor;
}

function MemberImage({ member }: { member: OpponentMember }) {
  if (!member.imageUrl) return null;
  return (
    <View style={styles.imageCard}>
      <Image
        source={member.imageUrl}
        accessibilityLabel={`${member.displayName}'s Duo Profile image`}
        style={[styles.image, memberBorder(member.colorKey)]}
        contentFit="cover"
      />
      <Text style={styles.imageContributor}>{member.displayName}</Text>
    </View>
  );
}

function ProfileAnswer({ answer }: { answer: OpponentAnswer }) {
  return (
    <View style={[styles.answer, answerColors(answer.colorKey)]}>
      <Text style={styles.question}>{answer.promptText}</Text>
      <Text style={styles.response}>
        {answer.responseText}
        <Text style={[styles.inlineContributor, contributorColor(answer.colorKey)]}>
          {" — "}{answer.displayName}
        </Text>
      </Text>
    </View>
  );
}

export function MatchedDuoProfile({ opponent }: { opponent: Opponent }) {
  const members = orderOpponentMembers(opponent.members);
  const membersWithImages = members.filter((member) => Boolean(member.imageUrl));
  const answers = orderOpponentAnswers(opponent.answers);

  return (
    <>
      <View style={styles.basics}>
        <Text style={styles.city}>{opponent.city}</Text>
        {opponent.description && <Text style={styles.description}>{opponent.description}</Text>}
      </View>
      {membersWithImages.length > 0 && (
        <View style={styles.images} accessibilityLabel="Matched duo images">
          {membersWithImages.map((member) => <MemberImage key={member.userId} member={member} />)}
        </View>
      )}
      <View style={styles.answers}>
        {answers.map((answer) => <ProfileAnswer key={answer.promptId} answer={answer} />)}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  basics: { gap: 10 },
  city: { color: lobbyColors.green, fontSize: 13, fontWeight: "900", letterSpacing: 1.1 },
  description: { color: lobbyColors.text, fontSize: 15, lineHeight: 22 },
  images: { flexDirection: "row", gap: 12 },
  imageCard: { minWidth: 0, flex: 1, gap: 8 },
  image: { width: "100%", aspectRatio: 1, borderWidth: 2, borderRadius: 14, backgroundColor: lobbyColors.surface },
  memberABorder: { borderColor: lobbyColors.memberA },
  memberBBorder: { borderColor: lobbyColors.memberB },
  imageContributor: { color: lobbyColors.text, fontSize: 13, fontWeight: "800", textAlign: "center" },
  answers: { gap: 8 },
  answer: { gap: 5, borderWidth: 1, borderRadius: 12, padding: 11 },
  memberAAnswer: { borderColor: lobbyColors.memberA, backgroundColor: "#0A2034" },
  memberBAnswer: { borderColor: lobbyColors.memberB, backgroundColor: "#2A1815" },
  question: { color: lobbyColors.text, fontWeight: "800", lineHeight: 19 },
  response: { color: lobbyColors.text, lineHeight: 20 },
  inlineContributor: { fontWeight: "800" },
  memberAContributor: { color: lobbyColors.memberA },
  memberBContributor: { color: lobbyColors.memberB },
});
