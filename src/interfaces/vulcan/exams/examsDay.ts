import { ExamVulcan } from "./exam.js";

export interface ExamsDayVulcan {
    Data: string,
    Sprawdziany: ExamVulcan[],
    Pokazuj: boolean
}
