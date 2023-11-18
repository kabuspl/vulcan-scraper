export interface SubjectClassGradesResponse {
    Subject: string,
    IsAverage: boolean,
    TableContent: string,
    ClassSeries: {
        Average: string,
        IsEmpty: boolean,
        Items: {
            Label: string,
            Value: number
        }[]
    },
    StudentSeries: {
        Average: string,
        IsEmpty: boolean,
        Items: {
            Label: string,
            Value: number
        }[]
    }
}

export interface ClassGrades {
    [subject: string]: SubjectClassGrades
}

export interface SubjectClassGrades {
    grades: {
        1: number,
        2: number,
        3: number,
        4: number,
        5: number,
        6: number
    },
    average: number
}