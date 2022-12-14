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
        :editable="false"
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
      <NFormItem path="payment" label="Payment">
        <NInputNumber v-model:value="orderModelRef.payment" min="0" clearable />
      </NFormItem>
      <NButton class="t-w-full t-mr-2" @click="submitForm" type="success"
        >Confirm Payment</NButton
      >
    </NForm>
    <template #footer>
      <NButton @click="$emit('closed')" type="default">Cancel</NButton>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import type {
  fullPackageRecord,
  User,
  PackageLocation,
  OrderModel,
} from "@/typings/globals";
import { AxiosInstance } from "@/axios";
import { NForm, NModal, type FormRules } from "naive-ui";
import { reactive, watch, ref, onBeforeMount } from "vue";
import LocationCard from "./LocationCard.vue";
import PackageCard from "./PackageCard.vue";
import { Role } from "@/enums/roles";

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

const orderModelRef = ref<{ payment: number }>({
  payment: 0,
});

const orderRules: FormRules = {
  payment: {
    required: true,
    type: "number",
    trigger: "blur",
  },
};

const order = reactive<OrderState>({
  packages: [],
  // FIXME: expected_date isn't in the back-end
  expected_date: new Date().toLocaleDateString(),
  previous_locations: [],
});

const fetchData = async () => {
  const fetchedOrder = await AxiosInstance.get(`order/${props.order_id}`, {
    params: props.order_id
  });
  // TODO: discuss fullPackageRecord with muhab
  order.packages = fetchedOrder.data.packages;

  const transport_events = fetchedOrder.data.transport_event;
  order.previous_locations = transport_events.map((transport_event: any): PackageLocation => {
    // assuming that the end location of the last transport event is the destination, we will ignore it
    const location = transport_event.start_location;
    return {
      timestamp: location.timestamp,
      city: location.address.city,
      country: location.address.country,
      street: location.address.street,
      zipcode: location.address.zip_code,
    };
  });

  order.recipient = {
    // FIXME: fullname isn't in the back-end
    fullname: "",
    username: fetchedOrder.data.recipient.username,
    email: fetchedOrder.data.recipient.email,
    role: Role.CUSTOMER,
  };

  const lastLocation = transport_events[transport_events.length-1].end_location;
  order.destination = {
    city: lastLocation.address.city,
    country: lastLocation.address.country,
    street: lastLocation.address.street,
    zipcode: lastLocation.address.zip_code,
  };
};

watch(
  () => props.visible,
  async () => {
    if (props.visible) {
      await fetchData();
    }
  }
);

// * I have no idea how that will work with only a number
const submitForm = () => {};
</script>

<style scoped></style>
