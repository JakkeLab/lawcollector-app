import { ILaw, ILawSearchResult, ILawSearched } from "@/lib/apiquery";

export interface IElectronAPI {
  setApiId: (apiId:string) => Promise<{result:boolean, status:unknown }>,
  getApiId: () => Promise<{result:boolean, apiId:string, status:unknown }>,
  getLawList: () => Promise<string>,
  getLawListFromFlie: () => Promise<{loaded:boolean, laws?:ILaw[], reason?:any, filename:string}>,
  searchLawByString: (lawName:string) => Promise<ILawSearchResult>
}
  
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}