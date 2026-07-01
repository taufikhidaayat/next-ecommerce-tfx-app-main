export enum Language {
    ID = "id",
    EN = "en",
    JV = "jv",
}

export const languageLabelMap: Record<Language, string> = {
    [Language.ID]: "Bahasa Indonesia",
    [Language.EN]: "English",
    [Language.JV]: "Basa Jawa",
};

export const languageOptions = Object.values(Language).map((lang) => ({
    value: lang,
    label: languageLabelMap[lang],
}));
