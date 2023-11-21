import { TimetableLesson } from "./timetableLesson.js"
import { TimetablePeriod } from "./timetablePeriod.js"

export interface Timetable {
    periods: TimetablePeriod[],
    lessons: {
        [date: string]: TimetableLesson[]
    }
}
