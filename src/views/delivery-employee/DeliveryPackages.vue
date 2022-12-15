<template>
  <div>
    <OrderDeliveryModal
      v-bind="orderModal"
      @closed="orderModal.visible = false"
    />
    <h1 class="dark:t-text-white t-px-4 t-mb-5">Assigned Orders</h1>
    <div class="t-w-full t-columns-1 t-column-1 md:t-columns-2 lg:t-columns-3">
      <OrderCard
        @edit="(id) => openModal(id)"
        v-for="order in orders"
        :key="order.id"
        v-bind="order"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import OrderCard from "@/components/OrderCard.vue";
import OrderDeliveryModal from "@/components/OrderDeliveryModal.vue";
import { ref, reactive, onBeforeMount } from "vue";

interface OrderCardProps {
  id: number;
  customer: {
    username: string;
    email: string;
  };
  role: "Recipient" | "Sender";
  entry_timestamp: string;
}

interface OrderModalProps {
  visible: boolean;
  mode: "edit" | "create";
  order_id: number;
}

const orderModal = reactive<OrderModalProps>({
  visible: false,
  mode: "create",
  order_id: 0,
});

const orders = ref<OrderCardProps[]>([]);

const fetchOrders = async () => {
  const response = (await AxiosInstance.get("order/delivery-employee")).data;

  orders.value = response.map((order: any) => ({
    id: order.id,
    customer: {
      customer: order.recipient ? order.recipient.user.username : "",
      email: order.recipient ? order.recipient.email : "",
    },
    role: "Recipient",
    entry_timestamp: new Date(order.payment.issue_date).toLocaleString(),
  }));
};

onBeforeMount(async () => {
  await fetchOrders();
});

const openModal = (id?: number) => {
  if (id !== undefined) {
    orderModal.mode = "edit";
    orderModal.order_id = id;
  } else {
    orderModal.mode = "create";
  }

  orderModal.visible = true;
};
</script>

<style scoped></style>
