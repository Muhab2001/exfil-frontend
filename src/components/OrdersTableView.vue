<template>
  <NDataTable
    :scroll-x="1520"
    :data="tableData"
    :columns="tableState.columns"
    striped
    :loading="loadingRef"
    bordered
    remote
    :pagination="tableState.pagination"
    :row-props="(row: OrderRecord) => ({style: 'cursor:pointer;', onClick: () => {$emit('select', row.id)}})"
    @update:sorter="handleSortChange"
    @update:page="handlePageChange"
    @update:filters="handleFiltersChange"
  />
</template>

<script setup lang="ts">
import { useAuth } from "@/stores/auth";
import {
  NButton,
  NDataTable,
  NSpace,
  NTag,
  NIcon,
  useLoadingBar,
  type DataTableBaseColumn,
  type DataTableColumns,
  type DataTableFilterState,
  type DataTableSortState,
  type PaginationProps,
} from "naive-ui";
import { reactive, ref, h, type Component, onBeforeMount, watch } from "vue";
import { PackageStatus, PackageCategory } from "@/enums/packages";
import type {
  TableBaseColumn,
  TableColumn,
} from "naive-ui/es/data-table/src/interface";
import {
  Add12Filled,
  Box16Filled,
  Delete16Filled,
  Edit16Filled,
  ErrorCircle24Filled,
  Star20Filled,
  Warning24Filled,
} from "@vicons/fluent";
import {
  DirectionsTransitFilledFilled,
  LocalDrinkRound,
} from "@vicons/material";
import { Biohazard } from "@vicons/fa";
import { Fragile } from "@vicons/carbon";
import { useIcon } from "@/composables/useIcon";
import { useSortUtils } from "@/composables/sortingMapper";
import { CheckmarkCircle } from "@vicons/ionicons5";
import { AxiosInstance } from "@/axios";
import { Role } from "@/enums/roles";

interface OrderRecord {
  id: number;
  isDelivered: boolean;
  retailer: string;
  entry_timestamp: string;
}

interface OrdersTableProps {
  username?: string;
  // external filters
  range: [number, number];
}

interface PackageTableMetaData {
  columns: DataTableColumns<OrderRecord>;
  pagination: PaginationProps;
}

const props = defineProps<OrdersTableProps>();

const emits = defineEmits<{
  (e: "select", id: number): void;
  (e: "updateOrder", cities?: string[]): void;
}>();
// util hooks
const iconUtils = useIcon();

const customerColumn: TableBaseColumn<OrderRecord> = {
  title: "Retail employee",
  key: "retailer",
  width: 100,
  resizable: true,
  defaultSortOrder: false,
  sorter: {
    compare: (a: OrderRecord, b: OrderRecord) =>
      a.retailer.localeCompare(b.retailer),
    multiple: 3,
  },
};

const entryDateColumn: TableBaseColumn<OrderRecord> = {
  title: "Entry Date",
  key: "entry_timestamp",
  width: 100,
  defaultSortOrder: false,
  sorter: {
    compare: (a: OrderRecord, b: OrderRecord) =>
      new Date(a.entry_timestamp).getTime() -
      new Date(b.entry_timestamp).getTime(),
    multiple: 1,
  },
  render(record: OrderRecord) {
    return h(
      NSpace,
      {
        class: "t-text-md",
      },
      {
        default: () =>
          record.entry_timestamp === undefined ? "-" : record.entry_timestamp,
      }
    );
  },
};

const isDeliveredColumn: TableBaseColumn<OrderRecord> = {
  title: "Status",
  key: "isDelivered",
  width: 50,
  filter: true,
  filterOptionValues: [0, 1],
  filterOptions: [
    { label: "Delivered", value: 1 },
    { label: "Not Delivered", value: 0 },
  ],
  render(record: OrderRecord) {
    return renderStatus(record.isDelivered);
  },
};

const loadingRef = ref(false);
// local state of table meta data
const tableState = reactive<PackageTableMetaData>({
  columns: [
    {
      title: "#",
      key: "id",
      width: 100,
      resizable: true,
    },
    customerColumn,
    entryDateColumn,
    isDeliveredColumn,

    {
      title: "Actions",
      key: "actions",
      width: "50",
      render(record: OrderRecord) {
        return h(
          NSpace,
          { align: "center" },
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
                  onClick: (e) => {
                    e.stopPropagation();
                    emits("select", record.id);
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
                  onClick: (e) => deleteOrder(e, record.id),
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
  pagination: {
    page: 1,
    // pageCount: 2,
    pageSize: 10,
    itemCount: 0,
  },
});

const reactiveStatus = reactive(isDeliveredColumn);

const tableData = ref<OrderRecord[]>([]);
const sortUtils = useSortUtils();

onBeforeMount(async () => {
  await query();
});
// ------------- Table Mutation functions --------------------

const deleteOrder = async (e: MouseEvent, orderId: number) => {
  e.stopPropagation();
  loadingRef.value = true;
  await AxiosInstance.delete("order/" + orderId);
  tableData.value = tableData.value.filter((record) => record.id !== orderId);
  loadingRef.value = false;
};

// fetching data according to current params
const query = async (sorter?: DataTableSortState[]) => {
  loadingRef.value = true;
  // fetch from axiosInstance supplying all needed filters/sorting query params
  try {
    const response = (
      await AxiosInstance.get("order/", {
        params: {
          from: new Date(props.range[0]).toISOString(),
          to: new Date(props.range[1]).toISOString(),
          isDelivered: reactiveStatus.filterOptionValues!.join(","),
          retailer:
            props.username && props.username.trim().length
              ? props.username
              : undefined,

          customerSort:
            sorter && sorter[0].order
              ? sortUtils.mapSort(sorter[0].order)
              : undefined,
          entryDateSort:
            sorter && sorter[1].order
              ? sortUtils.mapSort(sorter[1].order)
              : undefined,
          offset:
            (tableState.pagination.page! - 1) * tableState.pagination.pageSize!,
          page_size: tableState.pagination.pageSize!,
        },
      })
    ).data;
    try {
      tableData.value = response.map((record: any) => ({
        id: record.order_id,
        retailer: record.retail_user_username,
        entry_timestamp: new Date(
          record.package_entry_timestamp
        ).toLocaleString(),
        isDelivered: record.order_isDelivered,
      }));
    } catch (e) {
      console.log(e);
    }

    console.log("STATE", tableData.value);

    tableState.pagination.itemCount = response.count;

    // TODO: needs mapping from api response
    loadingRef.value = false;
  } catch (e) {
    loadingRef.value = false;
  }
};
// handling page change
const handlePageChange = async (currentPage: number) => {
  tableState.pagination.page = currentPage;
  await query();
  // switch the pagination state, and fire the query function
};

// handling filter change

// handling sorting change
const handleSortChange = (sorter: DataTableSortState[]) => {
  // switch sorting state and fire the query function
  console.log(sorter);

  query(sorter);
};

const handleFiltersChange = async (
  filters: DataTableFilterState,
  initiatorColumn: DataTableBaseColumn
) => {
  const filterStatuses = filters.isDelivered;
  if (Array.isArray(filterStatuses)) {
    reactiveStatus.filterOptionValues = filterStatuses;
  } else if (filters.status) {
    reactiveStatus.filterOptionValues = [filterStatuses as string];
  } else {
    reactiveStatus.filterOptionValues = undefined;
  }

  await query();
  // switch filter state, and fire the query function
};

watch(
  () => props.range,
  async (before, after) => {
    console.log(before, after);

    await query();
  }
);

// ------------------ Utility functions -----------------------

const renderStatus = (delivered: boolean) => {
  let statusObj: { text: string; type: string; icon: Component | null } = {
    text: "",
    type: "",
    icon: null,
  };

  if (delivered) {
    statusObj.text = "Delivered";
    statusObj.type = "success";
    statusObj.icon = CheckmarkCircle;
  } else {
    statusObj.text = "Not Delivered";
    statusObj.type = "default";
    statusObj.icon = ErrorCircle24Filled;
  }

  return h(
    NTag as any,
    {
      type: statusObj.type,
      bordered: false,
      round: true,
    },
    {
      default: () => [
        h(
          NSpace,
          { align: "center" },
          {
            default: () => [
              h(
                iconUtils.renderIcon(statusObj.icon!, {
                  size: "22",
                  class: "t-inline-flex t-items-center t-h-20 t-mr-0",
                })
              ),
              statusObj.text,
            ],
          }
        ),
      ],
    }
  );
};

defineExpose({
  query,
});
</script>

<style scoped></style>
