export interface ExamVulcan {
    Nazwa: string,
    Pracownik: string,
    DataModyfikacji: string,
    GodzinaOd: string | null,
    CzasTrwania: string | null,
    Opis: string,
    Rodzaj: number,
    SprawdzianUrls: unknown[], //TODO: Figure out correct type
    Id: number
}
