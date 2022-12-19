<template>
  <NCard
    @click="$emit('edit', props.id)"
    header-style="padding-bottom: 8px; margin-bottom: 0px"
    content-style="padding-top: 0px;"
    hoverable
    class="t-w-full t-mr-5 t-mb-3 t-cursor-pointer t-break-inside-avoid"
  >
    <template #header>
      <h3 class="t-font-semibold t-mb-0">
        Order <span class="t-text-green-400">#{{ props.id }}</span>
      </h3>
    </template>
    <section v-if="props.customer">
      <div class="t-text-md t-mb-[0.1srem] t-font-medium">{{ props.role }}</div>
      <div class="t-text-lg t-font-medium t-text-green-400">
        {{ props.customer.username }}
      </div>
      <span class="t-mt-4 t-text-xs t-text-gray-400">{{
        props.customer.email
      }}</span>
    </section>
    <NDivider class="t-my-0 t-mt-3" />
    <template #footer
      ><div class="t-flex t-items-center">
        <NIcon size="15" class="t-mr-2" color="gray" :component="Calendar" />
        Entered at
        {{ props.entry_timestamp }}
      </div></template
    >
  </NCard>
</template>

<script setup lang="ts">
import type { PackageStatus } from "@/enums/packages";
import { Calendar } from "@vicons/ionicons5";
import { NCard, NDivider, NIcon, NStatistic } from "naive-ui";

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
