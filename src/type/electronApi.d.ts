import { ILaw, ILawSearchResult, ILawSearched } from "@/lib/apiquery";
import { ILawTree } from "@/model/lawmodel";

export interface IElectronAPI {
  setApiId: (apiId:string) => Promise<{result:boolean, status:unknown }>,
  getApiId: () => Promise<{result:boolean, apiId:string, status:unknown }>,
  getLawList: () => Promise<string>,
  getLawListFromFlie: () => Promise<{loaded:boolean, laws?:ILaw[], reason?:any, filename:string}>,
  searchLawByString: (lawName:string) => Promise<ILawSearchResult>
  fetchLawStructure: (lawId:number) => Promise<{ result: boolean, lawTree?:ILawTree, reason?:any }>
  fetchLawContent: (lawRootTrees: ILawTree) => Promise<ILawTree>,
  exportLawContent:(lawTree:ILawTree) => Promise<{result:boolean, content?:string}>,
}
  
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}