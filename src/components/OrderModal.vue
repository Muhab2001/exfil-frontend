<template>
  <NModal
    :auto-focus="true"
    :on-esc-click="() => $emit('closed')"
    :mask-closable="false"
    :block-scroll="true"
    :trap-focus="true"
    :show="props.visible"
    title="New Order"
    transform-origin="center"
    content-style="padding-bottom: 0px"
    preset="card"
    class="t-w-full md:t-w-[80%] t-max-w-7xl"
    @close="() => $emit('closed')"
    size="large"
  >
    <!-- form for every package entered -->
    <NForm
      v-for="(pkg, index) in sentPackages"
      :ref="
        (el) => {
          packageRefs = [...packageRefs, el as unknown as  FormInst];
        }
      "
      :rules="packageRules"
      :key="index"
    ></NForm>
    <!-- button to add  new package form  -->
    <NButton><template #icon></template>New Package</NButton>
    <!-- separate form for order-specific details -->
    <NForm> </NForm>
  </NModal>
</template>

<script setup lang="ts">
import type { PackageCategory, PackageStatus } from "@/enums/packages";
import { NForm, NModal, type FormInst, type FormRules } from "naive-ui";
import { ref } from "vue";

interface OrderModalProps {
  visible: boolean;
}

interface PackageModel {
  category: PackageCategory;
  status: PackageStatus;
  height: number;
  width: number;
  length: number;
  weight: number;
}

interface OrderModel {
  payment: number;
  city: string;
  country: string;
  zipcode: number;
  street: string;
  recipient: number;
  sender: number;
}

const packageRefs = ref<Array<FormInst | null>>([]);

const orderFormRef = ref<FormInst | null>(null);

const packageRules: FormRules = {};

const orderRules: FormRules = {};

const props = defineProps<OrderModalProps>();
const emits = defineEmits<{
  (e: "closed"): void;
}>();

// TODO: reset on every opening
const sentPackages = ref<PackageModel[]>([]);

const submitOrderForm = () => {
  // validate every single package form, validate the order form, and then POST to targeted endpoint
};
</script>

<style scoped></style>
