<template>
  <NTabs type="segment" animated tab-style="min-width: 80px;">
    <NTabPane
      name="Packages"
      tab="Packages"
      class="t-text-slate-700 dark:t-text-white t-flex t-flex-wrap"
    >
      <PackageModal
        :visible="packageModal.visible"
        :package-id="packageModal.packageId"
        @closed="
          async () => {
            packageModal.visible = false;
            await handleSearch();
          }
        "
      />
      <OrderCreateModal
        :visible="orderModal"
        mode="create"
        :role="Role.ADMIN"
        @closed="orderModal = false"
      />
      <!-- 2 date pickers with v-model -->
      <div class="t-w-full t-flex t-justify-center">
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
          <NDatePicker
            v-model:value="filters.range"
            type="daterange"
            clearable
          />
        </NInputGroup>
      </div>
      <AdminStats :range="filters.range" :cities="filters.cities" />
      <PackagesTableView
        @select="handleSelect"
        @update-city="handleCityFilter"
        ref="tableRef"
        :range="filters.range"
      />
      <div class="t-fixed t-bottom-8 t-flex t-w-full t-justify-center">
        <NButton :round="true" type="primary" @click="orderModal = true">
          <template #icon>
            <NIcon :component="Add12Filled" />
          </template>
          New Order</NButton
        >
      </div>
    </NTabPane>
    <NTabPane
      class="t-text-slate-700 dark:t-text-white t-flex t-flex-wrap"
      name="Users"
      tab="Users"
      ><UserTableView
    /></NTabPane>
  </NTabs>
</template>

<script setup lang="ts">
import AdminStats from "@/components/AdminStats.vue";
import OrderCreateModal from "@/components/OrderCreateModal.vue";
import PackageModal from "@/components/PackageModal.vue";
import PackagesTableView from "@/components/PackagesTableView.vue";
import { Role } from "@/enums/roles";

import type { PackageTableRecord } from "@/typings/globals";
import { Add12Filled } from "@vicons/fluent";
import {
  NButton,
  NDatePicker,
  NInput,
  NSelect,
  NIcon,
  NInputGroup,
  NInputGroupLabel,
  NTabPane,
  NTabs,
} from "naive-ui";
import { reactive, ref, watch } from "vue";
import UserTableView from "./UserTableView.vue";

interface PackageModalState {
  visible: boolean;
  packageId: number;
}

const tableRef = ref<InstanceType<typeof PackagesTableView> | null>(null);

const handleSearch = async () => {
  await tableRef.value?.query();
};
const filters = reactive<{
  range: [number, number];
  username?: string;
  cities?: string[];
}>({
  range: [0, new Date().getTime()],
  cities: [],
});

const handleSelect = (id: number) => {
  console.log("CLICKED");

  packageModal.packageId = id;
  packageModal.visible = true;
};

const packageModal = reactive<PackageModalState>({
  visible: false,
  packageId: 0,
});

const orderModal = ref<boolean>(false);

const handleCityFilter = (cities?: string[]) => {
  console.log(cities);

  filters.cities = cities;
};
</script>

<style scoped></style>
