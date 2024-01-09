export interface GradesResponse {
    IsSrednia: boolean,
    IsPunkty: boolean,
    Oceny: SubjectGradesResponse[],
    OcenyOpisowe: unknown[],
    TypOcen: number,
    IsOstatniSemestr: boolean,
    IsDlaDoroslych: boolean
}

export interface SubjectGradesResponse {
    Przedmiot: string,
    Pozycja: number,
    OcenyCzastkowe: GradeResponse[],
    ProponowanaOcenaRoczna: string | null,
    OcenaRoczna: string | null,
    ProponowanaOcenaRocznaPunkty: unknown | null, // TODO: Figure out type
    OcenaRocznaPunkty: unknown | null, // TODO: Same as above
    Srednia: number,
    SumaPunktow: string,
    WidocznyPrzedmiot: boolean
}

export interface GradeResponse {
    Nauczyciel: string,
    Wpis: string,
    Waga: number,
    NazwaKolumny: string,
    KodKolumny: string,
    DataOceny: string,
    KolorOceny: number
}

export interface Grades {
    [subject: string]: SubjectGrades
}

export interface SubjectGrades {
    average: number,
    proposedSemestralGrade?: string,
    semestralGrade?: string
    grades: Grade[]
}

export interface Grade {
    teacher: string,
    grade: string,
    weight: number,
    description: string,
    code: string,
    date: Date,
    color: number
}
