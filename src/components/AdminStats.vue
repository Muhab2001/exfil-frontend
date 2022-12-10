<template>
  <div>
    <div>
      <h1>Payments & Packages</h1>
      <p>Total statistics for packages and payments</p>
    </div>
    <NRow>
      <NCol :span="12">
        <NStatistic label="Total Packages" :value="stats.total_packages">
          <template #prefix></template></NStatistic
      ></NCol>
      <NCol :span="12">
        <NStatistic
          label="Confirmed Payments"
          :value="stats.confirmed_payments"
        >
          <template #prefix></template></NStatistic
      ></NCol>
    </NRow>
    <div>
      <h1>Packages by Category</h1>
      <p>Packages stats classified by category</p>
    </div>
    <NRow>
      <NCol :span="12">
        <NStatistic label="Regular Packages" :value="stats.categories.Regular">
          <template #prefix></template></NStatistic
      ></NCol>
      <NCol :span="12">
        <NStatistic label="Fragile Packages" :value="stats.categories.Fragile">
          <template #prefix></template></NStatistic
      ></NCol>
      <NCol :span="12">
        <NStatistic label="Liquid Packages" :value="stats.categories.Liquid">
          <template #prefix></template></NStatistic
      ></NCol>
      <NCol :span="12">
        <NStatistic
          label="Chemical Packages"
          :value="stats.categories.Chemical"
        >
          <template #prefix></template></NStatistic
      ></NCol>
    </NRow>
    <div>
      <h1>Packages by Status</h1>
      <p>Packages stats classified by status</p>
    </div>
    <NRow>
      <NCol :span="12">
        <NStatistic
          label="Delivered Packages"
          :value="stats.statuses.Delivered"
        >
          <template #prefix></template></NStatistic
      ></NCol>
      <NCol :span="12">
        <NStatistic label="Transit Packages" :value="stats.statuses.Transit">
          <template #prefix></template></NStatistic
      ></NCol>
      <NCol :span="12">
        <NStatistic label="Damaged Packages" :value="stats.statuses.Damaged">
          <template #prefix></template></NStatistic
      ></NCol>
      <NCol :span="12">
        <NStatistic label="Lost Packages" :value="stats.statuses.Lost">
          <template #prefix></template></NStatistic
      ></NCol>
    </NRow>
   
  </div>
</template>

<script setup lang="ts">
import type { PackageCategory } from "@/enums/packages";
import { NCol, NRow, NStatistic } from "naive-ui";
import { reactive } from "vue";
import PackagesTableView from "./PackagesTableView.vue";

interface AdminStatsProps {
  from: number;
  to: number;
}

interface AdminStats {
  categories: {
    Regular: number;
    Fragile: number;
    Liquid: number;
    Chemical: number;
  };
  statuses: {
    Lost: number;
    Damaged: number;
    Transit: number;
    Delivered: number;
  };
  total_packages: number;
  confirmed_payments: number;
}

const props = defineProps<AdminStatsProps>();

const stats = reactive<AdminStats>({
  categories: {
    Chemical: 0,
    Fragile: 0,
    Liquid: 0,
    Regular: 0,
  },
  statuses: {
    Damaged: 0,
    Delivered: 0,
    Lost: 0,
    Transit: 0,
  },
  confirmed_payments: 0,
  total_packages: 0,
});

// code to connect the socket for live updates
</script>

<style scoped></style>
