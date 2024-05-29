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
  exportMultipleContent:(lawTrees:Set<ILawTree>) => Promise<{ rootLawName:string, subContents: {title:string, content:string}[]}[]>,
  selecFolder:() => Promise<string>,
  savePdfs: (data: { pdfBuffers: { base64: string, rootLawName: string }[], folderPath: string }) => Promise<string>,
}
  
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}