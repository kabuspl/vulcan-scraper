import { HTMLElement, parse } from 'node-html-parser';

export interface TimetableResponse {
    Data: string,
    Headers: {
        Text: string,
        Width: string,
        Distinction: boolean,
        Flex: number
    }[],
    Rows: string[][],
    Additionals: unknown[]
}

export interface Timetable {
    periods: TimetablePeriod[],
    lessons: {
        [date: string]: TimetableLesson[]
    }
}

export interface TimetablePeriod {
    number: number,
    start: Date,
    end: Date
}

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

export enum LESSON_INFO {
    PLANNED = "x-treelabel-ppl",
    COMPLETED = "x-treelabel-rlz",
    CHANGES = "x-treelabel-zas",
    MOVED_OR_CANCELLED = "x-treelabel-inv",

    SUBSTITUTE_TEACHER = "(zastępstwo",
    MOVED_TO_HERE = "(przeniesiona z"
}

export class TimetableParser {
    /**
     * Parse timetable
     * @param timetableResponse timetable data directly from Vulcan
     * @returns parsed timetable
     */
    static parse(timetableResponse: TimetableResponse) {
        // Create array of dates of days included in the timetable
        const days: string[] = [];

        for(const [index, header] of timetableResponse.Headers.entries()) {
            if(index == 0) continue;
            const dateSplit = header.Text.split("<br />")[1].split(".");
            days.push(`${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`);
        }

        // Create array of periods (for example: number: 1; start: 8:00; end: 8:45)
        const periods: TimetablePeriod[] = [];

        for(const row of timetableResponse.Rows) {
            const hourCell = row[0];
            const hourSplit = hourCell.split("<br />");
            const startSplit = hourSplit[1].split(":");
            const endSplit = hourSplit[2].split(":");
            // FIXME: The way I handle creating these dates is terrible
            periods.push({
                number: parseInt(hourSplit[0]),
                start: new Date(parseInt(days[0].substring(0,4)), parseInt(days[0].substring(5,7)), parseInt(days[0].substring(8,10)), parseInt(startSplit[0]), parseInt(startSplit[1])),
                end: new Date(parseInt(days[0].substring(0,4)), parseInt(days[0].substring(5,7)), parseInt(days[0].substring(8,10)), parseInt(endSplit[0]), parseInt(endSplit[1]))
            })
        }

        const timetableBuilder: Timetable = {
            periods,
            lessons: {}
        }

        // Loop through every cell of timetable and parse it
        for(const [index, row] of timetableResponse.Rows.entries()) {
            for(const [cellIndex, cell] of row.entries()) {
                // First cell is period
                if(cellIndex == 0) continue;
                if(cell == "") continue;

                const parsedHTML = parse(cell);

                // If required date does not yet exist in timetableBuilder, set it to empty array
                if(!timetableBuilder.lessons[days[cellIndex-1]]) timetableBuilder.lessons[days[cellIndex-1]] = [];
                timetableBuilder.lessons[days[cellIndex-1]].push(this.parseLesson(parsedHTML, periods[index]));
            }
        }

        return timetableBuilder;
    }

    /**
     * Detect div count and call respective method.
     * @param cell Timetable table cell.
     * @param period The period in which this lesson is.
     * @returns Parsed lesson
     */
    private static parseLesson(cell: HTMLElement, period: TimetablePeriod) {
        const divs = cell.querySelectorAll("> div");
        switch(divs.length) {
            case 1:
                return this.parseLessonOneDiv(divs[0], period);
            case 2:
                return this.parseLessonTwoDivs(divs, period);
        }
    }

    /**
     * Parse spans in div.
     * @param div Div containing lesson.
     * @param period The period in which this lesson is.
     * @returns Parsed TimetableLesson
     */
    private static parseLessonOneDiv(div: HTMLElement, period: TimetablePeriod): TimetableLesson {
        const spans = div.querySelectorAll("> span");
        const { subject, group } = this.spanToSubjectAndGroup(div.querySelectorAll("span")[0].textContent);
        const offset = group ? 1 : 0; // If lesson is divided into groups it has one extra blank span. This offset skips it.
        const lesson: TimetableLesson = {
            subject: subject.trim(),
            room: spans[1+offset].textContent.trim(),
            period,
            teacher: spans[2+offset].textContent.trim(),
            cancelled: div.innerHTML.includes(LESSON_INFO.MOVED_OR_CANCELLED),
            changes: div.innerHTML.includes(LESSON_INFO.CHANGES),
            moved: div.textContent.includes(LESSON_INFO.MOVED_TO_HERE)
        }
        if(group) lesson.group = group;
        if(div.innerHTML.includes("</span>(")) lesson.changeDescription = div.innerHTML.split("</span>(")[1].split(")")[0] // Extract text after last span. This text contains the reason of changes.
        if(lesson.changeDescription) lesson.changes = true;
        return lesson;
    }

    /**
     * Parses lessons for both divs and then combines them into one lesson.
     * @param divs Divs containing lessons.
     * @param period The period in which these lessons are.
     * @returns
     */
    private static parseLessonTwoDivs(divs: HTMLElement[], period: TimetablePeriod) {
        const oldLesson = this.parseLessonOneDiv(divs[0], period);
        const newLesson = this.parseLessonOneDiv(divs[1], period);

        // Copy most properies from new lesson, set cancelled if both lessons are cancelled and set changes and moved if any of lessons is changed or moved.
        const lesson: TimetableLesson = {
            subject: newLesson.subject,
            room: newLesson.room,
            period: period,
            teacher: newLesson.teacher,
            cancelled: oldLesson.cancelled && newLesson.cancelled,
            changes: oldLesson.changes || newLesson.changes,
            moved: oldLesson.moved || newLesson.moved,
        }
        // If subject, room and teacher are not the same set their oldXxx equivalents.
        if(oldLesson.subject != newLesson.subject) lesson.oldSubject = oldLesson.subject;
        if(oldLesson.room != newLesson.room) lesson.oldRoom = oldLesson.room;
        if(oldLesson.teacher != newLesson.teacher) lesson.oldTeacher = oldLesson.teacher;

        if(newLesson.changeDescription) lesson.changeDescription = newLesson.changeDescription;

        return lesson;
    }

    /**
     * Converts string "Subject [Group]" to object with 2 parameters.
     * @param spanText Text to convert.
     * @returns Object containing 2 properties with subject and group.
     */
    private static spanToSubjectAndGroup(spanText: string) {
        if(spanText.at(-1) == "]") {
            const spanSplit = spanText.slice(0, -1).split(" [");
            return {
                subject: spanSplit[0],
                group: spanSplit[1]
            }
        } else {
            return {
                subject: spanText,
                group: null
            }
        }
    }
}
