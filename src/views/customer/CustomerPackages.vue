<template>
  <div>
    <CustomerOrderModal
      @closed="orderModal.visible = false"
      v-bind="orderModal"
    />

    <h1 class="dark:t-text-white t-px-4 t-mb-5">My Orders</h1>
    <!-- packages either delivered or sent by the customer -->
    <div class="t-w-full t-columns-1 t-column-1 md:t-columns-2 lg:t-columns-3">
      <OrderCard
        @edit="(id: number) => {openModal(id)}"
        v-for="(order, index) in orders"
        :key="index"
        v-bind="order"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import CustomerOrderModal from "@/components/CustomerOrderModal.vue";
import OrderCard from "@/components/OrderCard.vue";
import type { OrderModel } from "@/typings/globals";
import { ref, reactive, onBeforeMount } from "vue";

interface OrderCardProps {
  id: number;
  customer: {
    username: string;
    email: string;
    phone: string;
  };
  role: "Sender" | "Recipient";
  entry_timestamp: string;
}

interface OrderDeliveryModalProps {
  order_id: number;
  visible: boolean;
}

const orderModal = reactive<OrderDeliveryModalProps>({
  order_id: 0,
  visible: false,
});

const orderType = ref<"sender" | "recipient">("recipient");

const orders = ref<OrderCardProps[]>([]);

const fetchData = async () => {
  const searchParam: { side: "recipient" | "sender" } = {
    side: orderType.value,
  };
  const response = (
    await AxiosInstance.get("order/customer", {
      params: searchParam,
    })
  ).data;

  orders.value = response.map((order: any) => ({
    id: order.id,
    customer: {
      username: order.recipient.user.username,
      email: order.recipient.email,
    },
    role: "Recipient",
    entry_timestamp: new Date(order.payment.issue_date).toLocaleString(),
  }));
};

const openModal = (id: number) => {
  orderModal.order_id = id;
  orderModal.visible = true;
};

onBeforeMount(async () => {
  await fetchData();
});
</script>

<style scoped></style>
