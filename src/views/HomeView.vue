<template>
  <template v-if="auth.userProfile.role === Role.ADMIN">
    <AdminPackages
  /></template>
  <template v-else-if="auth.userProfile.role === Role.DELIVERY_EMPLOYEE"
    ><DeliveryPackages
  /></template>
  <template v-else-if="auth.userProfile.role === Role.RETAIL_EMPLOYEE"
    ><RetailPackage
  /></template>
  <template v-else-if="auth.userProfile.role === Role.CUSTOMER">
    <CustomerPackages
  /></template>
</template>

<script setup lang="ts">
import { Role } from "@/enums/roles";
import { useAuth } from "@/stores/auth";
import { defineAsyncComponent } from "vue";

const AdminPackages = defineAsyncComponent(
  () => import("./admin/AdminPackages.vue")
);
const CustomerPackages = defineAsyncComponent(
  () => import("./customer/CustomerPackages.vue")
);
const DeliveryPackages = defineAsyncComponent(
  () => import("./delivery-employee/DeliveryPackages.vue")
);
const RetailPackage = defineAsyncComponent(
  () => import("./retail-employee/RetailPackage.vue")
);

const auth = useAuth();
</script>

<style scoped></style>
