<template>
  <NDataTable
    :scroll-x="1000"
    :data="tableData"
    :columns="tableState.columns"
    striped
    bordered
    :pagination="tableState.pagination"
    :row-props="(row: UserRecord) => ({style: 'cursor:pointer;', onClick: () => {openUserModal(row.id)}})"
  />
</template>

<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import { useIcon } from "@/composables/useIcon";
import { Role } from "@/enums/roles";
import { Edit16Filled, Delete16Filled } from "@vicons/fluent";
import {
  NButton,
  NDataTable,
  NSpace,
  type DataTableColumns,
  type PaginationProps,
} from "naive-ui";
import { h, ref, onBeforeMount, watch } from "vue";

interface UserRecord {
  name: string;
  id: string;
  role: Role;
  email: string;
}

const props = defineProps<{ role: Role; username: string }>();
const emits = defineEmits<{ (e: "edit", id: string): void }>();

const iconUtils = useIcon();

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
    { title: "Name", key: "name" },
    { title: "Role", key: "role" },
    { title: "Email", key: "email" },
    {
      title: "Actions",
      key: "actions",
      width: "100",
      render(record: UserRecord) {
        return h(
          NSpace,
          { align: "center" },
          {
            default: () => [
              h(
                NButton,
                {
                  size: "small",
                  round: true,
                  type: "primary",
                  secondary: true,
                  strong: true,
                  class: "t-py-2",
                  onClick: () => openUserModal(record.id),
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
                  size: "small",
                  round: true,
                  type: "primary",
                  secondary: true,
                  strong: true,
                  class: "t-py-2",
                  onClick: () => deleteUser(record.id),
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
  const findOptions: { username?: string; role: string } = { role: props.role };
  if (props.username.length !== 0) {
    findOptions["username"] = props.username;
  }

  switch (props.role) {
    case Role.CUSTOMER:
      tableData.value = await AxiosInstance.get("customers", {
        params: findOptions,
      });
      break;
    case Role.DELIVERY_EMPLOYEE:
      tableData.value = await AxiosInstance.get("delivery-employees", {
        params: findOptions,
      });
      break;
    case Role.RETAIL_EMPLOYEE:
      tableData.value = await AxiosInstance.get("retail-employees", {
        params: findOptions,
      });
      break;
  }
};

watch(
  () => props,
  async () => {
    await fetchData();
  }
);

const tableData = ref<UserRecord[]>([]);
// TODO: populating the users' table
onBeforeMount(async () => {
  await fetchData();
});

const openUserModal = (userId: string) => {
  emits("edit", userId);
};
// TODO: using the deletion endpoint on the api
const deleteUser = async (userId: string) => {
  tableData.value = tableData.value.filter((record) => record.id !== userId);
  await AxiosInstance.delete("user/" + userId);
};
</script>

<style scoped></style>
