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
import AdminPackages from "./admin/AdminPackages.vue";
import CustomerPackages from "./customer/CustomerPackages.vue";
import DeliveryPackages from "./delivery-employee/DeliveryPackages.vue";
import RetailPackage from "./retail-employee/RetailPackage.vue";

const auth = useAuth();
</script>

<style scoped></style>
