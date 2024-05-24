export interface IElectronAPI {
  setApiId: (apiId:string) => Promise<{result:boolean, status:unknown }>,
  getLawList: () => Promise<string>,
  getLawListFromFlie: () => Promise<string>,
}
  
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}