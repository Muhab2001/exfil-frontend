export enum Role {
  CUSTOMER = "customer",
  RETAIL_EMPLOYEE = "reatil-emp",
  DELIVERY_EMPLOYEE = "delivery-emp",
  ADMIN = "admin",
}

export const RoleMap: { [key: number]: Role } = {
  0: Role.CUSTOMER,
  1: Role.DELIVERY_EMPLOYEE,
  2: Role.RETAIL_EMPLOYEE,
  3: Role.ADMIN,
};
