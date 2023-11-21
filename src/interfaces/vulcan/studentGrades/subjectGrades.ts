import { GradeVulcan } from "./grade.js";

export interface SubjectGradesVulcan {
    Przedmiot: string,
    Pozycja: number,
    OcenyCzastkowe: GradeVulcan[],
    ProponowanaOcenaRoczna: string,
    OcenaRoczna: string,
    ProponowanaOcenaRocznaPunkty: unknown | null, // TODO: Figure out type
    OcenaRocznaPunkty: unknown | null, // TODO: Same as above
    Srednia: number,
    SumaPunktow: string,
    WidocznyPrzedmiot: boolean
}
