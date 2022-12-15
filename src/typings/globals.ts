import type { PackageStatus, PackageCategory } from "@/enums/packages";
import type { Role } from "@/enums/roles";

export interface User {
  username: string;
  fullname: string;
  email: string;
  role: Role;
  id: string;
}

export interface PackageTableRecord {
  id: number;
  status: PackageStatus;
  category: PackageCategory;
  weight: number;
  height: number;
  width: number;
  length: number;
  insurance_amount: number;
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
  zipcode: string;
}

export interface OrderModel {
  payment: number;
  city: string;
  country: string;
  zipcode: number;
  street: string;
  delivery_email: string;
  recipient: {
    email: string;
  };
  sender: {
    email: string;
  };
}
