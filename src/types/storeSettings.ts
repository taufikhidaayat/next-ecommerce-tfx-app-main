export interface StoreSettings {
    id: string;
    storeName: string;
    storeAddress?: string;
    storeLatitude: number;
    storeLongitude: number;
    maxDeliveryRadius: number;
    minPurchaseDelivery: number;
    firstPurchaseDiscountEnabled: boolean;
    firstPurchaseDiscountPercent: number;
}

export interface StoreSettingsResponse {
    status: string;
    message: string;
    data: StoreSettings;
}
