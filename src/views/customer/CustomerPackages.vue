<template>
  <div class="t-columns-2">
    <!-- packages either delivered or sent by the customer -->
    <OrderCard v-for="(order, index) in orders" :key="index" v-bind="order" />
  </div>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import OrderCard from "@/components/OrderCard.vue";
import { useAuth } from "@/stores/auth";
import type { OrderModel } from "@/typings/globals";
import { ref } from "vue";

const packageDirection = ref<"sent" | "incoming">("incoming");
const orders = ref<(OrderModel & { id: number; expected_date: string,  })[]>([]);

const fetchData = async () => {
  orders.value = await AxiosInstance.get("packages/customer");
};
</script>

<style scoped></style>
