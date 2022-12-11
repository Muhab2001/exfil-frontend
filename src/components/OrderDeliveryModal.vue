<template>
  <NModal
    :auto-focus="true"
    :on-esc-click="() => $emit('closed')"
    :mask-closable="false"
    :block-scroll="true"
    :trap-focus="true"
    :show="props.visible"
    :title="`Delivery Order ${props.order_id}`"
    transform-origin="center"
    content-style="padding-bottom: 0px"
    preset="card"
    class="t-w-full md:t-w-[80%] t-max-w-7xl"
    @close="() => $emit('closed')"
    size="large"
  >
    <section>
      <h1>Order Details</h1>
      <div>
        <div>Recipient</div>
        <div>{{ order.recipient }}</div>
      </div>
      <div>
        <div>Expected Delivery</div>
        <div>{{ order.expected_date }}</div>
      </div>
      <div>
        <div>Destination</div>
        <div>{{ order.destination }}</div>
      </div>
    </section>
    <section>
      <h1>Order Packages</h1>
      <PackageCard
        v-for="(pkg, index) in order.packages"
        :key="index"
        v-bind="pkg"
        :editable="true"
      />
    </section>
    <section>
      <h1>Order Locations</h1>
      <LocationCard
        v-for="(location, index) in order.previous_locations"
        :key="index"
        v-bind="location"
      />
    </section>

    <NForm ref="orderFormRef" :rules="orderRules" :model="orderModelRef">
      <h1>Add a new location</h1>
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
      <NButton class="t-w-full t-mr-2" @click="submitForm" type="success"
        >Submit</NButton
      >
    </NForm>
    <template #footer>
      <NButton @click="$emit('closed')" type="default">Cancel</NButton>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { PackageStatus, EventType } from "@/enums/packages";
import type {
  fullPackageRecord,
  User,
  PackageLocation,
  OrderModel,
} from "@/typings/globals";
import { NForm, NModal, NSelect, type FormRules } from "naive-ui";
import { reactive, watch, ref } from "vue";
import LocationCard from "./LocationCard.vue";
import PackageCard from "./PackageCard.vue";

interface OrderDeliveryModalProps {
  order_id: number;
  visible: boolean;
}

interface OrderState {
  packages: fullPackageRecord[];
  recipient?: User;
  expected_date: string;
  destination?: Omit<PackageLocation, "timestamp">;
  previous_locations: PackageLocation[];
}

const props = defineProps<OrderDeliveryModalProps>();
const emits = defineEmits<{ (e: "closed"): void }>();

const orderModelRef = ref<
  Omit<OrderModel, "recipient" | "sender" | "payment"> & {
    transport: EventType;
  }
>({
  city: "",
  country: "",
  zipcode: 0,
  street: "",
  transport: EventType.Truck,
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

// TODO fetch the information on modal visibility
const order = reactive<OrderState>({
  packages: [],
  expected_date: new Date().toLocaleDateString(),
  previous_locations: [],
});

watch(
  () => props.visible,
  () => {}
);

const updateOrderStatus = (value: PackageStatus) => {};

const submitForm = () => {};
</script>

<style scoped></style>
