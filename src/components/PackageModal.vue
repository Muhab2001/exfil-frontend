<template>
  <NModal
    :auto-focus="true"
    :on-esc-click="() => $emit('closed')"
    :mask-closable="false"
    :block-scroll="true"
    :trap-focus="true"
    :show="props.visible"
    :title="`Edit Package #` + props.packageId"
    transform-origin="center"
    content-style="padding-bottom: 0px"
    preset="card"
    class="t-w-full md:t-w-[80%] t-max-w-7xl"
    @close="() => $emit('closed')"
    size="large"
  >
    <!-- form for every package entered -->
    <div>
      <NCard class="t-w-full t-mb-6">
        <template #header><h2>Package Source</h2></template>
        <div class="t-flex t-w-full t-flex-wrap t-text-sm">
          <NStatistic
            class="t-mr-10"
            label="Retail Center"
            :value="staticStatus.retail_center"
          />
          <NStatistic
            class="t-mr-10"
            label="Retail Employee"
            :value="staticStatus.retail_employee"
          />
        </div>
        <div class="t-flex t-w-full t-flex-wrap t-text-sm t-mt-5">
          <NStatistic
            class="t-mr-10"
            label="Entry date"
            :value="staticStatus.entry_timestamp"
          />
          <NStatistic label="Sender" :value="staticStatus.sender" />
        </div>
      </NCard>
      <NCard class="t-w-full t-mb-6">
        <template #header> <h2>Package Tracking</h2> </template>
        <div class="t-flex t-w-full t-flex-wrap t-text-sm">
          <NStatistic
            style="color: red"
            class="t-mr-10"
            label="Delivery Employee"
            :value="staticStatus.delivery_employee"
          />
          <NStatistic label="Recipient" :value="staticStatus.reciever" />
          <div class="t-w-full t-mt-6">
            <h2 class="t-font-medium t-mb-5 t-mt-5">Recorded Locations</h2>
            <NSpace vertical>
              <NSteps
                ><NStep
                  v-for="(location, index) in staticStatus.location_history"
                  :key="index"
                  :title="`${location.country}, ${location.city}`"
                  :description="`${location.street}, zipcode: ${location.zipcode}`"
                ></NStep
              ></NSteps>
            </NSpace>
          </div>
        </div>
      </NCard>
    </div>
    <NForm ref="formRef" :rules="packageRules" :model="pkgmodel">
      <NFormItem label="Category" path="category">
        <NSelect
          v-model:value="pkgmodel.category"
          :options="
            Object.values(PackageCategory).map((ctg) => ({
              label: ctg,
              value: ctg,
            }))
          "
          :render-label="renderLabel"
        /> </NFormItem
      ><NFormItem label="Status" path="status">
        <NSelect
          v-model:value="pkgmodel.status"
          :options="
            Object.values(PackageStatus).map((st) => ({
              label: st,
              value: st,
            }))
          "
          :render-label="renderLabel"
        />
      </NFormItem>
      <NFormItem path="weight" label="Weight">
        <NInputNumber v-model:value="pkgmodel.weight" min="0" clearable />
      </NFormItem>
      <NFormItem path="Length" label="length">
        <NInputNumber v-model:value="pkgmodel.length" min="0" clearable />
      </NFormItem>
      <NFormItem path="width" label="Width">
        <NInputNumber v-model:value="pkgmodel.width" min="0" clearable />
      </NFormItem>
      <NFormItem path="height" label="Height">
        <NInputNumber v-model:value="pkgmodel.height" min="0" clearable />
      </NFormItem>
      <NFormItem path="insurance_amount" label="Insurance Amount">
        <NInputNumber
          v-model:value="pkgmodel.insurance_amount"
          min="0"
          clearable
        />
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
import { PackageStatus, PackageCategory } from "@/enums/packages";
import { h, reactive, ref, watch, type VNodeChild } from "vue";
import {
  type FormInst,
  type FormRules,
  NForm,
  NFormItem,
  NModal,
  NInputNumber,
  NCard,
  NStatistic,
  NStep,
  NSpace,
  NSteps,
  useMessage,
  useLoadingBar,
  NSelect,
  NButton,
  type SelectOption,
} from "naive-ui";
import { AxiosInstance } from "@/axios";

interface PackageModel {
  category: PackageCategory;
  status: PackageStatus;
  height: number;
  width: number;
  length: number;
  weight: number;
  insurance_amount: number;
}

const props = defineProps<{ visible: boolean; packageId: number }>();
const emit = defineEmits<{ (e: "closed"): void }>();

watch(
  () => props.visible,
  async () => {
    await fetchData();
  }
);

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
    type: "number",
  },
  width: {
    required: true,
    type: "number",
    trigger: "blur",
  },
  length: {
    required: true,
    trigger: "blur",
    type: "number",
  },
  weight: {
    required: true,
    type: "number",
    trigger: "blur",
  },
  insurance_amount: {
    required: true,
    type: "number",
    trigger: "blur",
  },
};

const staticStatus = reactive<{
  orderId: number;

  location_history: {
    city: string;
    country: string;
    street: string;
    zipcode: number;
  }[];
  retail_employee: string;
  delivery_employee: string;
  retail_center: string;
  sender: string;
  reciever: string;
  entry_timestamp: string;
}>({
  orderId: 0,
  location_history: [],
  retail_employee: "",
  delivery_employee: "",
  retail_center: "",
  sender: "",
  reciever: "",
  entry_timestamp: "",
});

const formRef = ref<FormInst | null>(null);

const message = useMessage();
const loading = useLoadingBar();

const pkgmodel = reactive<PackageModel>({
  category: PackageCategory.REGULAR,
  status: PackageStatus.TRANSIT,
  height: 0,
  width: 0,
  length: 0,
  weight: 0,
  insurance_amount: 0,
});

const fetchData = async () => {
  loading.start();
  const pkg = (await AxiosInstance.get(`package/${props.packageId}`)).data;

  // package model
  pkgmodel.category = pkg.category;
  pkgmodel.status = pkg.status;
  pkgmodel.height = pkg.height;
  pkgmodel.width = pkg.width;
  pkgmodel.length = pkg.length;
  pkgmodel.weight = pkg.weight;
  // package staic status
  staticStatus.orderId = pkg.delivery_order.id;

  staticStatus.location_history = pkg.package_locations.map(
    (location: any) => location.address
  );

  staticStatus.retail_center =
    pkg.delivery_order.retail_employee.retail_center.name;
  staticStatus.retail_employee =
    pkg.delivery_order.retail_employee.user.username;
  staticStatus.delivery_employee =
    pkg.delivery_order.deliveryEmployee.user.username;
  console.log(pkg.delivery_order);

  staticStatus.sender = pkg.delivery_order.sender.user.username;
  staticStatus.reciever = pkg.delivery_order.recipient.user.username;
  staticStatus.entry_timestamp = new Date(pkg.entry_timestamp).toLocaleString();

  loading.finish();
};

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

const submitForm = () => {
  console.log("HELLO FORM");
  formRef.value?.validate(async (errors) => {
    loading.start();

    if (!errors) {
      console.log("FETCHING!");

      await AxiosInstance.patch("package/" + props.packageId, {
        category: pkgmodel.category,
        status: pkgmodel.status,
        height: pkgmodel.height,
        width: pkgmodel.weight,
        length: pkgmodel.length,
        weight: pkgmodel.weight,
        insurance_amount: pkgmodel.insurance_amount,
      });
      emit("closed");
      loading.finish();
      message.success("Package update successfully");
    } else {
      message.error("Failed to update the package");
      loading.error();
    }
  });
};
</script>

<style scoped></style>
