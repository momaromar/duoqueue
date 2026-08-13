import { Controller, type Control } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import type {
  ContributionFormValues,
  DuoProfileState,
} from "@/src/features/duo-profile/schemas";

type ContributionFieldsProps = {
  control: Control<ContributionFormValues>;
  prompts: DuoProfileState["assignedPrompts"];
};

export function ContributionFields({ control, prompts }: ContributionFieldsProps) {
  return (
    <View style={styles.fields}>
      {prompts.map((prompt, index) => (
        <Controller
          key={prompt.id}
          control={control}
          name={`answers.${index}.responseText`}
          render={({ field, fieldState }) => (
            <View style={styles.field}>
              <AppText>Prompt {prompt.sortOrder} of 6</AppText>
              <AppInput
                label={prompt.text}
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                multiline
                maxLength={500}
                textAlignVertical="top"
                style={styles.answer}
              />
              <AppText>{field.value.length}/500</AppText>
            </View>
          )}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 20 },
  field: { gap: 6 },
  answer: { minHeight: 112, paddingVertical: 8 },
});
