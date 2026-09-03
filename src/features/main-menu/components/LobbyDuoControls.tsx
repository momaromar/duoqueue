import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ManagementInput } from "@/src/features/duo-management/components/ManagementInput";
import { updateActiveDuoBasics } from "@/src/features/duo-management/duoManagementService";
import { editDuoSchema, type EditDuoValues } from "@/src/features/duos/schemas";
import { LobbyButton } from "@/src/features/main-menu/components/LobbyButton";
import { lobbyColors } from "@/src/features/main-menu/lobbyTheme";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

type LobbyDuoControlsProps = {
  userId: string | undefined;
  duo: {
    id: string;
    name: string;
    city: string;
    description: string | null;
  };
  onOpenPreferences: () => void;
};

type CompactActionProps = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

function CompactAction({ label, disabled, onPress }: CompactActionProps) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.compactAction,
        isFocused && styles.focused,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.compactActionText}>{label}</Text>
    </Pressable>
  );
}

export function LobbyDuoControls({ userId, duo, onOpenPreferences }: LobbyDuoControlsProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isPreferencesFocused, setIsPreferencesFocused] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const form = useForm<EditDuoValues>({
    resolver: zodResolver(editDuoSchema),
    defaultValues: {
      duoName: duo.name,
      city: duo.city,
      description: duo.description ?? "",
    },
  });
  const mutation = useMutation({ mutationFn: updateActiveDuoBasics });

  useEffect(() => {
    if (isEditing) return;
    form.reset({
      duoName: duo.name,
      city: duo.city,
      description: duo.description ?? "",
    });
  }, [duo.city, duo.description, duo.id, duo.name, form, isEditing]);

  const beginEditing = () => {
    setActionError(null);
    form.reset({
      duoName: duo.name,
      city: duo.city,
      description: duo.description ?? "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setActionError(null);
    form.reset({
      duoName: duo.name,
      city: duo.city,
      description: duo.description ?? "",
    });
    setIsEditing(false);
  };

  const save = async (values: EditDuoValues) => {
    setActionError(null);
    try {
      await mutation.mutateAsync(values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["duos", "current", userId] }),
        queryClient.invalidateQueries({ queryKey: ["duo-profile", "current", userId] }),
        queryClient.invalidateQueries({ queryKey: ["matchmaking", "current", userId] }),
        queryClient.invalidateQueries({ queryKey: ["duo-management"] }),
      ]);
      setIsEditing(false);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <View accessibilityLabel="Duo controls" style={styles.row}>
      <View style={styles.nameArea}>
        {!isEditing && (
          <LobbyButton
            accessibilityHint="Edits the Duo name here in the lobby"
            accessibilityLabel={`Edit Duo name: ${duo.name}`}
            label={duo.name}
            labelStyle={styles.duoName}
            onPress={beginEditing}
          />
        )}
        {isEditing && (
          <View style={styles.editor}>
            <Controller
              control={form.control}
              name="duoName"
              render={({ field, fieldState }) => (
                <ManagementInput
                  accessibilityLabel="Duo name"
                  autoCapitalize="words"
                  autoFocus
                  error={fieldState.error?.message}
                  label="Duo name"
                  maxLength={50}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  returnKeyType="done"
                  selectTextOnFocus
                  value={field.value}
                />
              )}
            />
            {actionError && (
              <Text accessibilityLiveRegion="polite" style={styles.error}>{actionError}</Text>
            )}
            <View style={styles.editorActions}>
              <CompactAction
                disabled={mutation.isPending}
                label="SAVE"
                onPress={form.handleSubmit(save)}
              />
              <CompactAction
                disabled={mutation.isPending}
                label="CANCEL"
                onPress={cancelEditing}
              />
            </View>
          </View>
        )}
      </View>

      <Pressable
        accessibilityHint="Opens Duo profile, members, basics, and queue preferences"
        accessibilityLabel="Open Duo preferences"
        accessibilityRole="button"
        onBlur={() => setIsPreferencesFocused(false)}
        onFocus={() => setIsPreferencesFocused(true)}
        onPress={onOpenPreferences}
        style={({ pressed }) => [
          styles.preferences,
          isPreferencesFocused && styles.focused,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons accessible={false} color={lobbyColors.cyan} name="options-outline" size={34} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 10,
  },
  nameArea: {
    width: "50%",
    minWidth: 0,
  },
  duoName: {
    fontSize: 22,
    letterSpacing: 0.8,
  },
  editor: {
    gap: 8,
    borderWidth: 2,
    borderColor: lobbyColors.border,
    borderRadius: 12,
    backgroundColor: lobbyColors.surfaceRaised,
    padding: 10,
  },
  editorActions: {
    flexDirection: "row",
    gap: 8,
  },
  compactAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: lobbyColors.cyan,
    borderRadius: 8,
    backgroundColor: lobbyColors.surface,
    paddingHorizontal: 8,
  },
  compactActionText: {
    color: lobbyColors.cyan,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  preferences: {
    width: 92,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: lobbyColors.border,
    borderRadius: 12,
    backgroundColor: lobbyColors.surfaceRaised,
  },
  focused: {
    borderColor: lobbyColors.magenta,
    shadowColor: lobbyColors.magenta,
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  disabled: { opacity: 0.45 },
  error: { color: lobbyColors.danger, lineHeight: 19 },
});
