<template>
  <NModal
    :auto-focus="true"
    :on-esc-click="() => $emit('closed')"
    :mask-closable="true"
    :block-scroll="true"
    :trap-focus="true"
    :show="props.visible"
    transform-origin="center"
    content-style="padding-bottom: 0px"
    header-style="padding-bottom: 0px"
    preset="card"
    class="t-w-full md:t-w-[80%] t-max-w-7xl t-mb-8"
    @close="() => $emit('closed')"
    size="large"
    ><template #header>
      <div class="t-flex t-flex-wrap">
        <span class="t-text-3xl t-font-semibold t-mr-5"
          >Delivery Order
          <span class="t-text-green-400">#{{ props.order_id }}</span></span
        >
        <NTag
          secondary
          round
          strong
          type="success"
          size="large"
          v-if="order.isDelivered"
        >
          <template #icon>
            <NIcon :component="CheckmarkCircle12Filled" />
          </template>
          Delivered
        </NTag>
      </div>
    </template>
    <NDivider />
    <h1 class="t-font-semibold t-flex t-flex-wrap t-pl-4">Order Details</h1>
    <section class="t-mb-4 t-pl-4">
      <span class="t-mt-1 t-inline-flex t-flex t-flex-col t-mr-10">
        <div class="t-text-xl t-mt-1 t-font-medium t-text-green-400">
          <NIcon :component="UserAlt" size="15" class="t-mr-2" />
          <span>Recipient</span>
        </div>
        <div class="t-text-lg">{{ order.recipient.username }}</div>
        <span class="t-mt-0 t-text-sm t-text-gray-400">{{
          order.recipient.email
        }}</span>
      </span>
      <span class="t-mt-2 t-inline-flex t-flex t-flex-col">
        <div
          class="t-text-xl t-mt-1 t-font-medium t-text-green-400 t-flex t-items-center"
        >
          <NIcon class="t-mr-2" :component="Location20Filled" />
          <span>Destination</span>
        </div>
        <div>
          <div class="t-text-lg">
            {{ order.destination.country }}, {{ order.destination.city }}
          </div>
          <span class="t-mt-0 t-text-sm t-text-gray-400">
            {{ order.destination.street }} -
            {{ order.destination.zipcode }}</span
          >
        </div>
      </span>
    </section>
    <NDivider title-placement="left">
      <h1 class="t-font-semibold t-flex t-flex-wrap t-mb-3">Order Packages</h1>
    </NDivider>
    <section class="t-flex t-flex-wrap">
      <PackageCard
        v-for="(pkg, index) in order.packages"
        :key="index"
        v-bind="pkg"
        :index="index"
        :editable="false"
      />
    </section>
    <div class="t-w-full t-mt-6 t-pl-4">
      <NDivider title-placement="left" class="t-mb-0">
        <h1 class="t-font-semibold t-flex t-flex-wrap t-mb-0">Delivery Path</h1>
      </NDivider>
      <NSpace vertical>
        <NSteps vertical class="t-my-6"
          ><NStep
            status="process"
            v-for="(location, index) in order.location_history"
            :key="index"
            :title="`${location.country}, ${location.city}`"
            :description="`${location.street}, zipcode: ${location.zipcode}`"
          ></NStep
        ></NSteps>
      </NSpace>
    </div>

    <NDivider title-placement="left" class="t-mb-0">
      <h1 class="t-font-semibold t-flex t-flex-wrap t-mb-0">Order Payment</h1>
    </NDivider>
    <div class="t-pl-4">
      <div class="t-text-xl t-mt-3 t-mb-1 t-font-medium t-text-green-400">
        Requested Fees
      </div>
      <div>
        <span class="t-text-4xl t-mr-2 t-font-bold">{{
          order.paymentAmount
        }}</span>
        <span class="t-text-gray-400 t-font-thin t-text-xl">SAR</span>
      </div>
    </div>
    <NDivider />
    <div class="t-py-8 t-pt-0 t-pl-4 t-text-green-400 t-font-medium">
      <h2>Status</h2>
      <NTag
        class="t-p-6 t-mt-3"
        round
        strong
        type="success"
        size="large"
        v-if="order.isPaidFor"
      >
        <template #icon>
          <NIcon :component="CheckmarkCircle12Filled" />
        </template>
        Fulfilled
      </NTag>
      <NTag class="t-p-6 t-mt-3" size="large" round type="warning" v-else
        ><template #icon> <NIcon :component="ErrorOutlined" /> </template
        >Pending</NTag
      >
    </div>
    <NButton
      v-if="!order.isDelivered"
      class="t-w-full t-mb-5"
      secondary
      strong
      type="primary"
      :disabled="order.isOTPSent"
      @click="requestOTP"
      ><template #icon
        ><NIcon :component="Money16Filled" class="t-mr-5"
      /></template>
      Pay for order</NButton
    >
    <NCollapseTransition :show="order.isOTPSent">
      <NForm
        v-if="order.isOTPSent"
        :model="otpModel"
        :rules="otpModelRules"
        ref="otpRef"
      >
        <NFormItem
          path="otp"
          label="Confirmation OTP"
          feedback="Enter the OTP sent to your email (OTP can be requested once every 3 minutes)"
        >
          <NInput
            placeholder="Enter the OTP code"
            type="text"
            v-model:value="otpModel.otp"
          />
        </NFormItem>
        <NButton
          class="t-w-full t-my-5"
          secondary
          strong
          type="primary"
          @click="confirmOTP"
        >
          Submit OTP</NButton
        >
      </NForm>
    </NCollapseTransition>
  </NModal>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import {
  PackageStatus,
  EventType,
  PackageLocationType,
  locationTypeMapper,
} from "@/enums/packages";
import type {
  PackageTableRecord,
  User,
  PackageLocation,
} from "@/typings/globals";
import {
  CheckmarkCircle12Filled,
  Money16Filled,
  Location20Filled,
} from "@vicons/fluent";
import { UserAlt } from "@vicons/fa";
import { ErrorOutlined } from "@vicons/material";
import {
  NForm,
  NFormItem,
  NModal,
  NCard,
  NSelect,
  NSpace,
  NInput,
  NInputNumber,
  NButton,
  NStatistic,
  NStep,
  NSteps,
  useLoadingBar,
  useMessage,
  type FormInst,
  type FormRules,
  NDivider,
  type SelectOption,
  NIcon,
  NTag,
  NCollapseTransition,
} from "naive-ui";
import { reactive, watch, ref, type VNodeChild, h } from "vue";
import LocationCard from "./LocationCard.vue";
import PackageCard from "./PackageCard.vue";

interface CustomerModalProps {
  order_id: number;
  visible: boolean;
}

console.log(Object.values(PackageLocationType));

interface OrderState {
  packages: PackageTableRecord[];
  recipient: { username: string; email: string };
  entry_timestamp: string;
  destination: Omit<PackageLocation, "timestamp">;
  location_history: PackageLocation[];
  isDelivered: boolean;
  isOTPSent: boolean;
  isPaidFor: boolean;
  paymentId: number;
  paymentAmount: number;
}

interface OrderModel {
  city: string;
  country: string;
  zipcode: number;
  street: string;
  transport: EventType.Truck;
  location_type: PackageLocationType;
  statuses: { id: number; status: PackageStatus }[];
}

const props = defineProps<CustomerModalProps>();
const emits = defineEmits<{ (e: "closed"): void }>();

// TODO fetch the information on modal visibility
const order = ref<OrderState>({
  packages: [],
  entry_timestamp: new Date().toLocaleDateString(),
  location_history: [],
  destination: {
    city: "",
    country: "",
    street: "",
    zipcode: "",
  },
  recipient: {
    username: "",
    email: "",
  },
  isDelivered: false,
  isOTPSent: false,
  isPaidFor: false,
  paymentId: 0,
  paymentAmount: 0,
});

const message = useMessage();
const loading = useLoadingBar();

const fetchData = async () => {
  const response = (await AxiosInstance.get("order/" + props.order_id)).data;
  const statuses: { id: number; status: PackageStatus }[] = [];
  const pkgObjs: PackageTableRecord[] = response.packages.map((pkg: any) => {
    statuses.push({
      id: pkg.package_number as number,
      status: pkg.status as PackageStatus,
    });
    return {
      id: pkg.package_number,
      category: pkg.category,
      status: pkg.status,
      height: pkg.height,
      width: pkg.width,
      length: pkg.length,
      weight: pkg.weight,
      insurance_amount: pkg.insurance_amount,
    };
  });

  order.value = {
    packages: pkgObjs,
    entry_timestamp: response.packages[0].entry_timestamp,
    location_history: response.packages[0].package_locations.map(
      (location: any) => location.address
    ),
    destination: {
      city: response.final_destination.city,
      country: response.final_destination.country,
      zipcode: response.final_destination.zipcode,
      street: response.final_destination.street,
    },
    recipient: {
      username: response.recipient.user.username,
      email: response.recipient.email,
    },
    isDelivered: Boolean(response.isDelivered),
    isOTPSent: response.isOTPSent,
    isPaidFor: Boolean(response.payment.fulfilled),
    paymentId: response.payment.id,
    paymentAmount: response.payment.amount,
  };

  console.log(order.value);
};

watch(
  () => props.visible,
  async () => {
    await fetchData();
  }
);

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

const otpRef = ref<FormInst | null>(null);

const otpModel = ref<{ otp: string }>({
  otp: "",
});

const otpModelRules: FormRules = {
  otp: {
    required: true,
    type: "string",
    message: "Enter a matching otp to the one sent to your email",
  },
};

const requestOTP = async () => {
  loading.start();
  try {
    message.success("OTP has been sent to your email");
    await AxiosInstance.patch("payment/request");
    order.value.isOTPSent = true;

    loading.finish();
  } catch (e) {
    loading.error();
  }
};

const confirmOTP = () => {
  loading.start();
  otpRef.value?.validate(async (errors) => {
    if (!errors) {
      await AxiosInstance.patch("payment/fulfill/" + order.value.paymentId, {
        otp: otpModel.value.otp,
      });
      message.success("Payment Recorded Succesfully!");
      emits("closed");
      loading.finish();
    } else {
      message.error("Invalid OTP");
      loading.error();
    }
  });
};
</script>

<style scoped></style>
