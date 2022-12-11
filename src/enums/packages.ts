export enum PackageCategory {
  REGULAR = "Regular",
  FRAGILE = "Fragile",
  LIQUID = "Liquid",
  CHEMICAL = "Chemical",
}

export enum PackageStatus {
  LOST = "Lost",
  DAMAGED = "Damaged",
  TRANSIT = "Transit",
  DELIVERED = "Delivered",
}

export enum PackageLocation {
  AIRPORT = 0,
  WAREHOUSE = 1,
  RECIPIENT_LOCATION = 2,
}

export enum EventType {
  Truck = "Truck",
  Flight = "Flight",
  Ship = "Ship",
}
