<template>
  <div class="t-min-h-screen t-w-full">
    <UserModalVue @closed="userModal.visible = false" v-bind="userModal" />
    <div class="t-w-full t-flex t-justify-center">
      <NInputGroup @enter.prevent="fetchData" class="t-max-w-[960px] t-mb-5"
        ><NInput
          v-model:value="userFilters.username"
          type="text"
          placeholder="Enter the user username"
        />
        <NSelect
          class="t-w-60"
          v-model:value="userFilters.targetRole"
          :options="
            Object.values(DisplayRole).map((rl) => ({ label: rl, value: rl }))
          "
          :render-label="renderLabel"
        />
        <NButton @click="fetchData" secondary type="success"
          >Search</NButton
        ></NInputGroup
      >
    </div>
    <NDataTable
      :scroll-x="1000"
      :data="tableData"
      :columns="tableState.columns"
      striped
      bordered
      :pagination="tableState.pagination"
      :row-props="(row: UserRecord) => ({style: 'cursor:pointer;'})"
    />
    <div class="t-fixed t-bottom-8 t-flex t-w-full t-justify-center">
      <NButton :round="true" type="primary" @click="createUser">
        <template #icon>
          <NIcon :component="Add12Filled" />
        </template>
        New User</NButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import { useIcon } from "@/composables/useIcon";
import { DisplayRole, Role } from "@/enums/roles";
import { Edit16Filled, Delete16Filled, Add12Filled } from "@vicons/fluent";
import {
  NButton,
  NDataTable,
  NInput,
  NInputGroup,
  NSelect,
  NSpace,
  NIcon,
  type DataTableColumns,
  type PaginationProps,
  type SelectOption,
  useLoadingBar,
  useMessage,
} from "naive-ui";
import { h, ref, onBeforeMount, watch, reactive, type VNodeChild } from "vue";
import UserModalVue from "../../components/UserModal.vue";

interface UserRecord {
  username: string;
  id: string;
  email: string;
}

const iconUtils = useIcon();

const userFilters = reactive<{ username: string; targetRole: Role }>({
  username: "",
  targetRole: Role.CUSTOMER,
});

const userModal = reactive<{
  user_id?: string;
  visible: boolean;
  mode: "edit" | "create";
  targetRole: Role;
}>({
  visible: false,
  user_id: "",
  mode: "create",
  targetRole: Role.CUSTOMER,
});

const tableState = ref<{
  pagination: PaginationProps;
  columns: DataTableColumns<UserRecord>;
}>({
  pagination: {
    pageSize: 10,
  },
  columns: [
    {
      title: "ID",
      key: "id",
    },
    { title: "Name", key: "username" },
    { title: "Email", key: "email" },
    {
      title: "Actions",
      key: "actions",
      width: "200",
      render(record: UserRecord) {
        return h(
          NSpace,
          { align: "center", vertical: false },
          {
            default: () => [
              h(
                NButton,
                {
                  size: "medium",
                  circle: true,
                  type: "primary",
                  secondary: true,
                  strong: true,
                  class: "t-py-2",
                  onClick: () => {
                    editUser(record);
                    console.log("INSIDE EDIT MODEL", userModal);
                  },
                },
                {
                  default: () => [
                    h(
                      NSpace,
                      { align: "center" },
                      {
                        default: () => [
                          h(
                            iconUtils.renderIcon(Edit16Filled, {
                              size: "22",
                              class:
                                "t-inline-flex t-items-center t-h-20 t-mr-0",
                            })
                          ),
                        ],
                      }
                    ),
                  ],
                }
              ),
              h(
                NButton,
                {
                  size: "medium",
                  circle: true,
                  type: "error",
                  secondary: true,
                  strong: true,
                  class: "t-py-2",
                  onClick: () => {
                    deleteUser(record.id);
                  },
                },
                {
                  default: () => [
                    h(
                      NSpace,
                      { align: "center" },
                      {
                        default: () => [
                          h(
                            iconUtils.renderIcon(Delete16Filled, {
                              size: "22",
                              class:
                                "t-inline-flex t-items-center t-h-20 t-mr-0",
                            })
                          ),
                        ],
                      }
                    ),
                  ],
                }
              ),
            ],
          }
        );
      },
    },
  ],
});

const fetchData = async () => {
  const findOptions: { username?: string } = {};

  console.log("FETCHING USERS");

  if (userFilters.username.trim().length !== 0) {
    findOptions["username"] = userFilters.username.trim();
  }
  let response: any = {};
  switch (userFilters.targetRole) {
    case Role.CUSTOMER:
      tableData.value = (
        await AxiosInstance.get("user/customers", {
          params: findOptions,
        })
      ).data.map((cst: any) => ({
        username: cst.user.username,
        id: cst.userId,
        email: cst.email,
      }));
      break;
    case Role.DELIVERY_EMPLOYEE:
      tableData.value = (
        await AxiosInstance.get("user/delivery-employees", {
          params: findOptions,
        })
      ).data.map((cst: any) => ({
        username: cst.user.username,
        id: cst.userId,
        email: cst.company_email,
      }));
      break;
    case Role.RETAIL_EMPLOYEE:
      tableData.value = (
        await AxiosInstance.get("user/retail-employees", {
          params: findOptions,
        })
      ).data.map((cst: any) => ({
        username: cst.user.username,
        id: cst.userId,
        email: cst.company_email,
      }));
      break;
  }

  console.log(tableData.value);
};

watch(userFilters, async () => {
  await fetchData();
});

const tableData = ref<UserRecord[]>([]);
// TODO: populating the users' table
onBeforeMount(async () => {
  await fetchData();
});

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

const createUser = () => {
  userModal.user_id = undefined;
  userModal.mode = "create";
  userModal.visible = true;
};

const editUser = (record: UserRecord) => {
  userModal.user_id = record.id;
  userModal.visible = true;
  userModal.mode = "edit";
  userModal.targetRole = userFilters.targetRole;
};

const loading = useLoadingBar();
const message = useMessage();
// TODO: using the deletion endpoint on the api
const deleteUser = async (userId: string) => {
  loading.start();

  try {
    await AxiosInstance.delete("user/" + userId);
    tableData.value = tableData.value.filter((record) => record.id !== userId);
    message.success("User deleted successfully");
    loading.finish();
  } catch (e) {
    message.error("User Deletion failed");
    loading.error();
  }
};
</script>

<style scoped></style>
