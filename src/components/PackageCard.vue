<template>
  <NCard>
    <template #header>
      <h1>Package #{{ props.id }}</h1>
    </template>
    <section>
      <h3>Sender</h3>
      <div>{{ props.sender }}</div>
    </section>
    <section>
      <h3>Recipient</h3>
      <div>{{ props.recipient }}</div>
    </section>
    <section>
      <h3>Package Information</h3>
      <!-- TODO: conditional rendering for a select input -->
      <div v-if="props.editable">
        <span>Status</span><span>{{ props.status }}</span>
      </div>
      <div v-else>
        <NSelect
          v-model:value="currentStatus"
          @update:value="(value) => $emit('switchStatus', props.id, value)"
          :options="
            Object.values(PackageStatus).map((st) => ({ label: st, value: st }))
          "
        />
      </div>
      <div>
        <span>Category</span><span>{{ props.category }}</span>
      </div>
      <div>
        <span>Weight</span><span>{{ props.weight }}</span>
      </div>
      <div>
        <span>Entry Timestamp</span><span>{{ props.entry_timestamp }}</span>
      </div>
    </section>
    <section>
      <h3>Dimenstions</h3>
      <div>
        <span>Length</span><span>{{ props.length }}</span>
      </div>
      <div>
        <span>Width</span><span>{{ props.width }}</span>
      </div>
      <div>
        <span>Height</span><span>{{ props.height }}</span>
      </div>
    </section>
    <template #footer> Expected Delivery {{ props.delivery_date }} </template>
  </NCard>
</template>

<script setup lang="ts">
import { PackageStatus, type PackageCategory } from "@/enums/packages";
import { NCard, NSelect } from "naive-ui";
import { ref } from "vue";

interface PackageCardProps {
  id: number;
  delivery_date?: string;
  customer_name: string;
  entry_timestamp: string;
  status: PackageStatus;
  category: PackageCategory;
  address: string;
  orderNumber: number;
  weight: number;
  height: number;
  width: number;
  length: number;
  sender: string;
  recipient: string;
  editable: boolean;
}

const props = defineProps<PackageCardProps>();
const emits = defineEmits<{
  (e: "switchStatus", id: number, newStatus: PackageStatus): void;
}>();

const currentStatus = ref<PackageStatus>(props.status);
</script>

<style scoped></style>
