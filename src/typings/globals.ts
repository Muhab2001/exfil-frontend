import type { PackageStatus, PackageCategory } from "@/enums/packages";
import type { Role } from "@/enums/roles";

export interface User {
  username: string;
  fullname: string;
  email: string;
  role: Role;
}

export interface PackageTableRecord {
  id: number;
  delivery_date?: string;
  customer_name: string;
  entry_timestamp: string;
  status: PackageStatus;
  category: PackageCategory;
  address: string;
  orderNumber: number;
}

export interface fullPackageRecord extends PackageTableRecord {
  weight: number;
  height: number;
  width: number;
  length: number;
  sender: string;
  recipient: string;
}

export interface PackageLocation {
  timestamp: number;
  city: string;
  country: string;
  street: string;
  zipcode: number;
}

export interface OrderModel {
  payment: number;
  city: string;
  country: string;
  zipcode: number;
  street: string;
  recipient: {
    username: string;
    email: string;
    phone: string;
  };
  sender: {
    username: string;
    email: string;
    phone: string;
  };
}
