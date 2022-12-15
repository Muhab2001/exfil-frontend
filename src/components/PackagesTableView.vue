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
    :row-props="(row: PackageRecord) => ({style: 'cursor:pointer;', onClick: () => {$emit('select', row.id)}})"
    @update:sorter="handleSortChange"
    @update:filters="handleFiltersChange"
    @update:page="handlePageChange"
  />
</template>

<script setup lang="ts">
import { useAuth } from "@/stores/auth";
import {
  NButton,
  NDataTable,
  NSpace,
  NTag,
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

interface PackageRecord {
  id: number;
  delivery_date?: string;
  customer_name: string;
  entry_timestamp: string;
  status: PackageStatus;
  category: PackageCategory;
  address: string;
  orderNumber: number;
}

interface PackagesTableProps {
  username?: string;
  // external filters
  range: [number, number];
}

interface PackageTableMetaData {
  columns: DataTableColumns<PackageRecord>;
  pagination: PaginationProps;
}

const props = defineProps<PackagesTableProps>();

const emits = defineEmits<{
  (e: "select", id: number): void;
  (e: "updateCity", cities?: string[]): void;
}>();
// util hooks
const auth = useAuth();
const iconUtils = useIcon();
const loading = useLoadingBar();

const customerColumn: TableBaseColumn<PackageRecord> = {
  title: "Sender",
  key: "customer_name",
  width: 200,
  resizable: true,
  defaultSortOrder: false,
  sorter: {
    compare: (a: PackageRecord, b: PackageRecord) =>
      a.customer_name.localeCompare(b.customer_name),
    multiple: 3,
  },
};

const entryDateColumn: TableBaseColumn<PackageRecord> = {
  title: "Entry Date",
  key: "entry_timestamp",
  defaultSortOrder: false,
  sorter: {
    compare: (a: PackageRecord, b: PackageRecord) =>
      new Date(a.entry_timestamp).getTime() -
      new Date(b.entry_timestamp).getTime(),
    multiple: 1,
  },
  render(record: PackageRecord) {
    return h(
      NSpace,
      {
        class: "t-text-md",
      },
      {
        default: () =>
          record.delivery_date === undefined ? "-" : record.delivery_date,
      }
    );
  },
};

const statusColumn: TableBaseColumn<PackageRecord> = {
  title: "Status",
  key: "status",
  width: 200,
  filter: true,
  filterOptionValues: [],
  filterOptions: Object.values(PackageStatus).map((status: string) => ({
    label: status,
    value: status,
  })),
  render(record: PackageRecord) {
    return renderStatus(record.status);
  },
};

const categoryColumn: TableBaseColumn<PackageRecord> = {
  title: "Category",
  key: "category",
  width: 200,
  filter: true,
  filterOptionValues: [],
  filterOptions: Object.values(PackageCategory).map((category: string) => ({
    label: category,
    value: category,
  })),
  render(record: PackageRecord) {
    return renderCategory(record.category);
  },
};

const deliveryDateColumn: TableBaseColumn<PackageRecord> = {
  title: "Delivery Date",
  key: "delivery_date",
  defaultSortOrder: false,
  sorter: {
    compare: (a: PackageRecord, b: PackageRecord) =>
      new Date(a.delivery_date ?? 0).getTime() -
      new Date(b.delivery_date ?? 0).getTime(),
    multiple: 2,
  },
};

const cityColumn: TableBaseColumn<PackageRecord> = {
  title: "City",
  key: "city",
  defaultSortOrder: false,
  filter: true,
  filterOptionValues: [],
};
const loadingRef = ref(false);
// local state of table meta data
const tableState = reactive<PackageTableMetaData>({
  columns: [
    {
      title: "#",
      key: "id",
    },
    customerColumn,
    entryDateColumn,
    statusColumn,
    categoryColumn,
    cityColumn,
    deliveryDateColumn,
    {
      title: "Actions",
      key: "actions",
      width: "200",
      render(record: PackageRecord) {
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
                  onClick: () => emits("select", record.id),
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
                  type: "error",
                  secondary: true,
                  strong: true,
                  class: "t-py-2",
                  onClick: () => deletePackage(record.id),
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

const reactiveEntryDate = reactive(entryDateColumn);

const reactiveCustomer = reactive(customerColumn);
const reactiveStatus = reactive(statusColumn);
const reactiveCategory = reactive(categoryColumn);
const reactiveDeliveryDate = reactive(deliveryDateColumn);
const reactiveCity = reactive(cityColumn);

const tableData = ref<PackageRecord[]>([]);
const sortUtils = useSortUtils();

onBeforeMount(async () => {
  // TODO: replace with the correct api call for the backend for both unique cities
  reactiveCity.filterOptions = (
    await AxiosInstance.get("package/cities")
  ).data.map((record: any) => ({ label: record.city, value: record.city }));
  reactiveCity.filterOptionValues = reactiveCity.filterOptions?.map(
    (e) => e.value
  );
  reactiveCategory.filterOptionValues = Object.values(PackageCategory);
  reactiveStatus.filterOptionValues = Object.values(PackageStatus);
  await query();
});
// ------------- Table Mutation functions --------------------

const deletePackage = async (packageId: number) => {
  loadingRef.value = true;
  await AxiosInstance.delete("package/" + packageId);
  tableData.value = tableData.value.filter((record) => record.id !== packageId);
  loadingRef.value = false;
};

const openPackageModal = (packageId: number) => {};
// fetching data according to current params
const query = async (sorter?: DataTableSortState[]) => {
  loadingRef.value = true;
  // fetch from axiosInstance supplying all needed filters/sorting query params
  try {
    const response = (
      await AxiosInstance.get("package/", {
        params: {
          from: new Date(props.range[0]).toISOString(),
          to: new Date(props.range[1]).toISOString(),
          customer:
            props.username && props.username.trim().length
              ? props.username
              : undefined,
          categories: reactiveCategory.filterOptionValues?.join(","),
          statuses: reactiveStatus.filterOptionValues!.join(","),
          cities: reactiveCity.filterOptionValues!.join(","),
          deliveryDateSort:
            sorter && sorter[2].order
              ? sortUtils.mapSort(sorter[2].order)
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
    tableData.value = response.results.map((record: any) => ({
      id: record.package_package_number,
      customer_name: record.user_username,
      entry_timestamp: new Date(
        record.package_entry_timestamp
      ).toLocaleString(),
      status: record.package_status,
      category: record.package_category,
      delivery_date: new Date(record.package_delivery_date).toLocaleString(),
      city: record.geo_address_city,
    }));

    console.log(response.results);

    tableState.pagination.itemCount = response.count;

    console.log("PAGINATION", tableState.pagination);

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
const handleFiltersChange = async (
  filters: DataTableFilterState,
  initiatorColumn: DataTableBaseColumn
) => {
  const filterStatuses = filters.status;
  if (Array.isArray(filterStatuses)) {
    reactiveStatus.filterOptionValues = filterStatuses;
  } else if (filters.status) {
    reactiveStatus.filterOptionValues = [filterStatuses as string];
  } else {
    reactiveStatus.filterOptionValues = undefined;
  }

  const filterCategories = filters.category;
  if (Array.isArray(filterCategories)) {
    reactiveCategory.filterOptionValues = filterCategories;
  } else if (filters.status) {
    reactiveCategory.filterOptionValues = [filterCategories as string];
  } else {
    reactiveCategory.filterOptionValues = undefined;
  }

  const filterCities = filters.city;
  if (Array.isArray(filterCities)) {
    reactiveCity.filterOptionValues = filterCities;
  } else if (filters.status) {
    reactiveCity.filterOptionValues = [filterCities as string];
  } else {
    reactiveCity.filterOptionValues = undefined;
  }

  emits("updateCity", reactiveCity.filterOptionValues as string[]);

  await query();
  // switch filter state, and fire the query function
};
// handling sorting change
const handleSortChange = (sorter: DataTableSortState[]) => {
  // switch sorting state and fire the query function

  query(sorter);
};

watch(
  () => props.range,
  async (before, after) => {
    console.log(before, after);

    await query();
  }
);

// ------------------ Utility functions -----------------------
const renderCategory = (category: PackageCategory) => {
  let categoryObj: { text: string; type: string; icon: Component | null } = {
    text: category,
    type: "",
    icon: null,
  };
  switch (category) {
    case PackageCategory.REGULAR:
      categoryObj.type = "default";
      categoryObj.icon = Box16Filled;
      break;
    case PackageCategory.FRAGILE:
      categoryObj.type = "info";
      categoryObj.icon = Fragile;
      break;
    case PackageCategory.LIQUID:
      categoryObj.type = "warning";
      categoryObj.icon = LocalDrinkRound;
      break;
    case PackageCategory.CHEMICAL:
      categoryObj.type = "error";
      categoryObj.icon = Biohazard;
      break;
  }

  return h(
    NTag as any,
    {
      type: categoryObj.type,
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
                iconUtils.renderIcon(categoryObj.icon!, {
                  size: "22",
                  class: "t-inline-flex t-items-center t-h-20 t-mr-0",
                })
              ),
              categoryObj.text,
            ],
          }
        ),
      ],
    }
  );
};

const renderStatus = (status: PackageStatus) => {
  let statusObj: { text: string; type: string; icon: Component | null } = {
    text: status,
    type: "",
    icon: null,
  };
  switch (status) {
    case PackageStatus.DELIVERED:
      statusObj.type = "success";
      statusObj.icon = CheckmarkCircle;
      break;
    case PackageStatus.TRANSIT:
      statusObj.type = "info";
      statusObj.icon = DirectionsTransitFilledFilled;
      break;
    case PackageStatus.DAMAGED:
      statusObj.type = "warning";
      statusObj.icon = Warning24Filled;
      break;
    case PackageStatus.LOST:
      statusObj.type = "error";
      statusObj.icon = ErrorCircle24Filled;
      break;
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
