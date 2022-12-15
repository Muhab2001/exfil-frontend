<template>
  <NCard
    @click="$emit('edit', props.id)"
    header-style="padding-bottom 0px;"
    hoverable
    class="t-w-full t-mr-5 t-mb-3 t-cursor-pointer t-break-inside-avoid"
  >
    <template #header>
      <h3 class="t-font-semibold">
        Order <span class="t-text-green-400">#{{ props.id }}</span>
      </h3>
    </template>
    <section v-if="props.customer">
      <div class="t-text-lg t-mb-2 t-font-medium">{{ props.role }}</div>
      <div class="t-text-sm">{{ props.customer.username }}</div>
      <span class="t-mt-4 t-text-xs t-text-gray-400">{{
        props.customer.email
      }}</span>
    </section>
    <NDivider class="t-my-0 t-mt-3" />
    <template #footer> Entered at {{ props.entry_timestamp }} </template>
  </NCard>
</template>

<script setup lang="ts">
import type { PackageStatus } from "@/enums/packages";
import { NCard, NDivider, NStatistic } from "naive-ui";

interface OrderCardProps {
  id: number;
  customer: {
    username: string;
    email: string;
  };
  role: "Sender" | "Recipient";
  entry_timestamp: string;
}

const props = defineProps<OrderCardProps>();
const emits = defineEmits<{
  (e: "edit", id: number): void;
}>();
</script>

<style scoped></style>
