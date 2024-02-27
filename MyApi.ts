
export interface MyApi {
    listDir(pathExt: { path: string }) : Promise<any>;
    query(query: { ticker: string; rangeDays: number }) : Promise<{
        activeVol: number, dt: string, oi: number, price: string, ticker: string, vol: number }[]
        >
}