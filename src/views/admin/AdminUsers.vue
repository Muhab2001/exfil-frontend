<template>
  <div>
    <NInputGroup>
      <NInput v-model:value="filters.username" type="text" />
      <NSelect
        v-mdel:value="filters.role"
        :default-value="Role.CUSTOMER"
        :options="
          Object.keys(Role).map((role) => ({ label: role, value: role }))
        "
      />
    </NInputGroup>
    <UserTableView v-bind="filters" />
    <!-- search input -->
    <!-- table view of all users -->
    <!-- modal to create/edit users -->
  </div>
</template>

<script setup lang="ts">
import UserTableView from "@/components/UserTableView.vue";
import { Role } from "@/enums/roles";
import { NInput, NInputGroup, NSelect } from "naive-ui";
import { reactive } from "vue";

const filters = reactive({
  username: "",
  role: Role.CUSTOMER,
});
</script>

<style scoped></style>
