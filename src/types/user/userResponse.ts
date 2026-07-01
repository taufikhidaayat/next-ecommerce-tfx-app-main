import { Gender } from "@/enum/gender";
import { Language } from "@/enum/language";
import { UserRole } from "@/enum/userRole";

export interface UserResponse {
    status: string;
    message: string;
    data: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        phone: string;
        address: string;
        birthDate: string;
        gender: Gender;
        profileImageUrl: string;
        languagePreference: Language;
        latitude?: number | null;
        longitude?: number | null;
        passwordChangeCount?: number;
        passwordChangeWaitSeconds?: number;
    };
}