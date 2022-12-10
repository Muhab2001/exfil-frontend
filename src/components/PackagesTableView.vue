<template>
  <NDataTable
    :scroll-x="1000"
    :data="tableData"
    :columns="tableState.columns"
    striped
    bordered
    :pagination="tableState.pagination"
    :row-props="(row: PackageRecord) => ({style: 'cursor:pointer;', onClick: () => {props.onRowSelected(row)}})"
    @update:sorter="handleSortChange"
    @update:filters="handleFiltersChange"
    @update:page="handlePageChange"
  />
</template>

<script setup lang="ts">
import { useAuth } from "@/stores/auth";
import {
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
import { reactive, ref, h, type Component } from "vue";
import { PackageStatus, PackageCategory } from "@/enums/packages";
import type { TableColumn } from "naive-ui/es/data-table/src/interface";
import {
  Box16Filled,
  ErrorCircle24Filled,
  Warning24Filled,
} from "@vicons/fluent";
import {
  DirectionsTransitFilledFilled,
  LocalDrinkRound,
} from "@vicons/material";
import { Biohazard } from "@vicons/fa";
import { Fragile } from "@vicons/carbon";
import { useIcon } from "@/composables/useIcon";
import { CheckmarkCircle } from "@vicons/ionicons5";

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
  onRowSelected: (row: PackageRecord) => void;
  extraActions?: TableColumn<PackageRecord>[];
  // external filters
  from: number;
  to: number;
}

interface PackageTableMetaData {
  columns: DataTableColumns<PackageRecord>;
  pagination: PaginationProps;
}

const props = defineProps<PackagesTableProps>();
// util hooks
const auth = useAuth();
const iconUtils = useIcon();
const loading = useLoadingBar();

// local state of table meta data
const tableState = reactive<PackageTableMetaData>({
  columns: [
    {
      title: "#",
      key: "id",
    },
    {
      title: "Customer",
      key: "customer_name",
      defaultSortOrder: false,
      sorter: {
        compare: (a: PackageRecord, b: PackageRecord) =>
          a.customer_name.localeCompare(b.customer_name),
        multiple: 3,
      },
      filter: true,
      // TODO: replace with unique customer names in the DB
      filterOptions: [],
    },
    {
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
    },
    {
      title: "Status",
      key: "status",
      filter: true,
      filterOptionValues: [],
      filterOptions: Object.values(PackageStatus).map((status: string) => ({
        label: status,
        value: status,
      })),
      render(record: PackageRecord) {
        return renderStatus(record.status);
      },
    },
    {
      title: "Category",
      key: "category",
      filter: true,
      filterOptionValues: [],
      filterOptions: Object.values(PackageCategory).map((category: string) => ({
        label: category,
        value: category,
      })),
      render(record: PackageRecord) {
        return renderCategory(record.category);
      },
    },
    {
      title: "Delivery Date",
      key: "delivery_data",
      defaultSortOrder: false,
      sorter: {
        compare: (a: PackageRecord, b: PackageRecord) =>
          new Date(a.delivery_date ?? 0).getTime() -
          new Date(b.delivery_date ?? 0).getTime(),
        multiple: 2,
      },
    },
  ],
  pagination: {
    page: 1,
    pageCount: 1,
    pageSize: 10,
  },
});

if (props.extraActions)
  tableState.columns = [...tableState.columns, ...props.extraActions];

const tableData = ref<PackageRecord[]>([]);
// ------------- Table Mutation functions --------------------
// fetching data according to current params
const query = (page: number, pageSize: number = 10, order = "ascend") => {
  // fetch from axiosInstance supplying all needed filters/sorting query params
  tableState.pagination.page = page;
};
// handling page change
const handlePageChange = (currentPage: number) => {
  // switch the pagination state, and fire the query function
};
// handling filter change
const handleFiltersChange = (
  filters: DataTableFilterState,
  initiatorColumn: DataTableBaseColumn
) => {
  // switch filter state, and fire the query function
  console.log(filters);
};
// handling sorting change
const handleSortChange = (sorter: DataTableSortState[] | null) => {
  // switch sorting state and fire the query function
  console.log(sorter);
};

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
  return h(NSpace, {
    default: () => [
      NTag,
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
      },
    ],
  });
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
  return h(NSpace, {
    default: () => [
      NTag,
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
      },
    ],
  });
};
</script>

<style scoped></style>
