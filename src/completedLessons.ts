export interface CompletedLessonsRepsonse {
    [date: string]: CompletedLessonResponse[]
}

export interface CompletedLessonResponse {
    IdLekcja: number,
    Data: string,
    Przedmiot: string,
    NrLekcji: number,
    Temat: string,
    Nauczyciel: string,
    Zastepstwo: string,
    Nieobecnosc: string,
    PseudonimUcznia: string | null,
    ZasobyPubliczne: string,
    LekcjaZdalna: string,
    KolekcjePoLekcji: unknown[],
    PrzedmiotDisplay: string
}

export interface CompletedLesson {
    id: number,
    date: Date,
    subject: string,
    lessonNumber: number,
    topic: string,
    teacher: string,
    substitution: boolean,
    absence: string
}
