<template>
  <NTabs type="bar" animated tab-style="min-width: 80px;">
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
    </NTabPane>
    <NTabPane
      class="t-text-slate-700 dark:t-text-white t-flex t-flex-wrap"
      name="Users"
      tab="Users"
    ></NTabPane>
  </NTabs>
</template>

<script setup lang="ts">
import AdminStats from "@/components/AdminStats.vue";
import PackageModal from "@/components/PackageModal.vue";
import PackagesTableView from "@/components/PackagesTableView.vue";

import type { PackageTableRecord } from "@/typings/globals";
import {
  NButton,
  NDatePicker,
  NInput,
  NSelect,
  NInputGroup,
  NInputGroupLabel,
  NTabPane,
  NTabs,
} from "naive-ui";
import { reactive, ref, watch } from "vue";

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

const handleCityFilter = (cities?: string[]) => {
  console.log(cities);

  filters.cities = cities;
};
</script>

<style scoped></style>
