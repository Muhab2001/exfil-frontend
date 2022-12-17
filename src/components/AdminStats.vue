<template>
  <div class="t-columns-1 md:t-columns-auto md:t-flex md:t-flex-wrap t-w-full">
    <NCard
      content-style="display: flex"
      class="t-flex t-mt-3 t-mr-3 t-w-full md:t-w-fit t-mb-6 t-break-inside-avoid"
    >
      <template #header
        ><div>
          <div class="t-font-semibold t-text-green-400">
            Payments & Packages
          </div>
          <p>Total statistics for packages and payments</p>
        </div></template
      >
      <NStatistic
        class="t-mr-10"
        label="Total Packages"
        :value="stats.total_packages"
      >
        <template #suffix>
          <NIcon color="rgb(74 222 128)" :component="Box16Filled" /></template
      ></NStatistic>
      <NStatistic label="Confirmed Payments" :value="stats.confirmed_payments">
        <template #value>
          <span class="t-mr-2">{{ stats.total_packages }}%</span>
        </template>
        <template #suffix>
          <span class="t-inline-flex t-items-center">
            <span class="t-text-green-400 t-mr-1"
              >({{
                stats.confirmed_payments && stats.total_packages
                  ? Math.trunc(stats.confirmed_payments / stats.total_packages)
                  : 0
              }}%)</span
            >
            <NIcon color="rgb(74 222 128)" :component="Money16Filled" />
          </span>
        </template>
      </NStatistic>
    </NCard>
    <NCard
      content-style="display: flex"
      class="t-flex t-mt-3 t-mb-6 t-mr-2 t-w-full md:t-w-fit t-break-inside-avoid"
    >
      <template #header>
        <div>
          <div class="t-font-semibold t-text-green-400">
            Packages by Category
          </div>
          <p>Packages stats classified by category</p>
        </div>
      </template>
      <NStatistic
        class="t-mr-10"
        label="Regular Packages"
        :value="stats.categories.Regular"
      >
        <template #suffix>
          <NIcon color="grey" :component="Box16Filled" /></template
      ></NStatistic>
      <NStatistic
        class="t-mr-10"
        label="Fragile Packages"
        :value="stats.categories.Fragile"
      >
        <template #suffix>
          <NIcon color="rgb(96 165 250)" :component="Fragile" /></template
      ></NStatistic>
      <NStatistic
        class="t-mr-10"
        label="Liquid Packages"
        :value="stats.categories.Liquid"
      >
        <template #suffix>
          <NIcon
            color="rgb(250 204 21)"
            :component="LocalDrinkRound" /></template
      ></NStatistic>
      <NStatistic
        class="t-mr-10"
        label="Chemical Packages"
        :value="stats.categories.Chemical"
      >
        <template #suffix>
          <NIcon color="rgb(248 113 113)" :component="Biohazard" /></template
      ></NStatistic>
    </NCard>
    <NCard
      content-style="display: flex; flex-wrap: wrap"
      class="t-flex t-mt-3 t-w-full md:t-w-fit t-mb-6 t-break-inside-avoid"
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
        <template #suffix>
          <NIcon
            color="rgb(74 222 128)"
            :component="CheckmarkCircle" /></template
      ></NStatistic>
      <NStatistic
        class="t-mr-10"
        label="Transit Packages"
        :value="stats.statuses.Transit"
      >
        <template #suffix>
          <NIcon
            color="rgb(96 165 250)"
            :component="DirectionsTransitFilledFilled" /></template
      ></NStatistic>
      <NStatistic
        class="t-mr-10"
        label="Damaged Packages"
        :value="stats.statuses.Damaged"
      >
        <template #suffix>
          <NIcon
            color="rgb(250 204 21)"
            :component="Warning24Filled" /></template
      ></NStatistic>
      <NStatistic
        class="t-mr-10"
        label="Lost Packages"
        :value="stats.statuses.Lost"
      >
        <template #suffix>
          <NIcon
            color="rgb(248 113 113)"
            :component="ErrorCircle24Filled" /></template
      ></NStatistic>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import type { PackageCategory, PackageStatus } from "@/enums/packages";
import { Fragile } from "@vicons/carbon";
import { Biohazard } from "@vicons/fa";
import {
  Box16Filled,
  ErrorCircle24Filled,
  Money16Filled,
  Warning24Filled,
} from "@vicons/fluent";
import { CheckmarkCircle } from "@vicons/ionicons5";
import {
  DirectionsTransitFilledFilled,
  LocalDrinkRound,
} from "@vicons/material";
import {
  NCol,
  NRow,
  NStatistic,
  NCard,
  NTabs,
  NTabPane,
  NIcon,
} from "naive-ui";
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
