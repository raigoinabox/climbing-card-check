<template>
  <div class="id-input">
    <slot />
  </div>
</template>

<style scoped>
.id-input {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
}
p {
  font-weight: 400;
  font-size: 24px;
  line-height: 1.33;
  text-align: center;
  color: #183642;
  margin-bottom: 12px;
}
</style>
