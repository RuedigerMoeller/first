
export interface MyApi {
    listDir(pathExt: { path: string }) : Promise<any>;
}