export interface IPaginateData<T> {
    data: T[],
    paginate: {
        limit: number,
        page: number,
        total: number,
    },
    totalResult: number
}