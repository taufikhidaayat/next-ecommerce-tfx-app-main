export interface UserAddress {
    id: string;
    userId: string;
    label: string;
    recipientName: string;
    phone: string;
    address: string;
    // Bagian terstruktur (opsional, untuk pre-fill form edit)
    street?: string | null;
    detail?: string | null;
    regencyId?: string | null;
    regencyName?: string | null;
    districtId?: string | null;
    districtName?: string | null;
    villageId?: string | null;
    villageName?: string | null;
    postalCode?: string | null;
    latitude: number;
    longitude: number;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserAddressInput {
    label: string;
    recipientName: string;
    phone: string;
    address: string;
    street?: string | null;
    detail?: string | null;
    regencyId?: string | null;
    regencyName?: string | null;
    districtId?: string | null;
    districtName?: string | null;
    villageId?: string | null;
    villageName?: string | null;
    postalCode?: string | null;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
}

export interface UserAddressResponse {
    status: string;
    message: string;
    data: UserAddress[];
}

export interface UserAddressSingleResponse {
    status: string;
    message: string;
    data: UserAddress;
}
