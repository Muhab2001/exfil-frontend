// export enum Role {
//   UNSET = "unset",
//   CUSTOMER = "customer",
//   RETAIL_EMPLOYEE = "reatil-emp",
//   DELIVERY_EMPLOYEE = "delivery-emp",
//   ADMIN = "admin",
// }

export enum DisplayRole {
  CUSTOMER = "Customer",
  RETAIL_EMPLOYEE = "Retail Employee",
  DELIVERY_EMPLOYEE = "Delivery Employee",
}


export enum Role {
  UNSET = "Unset",
  CUSTOMER = "Customer",
  RETAIL_EMPLOYEE = "Retail Employee",
  DELIVERY_EMPLOYEE = "Delivery Employee",
  ADMIN = "admin",
}

export const RoleToEndpointMap = {
  Unset: "",
  Customer: "customer",
  "Delivery Employee": "delivery-employee",
  "Retail Employee": "retail-employee",
  admin: "admin",
};

export const ValuetoRoleMap: { [key: number]: Role } = {
  0: Role.UNSET,
  1: Role.CUSTOMER,
  2: Role.DELIVERY_EMPLOYEE,
  3: Role.RETAIL_EMPLOYEE,
  4: Role.ADMIN,
};

export const RoleToValueMap: { [key: string]: number } = {
  Unset: 0,
  Customer: 1,
  "Delivery Employee": 2,
  "Retail Employee": 3,
  Admin: 4,
};
