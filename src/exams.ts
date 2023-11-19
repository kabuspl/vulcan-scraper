export interface ExamsWeekResponse {
    SprawdzianyGroupedByDayList: ExamsDayResponse[]
}

export interface ExamsDayResponse {
    Data: string,
    Sprawdziany: ExamResponse[],
    Pokazuj: boolean
}

export interface ExamResponse {
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

export interface Exam {
    subject: string,
    teacher: string,
    date: Date,
    modificationDate: Date,
    description: string,
    type: number,
    id: number
}
