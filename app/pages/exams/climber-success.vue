<template>
  <RonLayout
    :instructions="[
      'Su makse oli edukas',
      'Paari minuti jooksul peaks see süsteemi jõudma',
    ]"
  >
    <FormInstruction>Makse oli edukas</FormInstruction>

    <template #instructions-header>Edukas makse</template>
  </RonLayout>
</template>
