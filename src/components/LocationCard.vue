<template>
  <NCard>
    <template #header>
      <h1>{{ props.country }}, {{ props.city }}</h1>
    </template>
    <p>{{ props.street }}</p>
    <div>
      <span>Zipcode</span><span>{{ props.zipcode }}</span>
    </div>
    <NDivider />
    <template #footer>Recorded at {{ props.timestamp }}</template>
  </NCard>
</template>

<script setup lang="ts">
import { NCard, NDivider } from "naive-ui";

interface LocationCardProps {
  timestamp: number;
  city: string;
  country: string;
  street: string;
  zipcode: number;
}

const props = defineProps<LocationCardProps>();
</script>

<style scoped></style>
