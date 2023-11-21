import { SubjectGradesVulcan } from "./subjectGrades.js";

export interface GradesVulcan {
    IsSrednia: boolean,
    IsPunkty: boolean,
    Oceny: SubjectGradesVulcan[],
    OcenyOpisowe: unknown[],
    TypOcen: number,
    IsOstatniSemestr: boolean,
    IsDlaDoroslych: boolean
}
