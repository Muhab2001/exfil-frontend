<template>
  <div class="t-min-h-screen t-w-full">
    <div class="t-w-full t-flex t-justify-center">
      <OrderCreateModal
        v-bind="orderModal"
        :role="Role.ADMIN"
        @closed="orderModal.visible = false"
      />
      <NInputGroup class="t-max-w-[960px] t-mb-5"
        ><NInput
          v-model:value="filters.username"
          type="text"
          placeholder="Enter the sender username"
        /><NButton @click="handleSearch" secondary type="success"
          >Search</NButton
        ></NInputGroup
      >
    </div>
    <div class="t-w-full t-flex t-justify-center">
      <NInputGroup class="t-max-w-[960px] t-mb-5 t-justify-center">
        <NInputGroupLabel>Entry Timestamp</NInputGroupLabel>
        <NDatePicker v-model:value="filters.range" type="daterange" clearable />
      </NInputGroup>
    </div>
    <OrdersTableView
      @select="handleSelect"
      ref="tableRef"
      :range="filters.range"
      :username="filters.username"
    />
    <div class="t-fixed t-bottom-8 t-flex t-w-full t-justify-center">
      <NButton :round="true" type="primary" @click="openCreateModal">
        <template #icon>
          <NIcon :component="Add12Filled" />
        </template>
        New Order</NButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { Add12Filled } from "@vicons/fluent";
import { reactive } from "vue";
import OrdersTableView from "@/components/OrdersTableView.vue";
import { Role } from "@/enums/roles";
import { ref } from "vue";
import OrderCreateModal from "@/components/OrderCreateModal.vue";
import {
  NButton,
  NDatePicker,
  NIcon,
  NInput,
  NInputGroup,
  NInputGroupLabel,
} from "naive-ui";

const orderModal = reactive<{
  visible: boolean;
  mode: "edit" | "create";
  id?: number;
}>({
  visible: false,
  mode: "create",
});

const filters = reactive<{
  range: [number, number];
  username?: string;
  cities?: string[];
}>({
  range: [0, new Date().getTime()],
  cities: [],
});

const tableRef = ref<InstanceType<typeof OrdersTableView> | null>(null);

const handleSearch = async () => {
  await tableRef.value?.query();
};

const openCreateModal = () => {
  orderModal.id = 0;
  orderModal.visible = true;
  orderModal.mode = "create";
};

const handleSelect = (id: number) => {
  console.log("CLICKED");

  orderModal.id = id;
  orderModal.visible = true;
  orderModal.mode = "edit";
};
</script>

<style scoped></style>
