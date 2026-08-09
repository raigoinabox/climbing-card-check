<script setup lang="tsx">
import type { ExamClimberDto } from "#shared/types/api_types";
import { isIdCodeValid } from "#shared/utils/climber_utils";

const climber = defineModel<Readonly<ExamClimberDto>>("climber", {
  required: true,
});

const suggestForeigner = ref(
  climber.value.foreigner ||
    (climber.value.idCode != "" && !isIdCodeValid(climber.value.idCode)),
);

function handleIdCodeChange() {
  if (!isIdCodeValid(climber.value.idCode)) {
    suggestForeigner.value = true;
  }
}

function handleIdCodeInput(idCode: string) {
  if (12 <= idCode.length) {
    suggestForeigner.value = true;
  }
}
</script>

<template>
  <FormBody>
    <FormField
      v-model:model-value="climber.name"
      label="Ronija nimi"
      required
      @update:model-value="
        (name) => (climber = { ...climber, name: name?.trim() ?? '' })
      "
    />

    <FormField
      v-model:model-value="climber.idCode"
      label="Ronija isikukood"
      required
      :maxlength="100"
      pattern="\d+"
      title="Ainult numbrimärgid"
      placeholder="12345678901"
      inputmode="numeric"
      @update:model-value="
        (rawIdCode) => {
          const idCode = rawIdCode?.trim() ?? '';
          climber = { ...climber, idCode };
          handleIdCodeInput(idCode);
        }
      "
      @change="handleIdCodeChange"
    />
    <UCheckbox
      v-if="suggestForeigner"
      v-model:model-value="climber.foreigner"
      label="Kas on välismaalase isikukood?"
      description="Siis jätame isikukoodi kontrolli vahele"
      @update:model-value="
        (foreigner) =>
          (climber = {
            ...climber,
            foreigner: foreigner == 'indeterminate' ? false : foreigner,
          })
      "
    />

    <FormField
      v-model:model-value="climber.email"
      label="Ronija email"
      type="email"
      required
      @update:model-value="
        (email) => (climber = { ...climber, email: email?.trim() ?? '' })
      "
    />
    <FormField
      v-model:model-value="climber.comment"
      label="Kommentaar (valikuline)"
      @update:model-value="
        (comment) => (climber = { ...climber, comment: comment?.trim() ?? '' })
      "
    />
  </FormBody>
</template>
