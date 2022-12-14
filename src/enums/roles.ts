export enum Role {
  UNSET = "unset",
  CUSTOMER = "customer",
  RETAIL_EMPLOYEE = "retail-emp",
  DELIVERY_EMPLOYEE = "delivery-emp",
  ADMIN = "admin",
}

export const RoleArray: Role[]= [
  Role.UNSET,
  Role.CUSTOMER,
  Role.DELIVERY_EMPLOYEE,
  Role.RETAIL_EMPLOYEE,
  Role.ADMIN,
];
