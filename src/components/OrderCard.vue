<template>
  <NCard>
    <template #header>
      <h1>Order # {{ props.id }}</h1>
    </template>
    <section>
      <h3>Sender</h3>
      <p>{{ props.sender.username }}</p>
    </section>
    <section>
      <h3>Recipient</h3>
      <p>{{ props.recipient.username }}</p>
    </section>

    <template #footer> Expected at {{ props.expected_date }} </template>
  </NCard>
</template>

<script setup lang="ts">
import type { PackageStatus } from "@/enums/packages";
import { NCard } from "naive-ui";

interface OrderCardProps {
  id: number;
  recipient: {
    username: string;
    email: string;
    phone: string;
  };
  sender: {
    username: string;
    email: string;
    phone: string;
  };
  expected_date: string;
  delivery_date?: string;
}

const props = defineProps<OrderCardProps>();
const emits = defineEmits<{
  (e: "view", id: number): void;
  (e: "edit", id: number): void;
}>();
</script>

<style scoped></style>
