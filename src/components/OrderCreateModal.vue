<template>
  <NModal
    :auto-focus="true"
    :on-esc-click="() => $emit('closed')"
    :mask-closable="false"
    :block-scroll="true"
    :trap-focus="true"
    :show="props.visible"
    :title="props.mode === 'create' ? 'New Order' : 'Edit Order #' + props.id"
    transform-origin="center"
    content-style="padding-bottom: 0px"
    preset="card"
    class="t-w-full md:t-w-[80%] t-max-w-7xl"
    @close="() => $emit('closed')"
    size="large"
  >
    <NDivider class="t-mt-0" />
    <!-- form for every package entered -->
    <NForm
      v-for="(pkg, index) in pkgmodelRefs"
      :ref="
        (el) => {
          packageRefs[index] = el as unknown as FormInst;
        }
      "
      :rules="packageRules"
      :model="pkgmodelRefs[index]"
      :key="index"
      class="t-mb-8"
    >
      <NSpace align="center">
        <h2 class="t-mb-5">
          Package
          <span class="t-text-green-400 t-font-semibold">#{{ index + 1 }}</span>
        </h2>
        <template v-if="index !== 0 && props.mode === 'create'">
          <NButton
            @click="() => deletePackage(index)"
            strong
            secondary
            type="error"
          >
            <template #icon>
              <NIcon :component="Delete24Filled" />
            </template>
            Delete Package</NButton
          ></template
        >
      </NSpace>
      <NFormItem label="Category" path="category">
        <NSelect
          :disabled="props.mode === 'edit'"
          :render-label="renderLabel"
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
          :disabled="props.mode === 'edit'"
          :render-label="renderLabel"
          v-model:value="pkgmodelRefs[index].status"
          :options="
            Object.values(PackageStatus).map((st) => ({
              label: st,
              value: st,
            }))
          "
        />
      </NFormItem>
      <NFormItem path="weight" label="Weight">
        <NInputNumber
          :disabled="props.mode === 'edit'"
          v-model:value="pkgmodelRefs[index].weight"
          min="0"
          clearable
        />
      </NFormItem>
      <NFormItem path="length" label="Length">
        <NInputNumber
          :disabled="props.mode === 'edit'"
          v-model:value="pkgmodelRefs[index].length"
          min="0"
          clearable
        />
      </NFormItem>
      <NFormItem path="width" label="Width">
        <NInputNumber
          :disabled="props.mode === 'edit'"
          v-model:value="pkgmodelRefs[index].width"
          min="0"
          clearable
        />
      </NFormItem>
      <NFormItem path="height" label="Height">
        <NInputNumber
          :disabled="props.mode === 'edit'"
          v-model:value="pkgmodelRefs[index].height"
          min="0"
          clearable
        />
      </NFormItem>
      <NFormItem path="insurance_amount" label="Insurance Amount">
        <NInputNumber
          :disabled="props.mode === 'edit'"
          v-model:value="pkgmodelRefs[index].insurance_amount"
          min="0"
          clearable
        />
      </NFormItem>
      <NDivider />
    </NForm>
    <!-- button to add  new package form  -->
    <NButton
      v-if="props.mode === 'create'"
      class="t-w-full"
      secondary
      strong
      type="success"
      @click="addPackage"
    >
      <template #icon> <NIcon :component="Add12Filled" /> </template>New
      Package</NButton
    >
    <!-- separate form for order-specific details -->
    <NForm
      class="t-mt-5"
      ref="orderFormRef"
      :rules="orderRules"
      :model="orderModelRef"
    >
      <h2 class="t-mb-3">Order Details</h2>
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
        <NInputNumber v-model:value="orderModelRef.zipcode" clearable />
      </NFormItem>
      <NDivider />
      <h2 class="t-mb-4">Recipient</h2>

      <NFormItem path="recipient.email" label="Email">
        <NInput
          v-model:value="orderModelRef.recipient.email"
          type="text"
          clearable
        />
      </NFormItem>

      <NDivider />
      <h2 class="t-mb-4">Sender</h2>

      <NFormItem class="t-mb-2" path="recipient.email" label="Email">
        <NInput
          v-model:value="orderModelRef.sender.email"
          type="text"
          clearable
        />
      </NFormItem>
      <NDivider />
      <h2 class="t-mb-4">Delivery Employee</h2>
      <NFormItem class="t-mb-2" path="delivery_email" label="Email">
        <NInput
          v-model:value="orderModelRef.delivery_email"
          type="text"
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
import { AxiosInstance } from "@/axios";
import { PackageCategory, PackageStatus } from "@/enums/packages";
import type { OrderModel } from "@/typings/globals";
import { Add12Filled, Delete24Filled } from "@vicons/fluent";
import {
  NForm,
  NFormItem,
  NInputNumber,
  NInput,
  NModal,
  NSelect,
  NButton,
  type FormInst,
  type FormRules,
  NDivider,
  NSpace,
  useMessage,
  NIcon,
  type SelectOption,
  type FormItemRule,
} from "naive-ui";
import { ref, watch, onBeforeUpdate, type VNodeChild, h } from "vue";

interface OrderModalProps {
  visible: boolean;
  mode: "edit" | "create";
  id?: number;
}

interface PackageModel {
  category: PackageCategory;
  status: PackageStatus;
  height: number;
  width: number;
  length: number;
  weight: number;
  insurance_amount: number;
}

const packageRefs = ref<Array<FormInst | null>>([]);

onBeforeUpdate(() => {
  packageRefs.value = [];
});

const pkgmodelRefs = ref<PackageModel[]>([
  {
    category: PackageCategory.REGULAR,
    status: PackageStatus.TRANSIT,
    height: 0,
    width: 0,
    length: 0,
    weight: 0,
    insurance_amount: 0,
  },
]);

const orderModelRef = ref<OrderModel>({
  payment: 0,
  city: "",
  country: "",
  zipcode: 0,
  street: "",
  recipient: {
    email: "",
  },
  sender: {
    email: "",
  },
  delivery_email: "",
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
    type: "number",
    validator(rule: FormItemRule, value: number) {
      if (value <= 0) return new Error("Height must be a positive number");
      return true;
    },
  },
  width: {
    required: true,
    type: "number",
    trigger: "blur",
    validator(rule: FormItemRule, value: number) {
      if (value <= 0) return new Error("Width must be a positive number");
      return true;
    },
  },
  length: {
    required: true,
    trigger: "blur",
    type: "number",
    validator(rule: FormItemRule, value: number) {
      if (value <= 0) return new Error("Length must be a positive number");
      return true;
    },
  },
  weight: {
    required: true,
    type: "number",
    trigger: "blur",
    validator(rule: FormItemRule, value: number) {
      if (value <= 0) return new Error("Weight must be a positive number");
      return true;
    },
  },
  insurance_amount: {
    required: true,
    type: "number",
    trigger: "blur",
  },
};

const orderRules: FormRules = {
  payment: {
    required: true,
    type: "number",
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
    email: {
      required: true,
      type: "email",
      trigger: "blur",
    },
  },
  sender: {
    email: {
      required: true,
      type: "email",
      trigger: "blur",
    },
  },
  delivery_mail: {
    required: true,
    type: "email",
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

watch(
  () => props.visible,
  async () => {
    if (props.visible) {
      if (props.mode === "create") {
        pkgmodelRefs.value = [
          {
            category: PackageCategory.REGULAR,
            status: PackageStatus.TRANSIT,
            height: 0,
            width: 0,
            length: 0,
            weight: 0,
            insurance_amount: 0,
          },
        ];

        packageRefs.value = [];
        orderModelRef.value = {
          payment: 0,

          city: "",
          country: "",
          zipcode: 0,
          street: "",
          recipient: {
            email: "",
          },
          sender: {
            email: "",
          },
          delivery_email: "",
        };
        // empty all fields
      } else {
        const response = (await AxiosInstance.get("order/" + props.id)).data;
        // pre-fill all fields with passed data
        packageRefs.value = [];
        orderModelRef.value = {
          payment: response.payment.amount,
          city: response.final_destination.city,
          country: response.final_destination.country,
          zipcode: response.final_destination.zipcode,
          street: response.final_destination.street,
          recipient: {
            email: response.recipient.email,
          },
          sender: {
            email: response.sender.email,
          },
          delivery_email: response.deliveryEmployee.company_email,
        };

        pkgmodelRefs.value = response.packages.map((pkg: any) => ({
          category: pkg.category,
          status: pkg.status,
          height: pkg.height,
          width: pkg.width,
          length: pkg.length,
          weight: pkg.weight,
          insurance_amount: pkg.insurance_amount,
        }));
      }
    }
  }
);

const addPackage = () => {
  pkgmodelRefs.value = [
    ...pkgmodelRefs.value,
    {
      category: PackageCategory.REGULAR,
      status: PackageStatus.TRANSIT,
      height: 0,
      width: 0,
      length: 0,
      weight: 0,
      insurance_amount: 0,
    },
  ];
};

const message = useMessage();

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

const deletePackage = (index: number) => {
  pkgmodelRefs.value.splice;
};

const submitForm = async () => {
  console.log(packageRefs.value);
  let valid: boolean = true;

  packageRefs.value.forEach((formRef, index) => {
    formRef?.validate(async (errors) => {
      if (errors) {
        valid = false;
      }
    });
  });

  orderFormRef.value?.validate(async (errors) => {
    if (errors) {
      let valid = false;
    }
  });
  if (valid) {
    try {
      if (props.mode === "create") {
        await AxiosInstance.post("order", {
          packages: pkgmodelRefs.value,
          payment: orderModelRef.value.payment,
          city: orderModelRef.value.city,
          country: orderModelRef.value.country,
          zipcode: orderModelRef.value.zipcode.toString(),
          street: orderModelRef.value.street,
          sender: orderModelRef.value.sender.email,
          recipient: orderModelRef.value.recipient.email,
          delivery_employee: orderModelRef.value.delivery_email,
        });
        message.success("Order Created Successfully!");
      } else if (props.mode === "edit") {
        await AxiosInstance.put("order/" + props.id, {
          payment: orderModelRef.value.payment,
          city: orderModelRef.value.city,
          country: orderModelRef.value.country,
          zipcode: orderModelRef.value.zipcode.toString(),
          street: orderModelRef.value.street,
          sender: orderModelRef.value.sender.email,
          recipient: orderModelRef.value.recipient.email,
          delivery_employee: orderModelRef.value.delivery_email,
        });
        message.success("Order Updated Successfully!");
      }
      emits("closed");
    } catch (e) {
      console.log(e);

      message.error("Order Creation failed");
    }
  } else {
    message.error("Order Creation failed");
  }
  // validate every single package form, validate the order form, and then POST to targeted endpoint
};
</script>

<style scoped></style>
