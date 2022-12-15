<template>
  <NCard
    content-style="display: flex"
    class="t-flex t-mt-3 t-mr-3 t-w-fit t-mb-6"
  >
    <template #header
      ><div>
        <div class="t-font-semibold t-text-green-400">Payments & Packages</div>
        <p>Total statistics for packages and payments</p>
      </div></template
    >
    <NStatistic
      class="t-mr-10"
      label="Total Packages"
      :value="stats.total_packages"
    >
      <template #prefix></template
    ></NStatistic>
    <NStatistic label="Confirmed Payments" :value="stats.confirmed_payments">
      <template #prefix></template
    ></NStatistic>
  </NCard>

  <NCard
    content-style="display: flex"
    class="t-flex t-mt-3 t-mb-6 t-mr-2 t-w-fit"
  >
    <template #header>
      <div>
        <div class="t-font-semibold t-text-green-400">Packages by Category</div>
        <p>Packages stats classified by category</p>
      </div>
    </template>
    <NStatistic
      class="t-mr-10"
      label="Regular Packages"
      :value="stats.categories.Regular"
    >
      <template #prefix></template
    ></NStatistic>
    <NStatistic
      class="t-mr-10"
      label="Fragile Packages"
      :value="stats.categories.Fragile"
    >
      <template #prefix></template
    ></NStatistic>
    <NStatistic
      class="t-mr-10"
      label="Liquid Packages"
      :value="stats.categories.Liquid"
    >
      <template #prefix></template
    ></NStatistic>
    <NStatistic
      class="t-mr-10"
      label="Chemical Packages"
      :value="stats.categories.Chemical"
    >
      <template #prefix></template
    ></NStatistic>
  </NCard>
  <NCard
    content-style="display: flex; flex-wrap: wrap"
    class="t-flex t-mt-3 t-w-fit t-mb-6"
  >
    <template #header>
      <div>
        <div class="t-font-semibold t-text-green-400">Packages by Status</div>
        <p>Packages stats classified by category</p>
      </div>
    </template>
    <NStatistic
      class="t-mr-10"
      label="Delivered Packages"
      :value="stats.statuses.Delivered"
    >
      <template #prefix></template
    ></NStatistic>
    <NStatistic
      class="t-mr-10"
      label="Transit Packages"
      :value="stats.statuses.Transit"
    >
      <template #prefix></template
    ></NStatistic>
    <NStatistic
      class="t-mr-10"
      label="Damaged Packages"
      :value="stats.statuses.Damaged"
    >
      <template #prefix></template
    ></NStatistic>
    <NStatistic
      class="t-mr-10"
      label="Lost Packages"
      :value="stats.statuses.Lost"
    >
      <template #prefix></template
    ></NStatistic>
  </NCard>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import type { PackageCategory, PackageStatus } from "@/enums/packages";
import { NCol, NRow, NStatistic, NCard, NTabs, NTabPane } from "naive-ui";
import { reactive, watch, watchEffect, onBeforeMount } from "vue";
import PackagesTableView from "./PackagesTableView.vue";

interface AdminStatsProps {
  range: [number, number];
  cities?: string[];
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

const fetchReportStats = async () => {
  console.log("FETCHING STATS!");

  const response = (
    await AxiosInstance.get("reports", {
      params: {
        from: new Date(props.range[0]).toISOString(),
        to: new Date(props.range[1]).toISOString(),
        cities: props.cities,
      },
    })
  ).data;

  stats.categories = {
    Chemical: 0,
    Fragile: 0,
    Liquid: 0,
    Regular: 0,
  };

  stats.statuses = {
    Damaged: 0,
    Delivered: 0,
    Lost: 0,
    Transit: 0,
  };

  response.categories.forEach((ctg: any) => {
    stats.categories[ctg.package_category as PackageCategory] =
      ctg.count as number;
  });

  response.statuses.forEach((ctg: any) => {
    stats.statuses[ctg.package_status as PackageStatus] =
      (ctg.count as number) ?? 0;
  });

  stats.confirmed_payments = response.confirmed_payments;
  stats.total_packages = response.packages_count;
};

watch(props, async () => {
  await fetchReportStats();
});

onBeforeMount(async () => {
  await fetchReportStats();
});

// code to connect the socket for live updates
</script>

<style scoped></style>
