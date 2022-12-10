export enum Role {
  UNSET = "unset",
  CUSTOMER = "customer",
  RETAIL_EMPLOYEE = "reatil-emp",
  DELIVERY_EMPLOYEE = "delivery-emp",
  ADMIN = "admin",
}

export const RoleMap: { [key: number]: Role } = {
  0: Role.UNSET,
  1: Role.CUSTOMER,
  2: Role.DELIVERY_EMPLOYEE,
  3: Role.RETAIL_EMPLOYEE,
  4: Role.ADMIN,
};
