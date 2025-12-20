<template>
  <button><slot /></button>
</template>

<style scoped>
button {
  border: none;
  padding: 16px 10px;
  background: linear-gradient(86.59deg, #26408b 22.05%, #279af1 172.51%);
  border-radius: 24px;
  font-weight: 600;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.09em;
  color: #ffffff;
  width: 100%;
  transition: box-shadow 100ms ease-in-out;
}

button:hover {
  background:
    linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    linear-gradient(87.31deg, #26408b -29.47%, #279af1 170.76%);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

button:focus {
  background:
    linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    linear-gradient(86.59deg, #26408b 22.05%, #279af1 172.51%);
}

button:disabled {
  background: linear-gradient(
    86.59deg,
    rgba(38, 64, 139, 0.4) 22.05%,
    rgba(39, 154, 241, 0.4) 172.51%
  );
}
</style>
