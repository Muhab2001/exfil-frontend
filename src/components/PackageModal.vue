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
      ref="formRef
      "
      :rules="packageRules"
      :model="pkgmodel"
    >
      <NFormItem label="Category" path="category">
        <NSelect
          v-model:value="pkgmodel.category"
          :options="
            Object.values(PackageCategory).map((ctg) => ({
              label: ctg,
              value: ctg,
            }))
          "
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
        <NInputNumber v-model:value="pkgmodel.weight" min="0" clearable />
      </NFormItem>
    </NForm>
  </NModal>
</template>

<script setup lang="ts">
import { PackageStatus, PackageCategory } from "@/enums/packages";
import { onBeforeMount, reactive, ref, watch } from "vue";
import {
  type FormInst,
  type FormRules,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
} from "naive-ui";
import { AxiosInstance } from "@/axios";

interface PackageModel {
  category: PackageCategory;
  status: PackageStatus;
  height: number;
  width: number;
  length: number;
  weight: number;
}

const props = defineProps<{ visible: boolean; packageId: number }>();

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

const formRef = ref<FormInst | null>(null);

const pkgmodel = reactive<PackageModel>({
  category: PackageCategory.REGULAR,
  status: PackageStatus.TRANSIT,
  height: 0,
  width: 0,
  length: 0,
  weight: 0,
});

const fetchData = async () => {
  const fetchedPkg = await AxiosInstance.get(`package/${props.packageId}`, {
    params: `${props.packageId}`
  });

  pkgmodel.category = fetchedPkg.data.category;
  pkgmodel.status = fetchedPkg.data.status;
  pkgmodel.height = fetchedPkg.data.height;
  pkgmodel.width = fetchedPkg.data.width;
  pkgmodel.length = fetchedPkg.data.length;
  pkgmodel.weight = fetchedPkg.data.weight;
};

watch(
  () => props.visible,
  async () => {
    if (props.visible) {
      await fetchData();
    }
  }
);

</script>

<style scoped></style>
