import { Gender } from "@/enum/gender";
import { Language } from "@/enum/language";

export interface CreateUpdateUserInput {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    address?: string;
    birthdate?: string;
    gender?: Gender;
    languagePreference?: Language;
};
