<template>
  <NCard class="t-w-fit t-mr-3">
    <template #header>
      <h1 class="t-flex t-items-center">
        <span class="t-flex t-items-center t-mr-3"
          ><NIcon
            size="30"
            color="rgb(74 222 128)"
            :component="Box20Filled" /></span
        >Package
        <span class="t-text-green-400 t-ml-3 t-font-semibold">
          #{{ props.id }}</span
        >
      </h1>
    </template>
    <h2 class="t-font-medium t-mb-4">Package Information</h2>
    <section class="t-flex t-flex-wrap">
      <!-- TODO: conditional rendering for a select input -->
      <div v-if="!props.editable">
        <div class="t-mr-8">
          <div class="t-text-lg t-text-green-400 t-font-medium">Status</div>
          <div>{{ props.status }}</div>
        </div>
      </div>
      <div v-else class="t-mr-8">
        <span class="t-text-lg t-text-green-400 t-font-medium">Status</span>

        <NSelect
          class="t-w-40 t-mt-2"
          v-model:value="currentStatus"
          @update:value="(value) => $emit('update', props.index, value)"
          :options="
            Object.values(PackageStatus).map((st) => ({ label: st, value: st }))
          "
          :render-label="renderLabel"
        />
      </div>
      <div class="t-mr-8">
        <div class="t-text-lg t-text-green-400 t-font-medium">Category</div>
        <div>{{ props.category }}</div>
      </div>
      <div class="t-mr-8">
        <div class="t-text-lg t-text-green-400 t-font-medium">Weight</div>
        <div>{{ props.weight }}</div>
      </div>
    </section>
    <h2 class="t-font-medium t-mt-5">Dimensions</h2>
    <section class="t-flex t-flex-wrap">
      <div class="t-mr-8">
        <div class="t-text-lg t-text-green-400 t-font-medium">Length</div>
        <span>{{ props.length }}</span>
      </div>
      <div class="t-mr-8">
        <div class="t-text-lg t-text-green-400 t-font-medium">Width</div>
        <span>{{ props.width }}</span>
      </div>
      <div class="t-mr-8">
        <div class="t-text-lg t-text-green-400 t-font-medium">Height</div>
        <span>{{ props.height }}</span>
      </div>
    </section>
  </NCard>
</template>

<script setup lang="ts">
import { PackageStatus, type PackageCategory } from "@/enums/packages";
import { Box20Filled } from "@vicons/fluent";
import { NCard, NSelect, NIcon, type SelectOption } from "naive-ui";
import { ref, h, type VNodeChild } from "vue";

interface PackageCardProps {
  id: number;
  index: number;
  status: PackageStatus;
  category: PackageCategory;
  weight: number;
  height: number;
  width: number;
  length: number;
  editable: boolean;
}

const props = defineProps<PackageCardProps>();
const emits = defineEmits<{
  (e: "updaate", id: number, newStatus: PackageStatus): void;
}>();

const currentStatus = ref<PackageStatus>(props.status);

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
</script>

<style scoped></style>
