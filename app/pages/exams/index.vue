<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { ExamRowButton, UBadge } from "#components";

const { data } = await useFetch("/api/exams/exams");

type DataItem = typeof data extends Ref<(infer R)[] | undefined> ? R : never;

function getStatusNode(status: string) {
  return status == "roheline"
    ? h("span", () => "Roheline kaart")
    : status == "punane"
      ? h("span", () => "Punane kaart")
      : status == "expired"
        ? h("span", () => "Kehtivuse kaotanud")
        : h(UBadge, { color: "warning" }, () => ["Maksmata"]);
}

const columns: TableColumn<DataItem>[] = [
  { accessorKey: "examDate", header: "Eksami kuupäev" },
  { accessorKey: "name", header: "Nimi" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "status",
    header: "Seis",
    cell: ({ row }) => getStatusNode(row.getValue<string>("status")),
  },
  {
    id: "actions",
    cell: ({ row }) =>
      row.getValue("status") == "inactive" && row.original.uuid != null
        ? h(ExamRowButton, { uuid: row.original.uuid })
        : null,
  },
];
</script>

<template>
  <LoggedInLayout form-width="60em">
    <template #form>
      <div style="text-align: right">
        <UButton
          to="exams/register"
          size="sm"
          color="neutral"
          trailing-icon="i-lucide-arrow-right"
          variant="outline"
          >Registreeri uus</UButton
        >
      </div>
      <FormInstruction>Varasemad eksamid</FormInstruction>
      <p>
        Vajadusel saab ronijale uuesti saata info Ronimisliidu tasu maksmise
        kohta.
      </p>
      <div v-for="row in data" :key="row.uuid" class="mobileTable lg:hidden">
        <p class="mobileTableLabel">Eksami kuupäev</p>
        <p>{{ row.examDate }}</p>
        <p class="mobileTableLabel">Nimi</p>
        <p>{{ row.name }}</p>
        <p class="mobileTableLabel">Email</p>
        <p>{{ row.email }}</p>
        <p class="mobileTableLabel">Seis</p>
        <p><component :is="getStatusNode(row.status)" /></p>
        <p
          v-if="row.status == 'inactive' && row.uuid != null"
          style="padding-top: 0.5em"
        >
          <ExamRowButton :uuid="row.uuid" />
        </p>
      </div>
      <UTable class="hidden lg:block" :data="data" :columns="columns" />
    </template>
  </LoggedInLayout>
</template>

<style scoped>
.mobileTable {
  border-bottom: thin solid black;
  padding-block: 1em;
}
.mobileTableLabel {
  font-weight: bold;
}
.mobileTableLabel ~ .mobileTableLabel {
  padding-top: 0.5em;
}
</style>
