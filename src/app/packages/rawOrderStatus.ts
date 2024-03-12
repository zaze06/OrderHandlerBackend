export enum RawOrderStatus {
    DELIVERED = "DELIVERED",
    SHIPPED = "SHIPPED",
    PACKED = "PACKED",
    RECEIVED = "RECEIVED",
    UNKNOWN = "UNKNOWN",
}

export namespace RawOrderStatus {
    export function advance(orderStatus: RawOrderStatus): RawOrderStatus {
        switch (orderStatus) {
            case RawOrderStatus.RECEIVED: return RawOrderStatus.PACKED;
            case RawOrderStatus.PACKED: return RawOrderStatus.SHIPPED;
            case RawOrderStatus.SHIPPED: return RawOrderStatus.DELIVERED;
            case RawOrderStatus.DELIVERED: return RawOrderStatus.DELIVERED;
        }
    }

    export function reverse(orderStatus: RawOrderStatus): RawOrderStatus {
        switch (orderStatus) {
            case RawOrderStatus.RECEIVED:
                return RawOrderStatus.RECEIVED;
            case RawOrderStatus.PACKED:
                return RawOrderStatus.RECEIVED;
            case RawOrderStatus.SHIPPED:
                return RawOrderStatus.PACKED;
            case RawOrderStatus.DELIVERED:
                return RawOrderStatus.SHIPPED;
        }
    }
}