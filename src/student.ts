export interface StudentInfoRepsonse {
    Imie: string,
    Imie2: string,
    NumerDokumentu: unknown | null,
    Nazwisko: string,
    DataUrodzenia: string,
    MiejsceUrodzenia: string,
    NazwiskoRodowe: string,
    ObywatelstwoPolskie: number,
    ImieMatki: string,
    ImieOjca: string,
    Plec: boolean,
    AdresZamieszkania: string,
    AdresZameldowania: string,
    AdresKorespondencji: string,
    TelDomowy: string,
    TelKomorkowy: string,
    Email: string,
    CzyWidocznyPesel: boolean,
    Opiekun1: StudentGuardianResponse,
    Opiekun2: StudentGuardianResponse,
    UkryteDaneAdresowe: boolean,
    ImieNazwisko: string,
    PosiadaPesel: boolean,
    Polak: boolean,
    ImieMatkiIOjca: boolean,
    ShowPhoto: boolean
}

export interface StudentGuardianResponse {
    Id: number,
    Imie: string,
    Nazwisko: string,
    StPokrewienstwa: string,
    Adres: string,
    TelDomowy: string,
    TelKomorkowy: string,
    TelSluzbowy: string,
    Email: string,
    FullName: string,
    Telefon: string
}

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
