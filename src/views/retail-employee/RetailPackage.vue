<template>
  <div>
    <OrderCreateModal
      :role="Role.RETAIL_EMPLOYEE"
      :visible="orderModal.visible"
      :mode="orderModal.mode"
      :id="orderModal.id"
      @closed="orderModal.visible = false"
    />
    <h1 class="dark:t-text-white t-px-4 t-mb-5">Registered Orders</h1>
    <div
      v-if="orders.length > 0"
      class="t-w-full t-columns-1 t-column-1 md:t-columns-2 lg:t-columns-3"
    >
      <OrderCard
        @edit="(id) => openModal(id)"
        v-for="order in orders"
        :key="order.id"
        v-bind="order"
      />
    </div>
    <div
      v-else
      class="t-w-full t-h-screen t-flex t-items-center t-justify-center"
    >
      <NEmpty
        size="huge"
        description="
         No Registered Packages under delivery!
        "
      ></NEmpty>
    </div>
    <div class="t-fixed t-bottom-8 t-flex t-w-full t-justify-center">
      <NButton
        :round="true"
        type="primary"
        @click="
          () => {
            openModal();
          }
        "
      >
        <template #icon>
          <NIcon :component="Add12Filled" />
        </template>
        New Order</NButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import OrderCard from "@/components/OrderCard.vue";
import OrderCreateModal from "@/components/OrderCreateModal.vue";
import { Role } from "@/enums/roles";
import { Add12Filled } from "@vicons/fluent";
import { NButton, NEmpty, NIcon } from "naive-ui";
import { reactive, onBeforeMount, ref } from "vue";

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
  id?: number;
}

const orderModal = reactive<OrderModalProps>({
  visible: false,
  mode: "create",
});

const orders = ref<OrderCardProps[]>([]);

const fetchOrders = async () => {
  const response = (await AxiosInstance.get("order/retail-employee")).data;

  orders.value = response.map((order: any) => ({
    id: order.id,
    recipient: {
      customer: order.recipient ? order.recipient.user.username : "",
      email: order.recipient ? order.recipient.email : "",
    },
    role: "Recipient",
    entry_timestamp: new Date(order.payment.issue_date).toLocaleString(),
  }));

  console.log(orders.value);
};

onBeforeMount(async () => {
  await fetchOrders();
});

const openModal = (id?: number) => {
  if (id !== undefined) {
    orderModal.mode = "edit";
    orderModal.id = id;
  } else {
    orderModal.mode = "create";
  }

  orderModal.visible = true;
};
</script>

<style scoped></style>
