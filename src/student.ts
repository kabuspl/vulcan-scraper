export interface StudentInfo {
    name: string;
    middleName: string | null;
    lastName: string;
    familyName: string | null;
    fullName: string;
    birthDate: Date;
    birthPlace: string | null;
    hasPolishCitizenship: boolean;
    gender: "male" | "female";
    address: string;
    registeredAddress: string;
    correspondenceAddress: string;
    homePhone: string | null;
    phone: string | null;
    email: string | null;
    isPeselVisible: boolean;
    isAddressVisible: boolean;
    isPhotoVisivle: boolean;
    hasPesel: boolean;
    isPole: boolean;
    guardians: StudentGuardian[];
}

export interface StudentGuardian {
    id: number;
    name: string;
    lastName: string;
    fullName: string;
    kinship: string | null;
    address: string;
    homePhone: string | null;
    cellPhone: string | null;
    workPhone: string | null;
    email: string | null;
    phone: string | null;
}
