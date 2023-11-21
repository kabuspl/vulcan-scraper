export interface SubjectClassGradesVulcan {
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
