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
      :model="pkgmodelRefs[index]"
      :key="index"
    >
      <template v-if="index !== 0">
        <NButton strong secondary type="error" e
          >Delete Package</NButton
        ></template
      >
      <NFormItem label="Category" path="category">
        <NSelect
          v-model:value="pkgmodelRefs[index].category"
          :options="
            Object.values(PackageCategory).map((ctg) => ({
              label: ctg,
              value: ctg,
            }))
          "
        /> </NFormItem
      ><NFormItem label="Status" path="status">
        <NSelect
          v-model:value="pkgmodelRefs[index].status"
          :options="
            Object.values(PackageCategory).map((st) => ({
              label: st,
              value: st,
            }))
          "
        />
      </NFormItem>
      <NFormItem path="weight" label="Weight">
        <NInputNumber
          v-model:value="pkgmodelRefs[index].weight"
          min="0"
          clearable
        />
      </NFormItem>
      <NFormItem path="Length" label="length">
        <NInputNumber
          v-model:value="pkgmodelRefs[index].length"
          min="0"
          clearable
        />
      </NFormItem>
      <NFormItem path="width" label="Width">
        <NInputNumber
          v-model:value="pkgmodelRefs[index].width"
          min="0"
          clearable
        />
      </NFormItem>
      <NFormItem path="height" label="Height">
        <NInputNumber
          v-model:value="pkgmodelRefs[index].weight"
          min="0"
          clearable
        />
      </NFormItem>
    </NForm>
    <!-- button to add  new package form  -->
    <NButton @click="addPackage"
      ><template #icon></template>New Package</NButton
    >
    <!-- separate form for order-specific details -->
    <NForm ref="orderFormRef" :rules="orderRules" :model="orderModelRef">
      <NFormItem path="payment" label="Payment">
        <NInputNumber v-model:value="orderModelRef.payment" min="0" clearable />
      </NFormItem>
      <NFormItem path="country" label="Country">
        <NInput
          v-model:value="orderModelRef.country"
          max-length="30"
          show-count
          clearable
        />
      </NFormItem>
      <NFormItem path="city" label="City">
        <NInput
          v-model:value="orderModelRef.city"
          max-length="30"
          show-count
          clearable
        />
      </NFormItem>
      <NFormItem path="street" label="Street">
        <NInput
          v-model:value="orderModelRef.street"
          max-length="30"
          show-count
          clearable
        />
      </NFormItem>
      <NFormItem path="zipcode" label="Zipcode">
        <NInputNumber v-model:value="orderModelRef.zipcode" min="0" clearable />
      </NFormItem>
    </NForm>
    <template #footer>
      <NButton @click="submitForm" class="t-mr-2" type="success"
        >Submit</NButton
      >
      <NButton @click="$emit('closed')" type="default">Cancel</NButton>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { PackageCategory, PackageStatus } from "@/enums/packages";
import {
  NForm,
  NFormItem,
  NInputNumber,
  NInput,
  NModal,
  NSelect,
  type FormInst,
  type FormRules,
} from "naive-ui";
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
  recipient: string;
  sender: string;
}

const packageRefs = ref<Array<FormInst | null>>([]);

const pkgmodelRefs = ref<PackageModel[]>([
  {
    category: PackageCategory.REGULAR,
    status: PackageStatus.TRANSIT,
    height: 0,
    width: 0,
    length: 0,
    weight: 0,
  },
]);

const orderModelRef = ref<OrderModel>({
  payment: 0,
  city: "",
  country: "",
  zipcode: 0,
  street: "",
  recipient: "",
  sender: "",
});

const orderFormRef = ref<FormInst | null>(null);

const packageRules: FormRules = {
  category: {
    required: true,
    trigger: "blur",
    message: "Please select a package cateogry for this package",
  },
  status: {
    required: true,
    trigger: "blur",
    message: "Please select a package status for this package",
  },
  height: {
    required: true,
    trigger: "blur",
    type: "float",
  },
  width: {
    required: true,
    type: "float",
    trigger: "blur",
  },
  length: {
    required: true,
    trigger: "blur",
    type: "float",
  },
  weight: {
    required: true,
    type: "float",
    trigger: "blur",
  },
};

const orderRules: FormRules = {
  payment: {
    required: true,
    type: "float",
    trigger: "blur",
  },
  city: {
    required: true,
    type: "string",
    trigger: "blur",
  },
  country: {
    required: true,
    type: "string",
    trigger: "blur",
  },
  street: {
    required: true,
    type: "string",
    trigger: "blur",
  },
  recipient: {
    required: true,
    type: "integer",
    trigger: "blur",
  },
  sender: {
    required: true,
    type: "integer",
    trigger: "blur",
  },
  zipcode: {
    required: true,
    type: "integer",
    trigger: "blur",
  },
};

const props = defineProps<OrderModalProps>();
const emits = defineEmits<{
  (e: "closed"): void;
}>();

// TODO: reset on every opening
const sentPackages = ref<PackageModel[]>([]);

const addPackage = () => {};

const deletePackage = () => {};

const submitOrderForm = () => {
  // validate every single package form, validate the order form, and then POST to targeted endpoint
};
</script>

<style scoped></style>
