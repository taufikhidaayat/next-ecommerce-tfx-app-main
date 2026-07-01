// Indonesian administrative region types (sourced from the emsifa wilayah API).
// The thesis scope is limited to DI Yogyakarta, so the province is fixed.

export interface WilayahItem {
    id: string;
    name: string;
}

// Fixed province for this project: DI Yogyakarta (emsifa province id "34").
export const DIY_PROVINCE: WilayahItem = {
    id: "34",
    name: "DI YOGYAKARTA",
};

// The region selection captured by the address form.
export interface RegionSelection {
    province: string; // always "DI YOGYAKARTA"
    regencyId: string;
    regencyName: string;
    districtId: string;
    districtName: string;
    villageId: string;
    villageName: string;
    postalCode: string;
}

export const EMPTY_REGION: RegionSelection = {
    province: DIY_PROVINCE.name,
    regencyId: "",
    regencyName: "",
    districtId: "",
    districtName: "",
    villageId: "",
    villageName: "",
    postalCode: "",
};
