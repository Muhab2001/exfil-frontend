<template>
  <div>
    <!-- packages either delivered or sent by the customer -->
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const packageDirection = ref<"sent" | "incoming">("incoming");
</script>

<style scoped></style>
