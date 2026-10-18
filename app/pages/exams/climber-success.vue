<template>
  <RonLayout
    :show-results="false"
    :instructions="[
      'Su makse oli edukas',
      'Paari minuti jooksul peaks see süsteemi jõudma',
    ]"
  >
    <template #instructions-header>Edukas makse</template>
    <template #form>
      <FormInstruction>Makse oli edukas</FormInstruction>
    </template>
  </RonLayout>
</template>
