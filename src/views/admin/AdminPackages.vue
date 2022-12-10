<template>
  <div>
    <!-- 2 date pickers with v-model -->
    <AdminStats :from="dateFilters.from" :to="dateFilters.to" />
    <PackagesTableView
      :from="dateFilters.from"
      :to="dateFilters.to"
      :on-row-selected="(row) => {}"
    />
  </div>
</template>

<script setup lang="ts">
import AdminStats from "@/components/AdminStats.vue";
import PackagesTableView from "@/components/PackagesTableView.vue";
import type { PackageRecord } from "@/typings/globals";
import { reactive } from "vue";

interface PackageModalState {
  visible: boolean;
}

const dateFilters = reactive<{ from: number; to: number }>({
  from: 0,
  to: new Date().getTime(),
});

const packageModalState = reactive<PackageModalState>({
  visible: false,
});

const selectPackage = (row: PackageRecord) => {};
</script>

<style scoped></style>
