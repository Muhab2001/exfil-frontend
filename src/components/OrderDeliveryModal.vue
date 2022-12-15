<template>
  <NModal
    :auto-focus="true"
    :on-esc-click="() => $emit('closed')"
    :mask-closable="false"
    :block-scroll="true"
    :trap-focus="true"
    :show="props.visible"
    :title="`Delivery Order #${props.order_id}`"
    transform-origin="center"
    content-style="padding-bottom: 0px"
    preset="card"
    class="t-w-full md:t-w-[80%] t-max-w-7xl"
    @close="() => $emit('closed')"
    size="large"
  >
    <NDivider />
    <h1 class="t-font-semibold t-flex t-flex-wrap">Order Details</h1>
    <section class="t-mb-4">
      <span class="t-mt-4 t-inline-flex t-flex t-flex-col t-mr-8">
        <div class="t-text-xl t-mt-3 t-font-medium t-text-green-400">
          Recipient
        </div>
        <div class="t-text-lg">{{ order.recipient.username }}</div>
        <span class="t-mt-0 t-text-sm t-text-gray-400">{{
          order.recipient.email
        }}</span>
      </span>
      <span class="t-mt-4 t-inline-flex t-flex t-flex-col">
        <div class="t-text-xl t-mt-3 t-font-medium t-text-green-400">
          Destination
        </div>
        <div class>
          <span class="t-text-semibold t-text-lg"
            >{{ order.destination.country }}, {{ order.destination.city }}</span
          >, {{ order.destination.street }} - {{ order.destination.zipcode }}
        </div>
      </span>
    </section>
    <h1 class="t-font-semibold t-flex t-flex-wrap t-mb-3">Order Packages</h1>
    <section>
      <PackageCard
        v-for="(pkg, index) in order.packages"
        :key="index"
        v-bind="pkg"
        :index="index"
        @update="updateStatus"
        :editable="true"
      />
    </section>
    <div class="t-w-full t-mt-6">
      <h2 class="t-font-medium t-mb-5 t-mt-5">Delivery path</h2>
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

    <NDivider title-placement="left"
      ><h3 class="t-my-5">Add a new intermediate location</h3>
    </NDivider>
    <NForm
      class="t-mb-3"
      ref="orderFormRef"
      :rules="orderRules"
      :model="orderModelRef"
    >
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
      <NFormItem path="transport" label="Transportation Type">
        <NSelect
          v-model:value="orderModelRef.transport"
          :options="
            Object.values(EventType).map((ev) => ({ label: ev, value: ev }))
          "
          :render-label="renderLabel"
        />
      </NFormItem>
      <NFormItem path="loacation_type" label="Location Type">
        <NSelect
          v-model:value="orderModelRef.location_type"
          :options="
            Object.values(PackageLocationType).map((ev, index) => ({
              label: locationTypeMapper(ev as PackageLocationType),
              value: index,
            }))
          "
          :render-label="renderLabel"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <NButton class="t-mr-2" @click="submitForm" type="success"
        >Submit</NButton
      >
      <NButton @click="$emit('closed')" type="default">Cancel</NButton>
    </template>
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
} from "naive-ui";
import { reactive, watch, ref, type VNodeChild, h } from "vue";
import LocationCard from "./LocationCard.vue";
import PackageCard from "./PackageCard.vue";

interface OrderDeliveryModalProps {
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

const props = defineProps<OrderDeliveryModalProps>();
const emits = defineEmits<{ (e: "closed"): void }>();

const orderFormRef = ref<FormInst | null>();

const orderModelRef = ref<OrderModel>({
  city: "",
  country: "",
  statuses: [],
  zipcode: 0,
  street: "",
  transport: EventType.Truck,
  location_type: PackageLocationType.WAREHOUSE,
});

const orderRules: FormRules = {
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
  zipcode: {
    required: true,
    type: "integer",
    trigger: "blur",
  },
  transport: {
    required: true,
    type: "string",
    trigger: "blur",
  },
};

const updateStatus = (index: number, newStatus: PackageStatus) => {
  orderModelRef.value.statuses[index].status = newStatus;
  console.log(orderModelRef.value.statuses);
};

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
  };

  console.log(order.value);

  orderModelRef.value.statuses = statuses;
  console.log(orderModelRef.value.statuses);
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

const submitForm = () => {
  loading.start();
  orderFormRef.value?.validate(async (errors) => {
    if (!errors) {
      const statuses: { [id: number]: PackageStatus } = {};
      orderModelRef.value.statuses.forEach((element) => {
        statuses[element.id] = element.status;
      });
      await AxiosInstance.post("order/location/" + props.order_id, {
        locationType: orderModelRef.value.location_type,
        eventType: orderModelRef.value.transport,
        city: orderModelRef.value.city,
        country: orderModelRef.value.country,
        street: orderModelRef.value.street,
        zipcode: orderModelRef.value.zipcode.toString(),
        statuses: statuses,
      });
      message.success("Location recorded Succesfully!");
      emits("closed");
    } else {
      message.error("Location update failed");
    }
  });
  loading.finish();
};
</script>

<style scoped></style>
