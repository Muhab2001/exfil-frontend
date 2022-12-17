<template>
  <div>
    <CustomerOrderModal
      @closed="orderModal.visible = false"
      v-bind="orderModal"
    />

    <div class="t-flex">
      <span class="dark:t-text-white t-text-3xl t-px-4 t-mb-5 t-mr-3"
        >My Orders</span
      >
      <NSelect
        class="t-w-60"
        @update:value="fetchData"
        v-model:value="orderType"
        :options="[
          { label: 'Recieved Orders', value: 'recipient' },
          {
            label: 'Sent Orders',
            value: 'sender',
          },
        ]"
        :render-label="renderLabel"
      />
    </div>
    <!-- packages either delivered or sent by the customer -->
    <template v-if="orders.length > 0">
      <div
        class="t-w-full t-columns-1 t-column-1 md:t-columns-2 lg:t-columns-3"
      >
        <OrderCard
          @edit="(id: number) => {openModal(id)}"
          v-for="(order, index) in orders"
          :key="index"
          v-bind="order"
        />
      </div>
    </template>
    <div
      v-else
      class="t-w-full t-h-screen t-flex t-items-center t-justify-center"
    >
      <NEmpty
        size="huge"
        :description="
          orderType === 'recipient'
            ? 'No orders coming your way'
            : 'No orders are sent by you'
        "
      ></NEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import CustomerOrderModal from "@/components/CustomerOrderModal.vue";
import OrderCard from "@/components/OrderCard.vue";
import { NEmpty, NSelect, type SelectOption } from "naive-ui";
import { ref, reactive, onBeforeMount, type VNodeChild, h } from "vue";

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

const renderLabel = (option: SelectOption): VNodeChild => {
  return [
    h(
      "div",
      {
        class: "t-w-full t-mr-8",
        style: {
          width: "1000px important",
        },
      },
      {
        default: () => [option.label as string],
      }
    ),
  ];
};

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
    role: orderType.value === "sender" ? "Recipient" : "Sender",
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
