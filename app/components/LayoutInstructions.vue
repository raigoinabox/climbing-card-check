<script setup lang="ts">
defineProps<{ instructions: string[] }>();
</script>

<template>
  <div class="instructions">
    <div
      v-for="(instruction, index) in instructions"
      :key="instruction"
      class="row"
    >
      <div class="row-number-wrapper">
        <div class="row-number">{{ index + 1 }}</div>
      </div>
      <p>{{ instruction }}</p>
    </div>
  </div>
</template>

<style lang="css" scoped>
.instructions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 32px;
}

.instructions .row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 16px;
  font-size: 24px;
  line-height: 32px;
}

.instructions .row-number-wrapper {
  flex: 1;
}

.instructions .row-number {
  display: table-cell !important;
  min-width: 74px;
  height: 74px;
  border-radius: 50%;
  color: #284bb1;
  vertical-align: middle;
  text-align: center;
  background: #d4dbef;
  gap: 10px;
}
.instructions .row-number {
  background-color: #279af1;
}
.instructions .row-number:first-child {
  background: #d4dbef;
}
</style>
