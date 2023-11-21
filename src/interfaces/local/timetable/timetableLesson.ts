import { TimetablePeriod } from "./timetablePeriod.js";

export interface TimetableLesson {
    period: TimetablePeriod,
    subject: string,
    oldSubject?: string,
    group?: string,
    room: string,
    oldRoom?: string,
    teacher: string,
    oldTeacher?: string,
    changes: boolean,
    cancelled: boolean,
    moved: boolean,
    changeDescription?: string
}
