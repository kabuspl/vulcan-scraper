export interface TimetableVulcan {
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
