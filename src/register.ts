export interface RegisterResponse {
    Id: number,
    IdUczen: number,
    UczenImie: string,
    UczenImie2: string,
    UczenNazwisko: string,
    UczenPseudonim: string,
    IsDziennik: boolean,
    IdDziennik: number,
    IdPrzedszkoleDziennik: number,
    IdWychowankowieDziennik: number,
    Poziom: number,
    Symbol: string,
    Nazwa: string | null,
    DziennikRokSzkolny: number,
    Okresy: PeriodResponse[],
    UczenOddzialOkresy: unknown, //TODO: Implement this
    DziennikDataOd: string,
    DziennikDataDo: string,
    IdJednostkaSkladowa: number,
    IdSioTyp: number,
    IsDorosli: boolean,
    IsPolicealna: boolean,
    Is13: boolean,
    IsArtystyczna: boolean,
    IsArtystyczna13: boolean,
    IsSpecjalny: boolean,
    IsPrzedszkola: boolean,
    IsWychowankowie: boolean,
    IsArchiwalny: boolean,
    IsOplaty: boolean,
    IsPlatnosci: boolean,
    IsPayButtonOn: boolean,
    CanMergeAccounts: boolean,
    UczenPelnaNazwa: string,
    O365PassType: number,
    IsAdult: boolean,
    IsStudentParent: boolean,
    IsAuthorized: boolean,
    Obywatelstwo: number
}

export interface PeriodResponse {
    NumerOkresu: number,
    Poziom: number,
    DataOd: string,
    DataDo: string,
    IdOddzial: number,
    IdJednostkaSprawozdawcza: number,
    IsLastOkres: boolean,
    Id: number
}

export interface Register {
    id: number,
    studentId: number,
    registerId: number,
    firstName: string,
    middleName: string,
    lastName: string,
    periods: Period[]
}

export interface Period {
    id: number,
    periodNumber: number,
    startDate: Date,
    endDate: Date,
    classId: number,
    schoolId: number
}