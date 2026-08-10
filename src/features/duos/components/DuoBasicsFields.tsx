import { Controller, type Control } from "react-hook-form";
import { StyleSheet } from "react-native";

import { AppInput } from "@/src/components/common/AppInput";
import type { EditDuoValues } from "@/src/features/duos/schemas";

type DuoBasicsFieldsProps = {
  control: Control<EditDuoValues>;
};

export function DuoBasicsFields({ control }: DuoBasicsFieldsProps) {
  return (
    <>
      <Controller
        control={control}
        name="duoName"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <AppInput
            label="Duo name"
            placeholder="Weekend Crew"
            autoCapitalize="words"
            maxLength={50}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="city"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <AppInput
            label="City or broad region"
            placeholder="Toronto"
            autoCapitalize="words"
            maxLength={80}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <AppInput
            label="Temporary description (optional)"
            placeholder="A short note about your duo"
            multiline
            maxLength={240}
            textAlignVertical="top"
            style={styles.description}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={error?.message}
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({ description: { minHeight: 88 } });
