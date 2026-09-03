import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

import type { DuoProfileStateWithImages } from "@/src/features/duo-profile/schemas";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";

type ProfileMember = DuoProfileStateWithImages["members"][number];

type DuoMemberReadinessProps = {
  members: ProfileMember[];
};

function memberAccent(member: ProfileMember) {
  if (member.colorKey === "member_a") return lobbyColors.memberA;
  return lobbyColors.memberB;
}

export function orderedReadinessMembers(members: ProfileMember[]) {
  return [...members].sort((left, right) => left.colorKey.localeCompare(right.colorKey));
}

export function DuoMemberReadiness({ members }: DuoMemberReadinessProps) {
  return (
    <View
      accessibilityLabel="Duo onboarding readiness"
      accessibilityLiveRegion="polite"
      style={styles.row}
    >
      {orderedReadinessMembers(members).map((member) => {
        const isReady = Boolean(member.submittedAt);
        const accent = memberAccent(member);
        let status = `${member.displayName} not ready, still onboarding!`;
        let iconColor: string = dimIcon;
        let statusColor: string = lobbyColors.danger;
        if (isReady) {
          status = `${member.displayName} ready!`;
          iconColor = accent;
          statusColor = accent;
        }

        return (
          <View accessible accessibilityLabel={status} key={member.userId} style={styles.member}>
            <View
              style={[
                styles.iconShell,
                isReady && {
                  shadowColor: accent,
                  shadowOpacity: 0.85,
                  elevation: 8,
                },
              ]}
            >
              <Ionicons
                accessible={false}
                color={iconColor}
                name="person-circle"
                size={56}
                testID={`readiness-icon-${member.colorKey}`}
              />
            </View>
            <Text style={[styles.status, { color: statusColor }]}>
              {status}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export const dimIcon = "#53627E";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingTop: 2,
  },
  member: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 5,
  },
  iconShell: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 31,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
  },
  status: {
    minHeight: 34,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "center",
  },
});
