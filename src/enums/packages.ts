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

export enum PackageLocationType {
  AIRPORT = "Airport",
  WAREHOUSE = "Warehosue",
  RECIPIENT_LOCATION = "Recipient Location",
}

export function locationTypeMapper(index: PackageLocationType) {
  switch (index) {
    case PackageLocationType.AIRPORT:
      return "Airport";
    case PackageLocationType.WAREHOUSE:
      return "Warehouse";
    case PackageLocationType.RECIPIENT_LOCATION:
      return "Recipient location";
  }
}

export enum EventType {
  Truck = "Truck",
  Flight = "Flight",
  Ship = "Ship",
}
