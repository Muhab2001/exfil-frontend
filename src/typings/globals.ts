import type { PackageStatus, PackageCategory } from "@/enums/packages";
import type { Role } from "@/enums/roles";

export interface User {
  username: string;
  fullname: string;
  role: Role;
}

export interface PackageRecord {
  id: number;
  delivery_date?: string;
  customer_name: string;
  entry_timestamp: string;
  status: PackageStatus;
  category: PackageCategory;
  address: string;
  orderNumber: number;
}
