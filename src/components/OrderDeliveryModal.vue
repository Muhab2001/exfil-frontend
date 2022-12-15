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
      <NFormItem path="status" label="Status">
        <NSelect
          v-model:value="orderModelRef.status"
          :options="
            Object.values(PackageStatus).map((st) => ({
              label: st,
              value: st,
            }))
          "
        />
      </NFormItem>
      <NFormItem path="transport" label="Transport Event Type">
        <NSelect
          v-model:value="orderModelRef.transport"
          :options="
            Object.values(EventType).map((evType) => ({
              label: evType,
              value: evType,
            }))
          "
        />
      </NFormItem>
      <NFormItem path="locationType" label="Location Type">
        <NSelect
          v-model:value="orderModelRef.locationType"
          :options="
            (Object.values(PackageLocationType).filter(value => typeof value === 'string') as string[])
              .map((locType: string, index: number) => ({
              label: locType[0] + locType.substring(1).toLowerCase(),
              value: index,
              })
            )
          "
        />
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
import { AxiosInstance } from "@/axios";
import { PackageStatus, EventType, PackageLocationType } from "@/enums/packages";
import { Role } from "@/enums/roles";
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

const orderModelRef = reactive<
  Omit<OrderModel, "recipient" | "sender" | "payment"> & {
    transport: EventType;
    locationType: PackageLocationType;
    status: PackageStatus;
  }
>({
  city: "",
  country: "",
  zipcode: 0,
  street: "",
  transport: EventType.Truck,
  locationType: PackageLocationType.AIRPORT,
  status: PackageStatus.TRANSIT,
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

const order = reactive<OrderState>({
  packages: [],
  expected_date: new Date().toLocaleDateString(),
  previous_locations: [],
});

const fetchData = async () => {
  const fetchedOrder = await AxiosInstance.get(`order/${props.order_id}`, {
    params: {id: props.order_id}
  });
  const fetchedPackages = fetchedOrder.data.packages.map((pkg: any): fullPackageRecord => {
    return {
      weight: pkg.weight,
      length: pkg.length,
      width: pkg.width,
      height: pkg.height,
      id: pkg.package_number,
      status: pkg.status,
      category: pkg.category,
      entry_timestamp: pkg.entry_timestamp,
      delivery_date: pkg.delivery_date,
      sender: fetchedOrder.data.sender.username,
      recipient: fetchedOrder.data.recipient.username,
      customer_name: "",
      address: "",
      orderNumber: fetchedOrder.data.id,
    }
  });

  order.packages = fetchedPackages;

  const transport_events = fetchedOrder.data.transport_event;
  order.previous_locations = transport_events.map((transport_event: any): PackageLocation => {
      // assuming that the end location of the last transport event is the current location/destination, we will ignore it
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

  const final_destination = fetchedOrder.data.final_destination;
  order.destination = {
    city: final_destination.city,
    country: final_destination.country,
    street: final_destination.street,
    zipcode: final_destination.zip_code,
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

const updateOrderStatus = (value: PackageStatus) => {};

const submitForm = async () => {
  const reqBody = {
    city: orderModelRef.city,
    country: orderModelRef.country,
    street: orderModelRef.street,
    zipcode: orderModelRef.zipcode,
    locationType: orderModelRef.locationType,
    eventType: orderModelRef.transport,
    statuses: orderModelRef.status,
  };
  await AxiosInstance.post(`order/location/${props.order_id}`, {
    params: {id: props.order_id},
    body: reqBody,
  });
};
</script>

<style scoped></style>
