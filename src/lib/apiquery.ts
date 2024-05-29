import axios from "axios";
import { parseString, parseStringPromise } from 'xml2js';
import { chosungIncludes, getChosung, hangulIncludes } from "es-hangul";
import { ILawContent, ILawHanjung, ILawTree, LawContent, LawHanjung, LawHeader, LawJomun, LawTree } from "../model/lawmodel";

export interface ILaw {
  lawId: number,
  lawNameKorean: string,
  lawMST: number,
  lawDeclareDate: number,
  lawStartDate: number,
}
export interface ILawSearched {
  lawData:ILaw,
  lawSearchedIndex?:{
    start:number,
    end:number,
  },
  isSelected:boolean,
}

export interface ILawSearchResult {
  result:boolean;
  reason?:string;
  laws?: Map<number, ILawSearched>;
}


export class LawStorage {
  Laws:Map<number, ILaw>;

  constructor(laws:ILaw[]) {
    this.Laws = new Map<number, ILaw>;
    laws.forEach(law => {
      this.Laws.set(law.lawId, law);
    });
  }

  getSize() {
    return this.Laws.size;
  }
}

export class LawTreeStorage {
  LawTrees:Map<number, LawTree>;
  constructor(){
    this.LawTrees = new Map<number, LawTree>();
  }
}

export class APIs {
  private static _lawStorage:LawStorage;
  private static _lawTreeStorage:LawTreeStorage;
  
  static initiateStorage = (laws:ILaw[]) => {
    this._lawStorage = new LawStorage(laws);
    this._lawTreeStorage = new LawTreeStorage();
  }

  static isStorageInitiated(){
    return this._lawStorage != null;
  }

  static isStorageEmpty() {
    if(!this.isStorageInitiated()) {  
      return true;
    } else if(this._lawStorage.getSize() == 0){
      return true;
    } else {
      return false;
    }
  }

  static getMatchLawsByString(searchString:string):ILawSearchResult {
    console.log(getChosung(searchString));
    //실패처리
    if(this.isStorageEmpty()) {
      return {
        result:false,
        reason:"No Law list loaded."
      }
    }

    //성공시
    //Regex를 통한 테스트
    const searchedLaws = new Map<number, ILawSearched>();
    this._lawStorage.Laws.forEach(law => {
      if(hangulIncludes(law.lawNameKorean, searchString)){
        // 단어로 검색 시
        const start = law.lawNameKorean.indexOf(searchString);
        const matchIndex = {
          start:-1,
          end:-1,
        }
        if(start != -1 ){
          matchIndex.start = start;
          matchIndex.end = start + searchString.length - 1;
        }
        
        const lawSearched:ILawSearched = {
          lawData:law,
          lawSearchedIndex:matchIndex,
          isSelected:false,
        }

        searchedLaws.set(law.lawId, lawSearched);
        
      } else if (chosungIncludes(law.lawNameKorean, searchString)){
        //초성으로 검색시
        const matchIndex = {
          start: -1,
          end: -1
        }

        const lawChosung = getChosung(law.lawNameKorean);
        let chosungCnt = 0;
        let start = -1;
        let end = -1;
        for(let i = 0; i < lawChosung.length; i++){
          if(chosungCnt == searchString.length){
            break;
          }

          const currentChosung = lawChosung[i];
          
          if(currentChosung == searchString[chosungCnt]){
            if(chosungCnt == 0){
              start = i;
              end = start;
            } else {
              end = i;
            }
            chosungCnt++;
          }
        }

        matchIndex.start = start;
        matchIndex.end = end;
        
        const lawSearched:ILawSearched = {
          lawData:law,
          lawSearchedIndex:matchIndex,
          isSelected:false,
        }

        searchedLaws.set(law.lawId, lawSearched);
      }
    });

    const result:ILawSearchResult = {
      result:true,
      laws: searchedLaws
    }

    return result;
  }

  static registerLawTree(tree:LawTree){
    this._lawTreeStorage.LawTrees.set(tree.LawInfo.Id, tree);
    console.log(`LawTree ${tree.LawInfo.Id} is registered.`);
  }

  static isTreeRegisteredTree(input:LawTree):boolean {
    this._lawTreeStorage.LawTrees.forEach((tree) => {
      const nodes:ILawTree[] = [];
      tree.GetNodesBFS(nodes)
      nodes.forEach((node) => {
        if(node.LawInfo.Id == input.LawInfo.Id){
          return true;
        }
      })
    });

    return false;
  }

  static isTreeRegisteredId(id:number):boolean{
    const trees = Array.from(this._lawTreeStorage.LawTrees.values());
    for(const tree of trees){
      const nodes:ILawTree[] = [];
      tree.GetNodesBFS(nodes);
      for(const node of nodes){
        if(node.LawInfo.Id == id) {
          return true
        }
      }
    }

    return false;
  }

  static getRegisteredTreeById(id:number):ILawTree {
    if(!this.isTreeRegisteredId(id)){
      return LawTree.CreateEmptyTree();
    } else {
      const trees = Array.from(this._lawTreeStorage.LawTrees.values());
      for(const tree of trees){
        const nodes:ILawTree[] = [];
        tree.GetNodesBFS(nodes);
        for(const node of nodes){
          if(node.LawInfo.Id == id) {
            return tree;
          }
        }
      }

      return LawTree.CreateEmptyTree();
    }    
  }
}

export class FetchAPIs {
  
  static fetchLawById(apiParams:{apiId:string, lawId:number}) {
    const params = {
      OC : apiParams.apiId,
      target: 'law',
      type: 'XML',
      ID: apiParams.lawId,
    }
  }

  static async fetchLawStructureById(apiParams:{apiId:string, lawId:number}):Promise<ILawTree> {
    console.log(apiParams.lawId);
    console.log(APIs.isTreeRegisteredId(apiParams.lawId));
    if(APIs.isTreeRegisteredId(apiParams.lawId)){
      console.log("Already registered");
      return APIs.getRegisteredTreeById(apiParams.lawId);
    } else {
      try {
        const url = 'http://www.law.go.kr/DRF/lawService.do';
        const params = {
          OC : apiParams.apiId,
          target: 'lsStmd',
          type: 'XML',
          ID: apiParams.lawId,
        }
        const response = await axios.get(url, { params });
        const nodes:ILawTree[] = [];
        //법령트리 생성
        const rootTree = LawTree.CreateEmptyTree();
        rootTree.LawType = "법";
  
        const result = await parseString(response.data, (err, result) => {
          if(err) {
            console.error(err);
            return;
          }
  
          //법령 계층화
          const lawTree:Array<any> = result.법령체계도.상하위법;
          const lawNodes:Array<any> = lawTree[0].법률;
          const lawRoot = lawNodes[0];
          const lawRootHeader = lawNodes[0].기본정보[0];
          const lawDecrees:Array<any> = lawNodes[0].시행령;
          const lawRules:Array<any> = lawNodes[0].시행규칙;
  
          //#region 최상위법 파싱
          //1-1. 최상위법의 정보 가져오기
          const rootHeader = LawHeader.CreateEmptyHeader();
          const lawRootInfo = {
            title : lawRootHeader.법령명[0],
            id : parseInt(lawRootHeader.법령ID[0], 10),
            startDate : lawRootHeader.시행일자[0],
          }
          rootHeader.Id = lawRootInfo.id,
          rootHeader.LawTitle = lawRootInfo.title,
          rootHeader.StartDate = lawRootInfo.startDate,
  
          rootTree.LawInfo = rootHeader;
          
          //1-2. 최상위법의 행정규칙 가져오기
          const lawRootHanjung:LawHanjung[] = [];
          const parsedHanjungRules:any[] = lawRoot.행정규칙
          if(parsedHanjungRules){
            //훈령인 경우
            const lawRootHanjungHun:any[] = parsedHanjungRules[0].훈령;
            if(lawRootHanjungHun){
              lawRootHanjungHun.forEach((item) => {
                const info = item.기본정보[0];
                const header = LawHeader.CreateEmptyHeader();
    
                header.Id = info.행정규칙ID[0];
                header.LawTitle = info.행정규칙명[0];
                header.StartDate = info.시행일자[0];
                
                const hanjung = LawHanjung.CreateEmptyHanjung();
                hanjung.LawInfo = header;
                hanjung.RuleType = "훈령";
                lawRootHanjung.push(hanjung);
              });
            }
    
            //고시인 경우
            const lawRootHanjungGosi:any[] = parsedHanjungRules[0].고시;
            if(lawRootHanjungGosi){
              lawRootHanjungGosi.forEach((item) => {
                const info = item.기본정보[0];
                const header = LawHeader.CreateEmptyHeader();
    
                header.Id = info.행정규칙ID[0];
                header.LawTitle = info.행정규칙명[0];
                header.StartDate = info.시행일자[0];
    
                const hanjung = LawHanjung.CreateEmptyHanjung();
                hanjung.LawInfo = header;
                hanjung.RuleType = "고시";
                lawRootHanjung.push(hanjung);
              });
            }

            //예규인 경우
            const lawRootHanjungYegyu:any[] = parsedHanjungRules[0].예규;
            if(lawRootHanjungYegyu){
              lawRootHanjungYegyu.forEach((item) => {
                const info = item.기본정보[0];
                const header = LawHeader.CreateEmptyHeader();
    
                header.Id = info.행정규칙ID[0];
                header.LawTitle = info.행정규칙명[0];
                header.StartDate = info.시행일자[0];
    
                const hanjung = LawHanjung.CreateEmptyHanjung();
                hanjung.LawInfo = header;
                hanjung.RuleType = "예규";
                lawRootHanjung.push(hanjung);
              });
            }
          }
  
          //최상위 법의 행정규칙 설정
          lawRootHanjung.forEach(res => {
            rootTree.HanjungRules.set(res.LawInfo.Id, res)
          });
          //#endregion
  
          //#region 시행령 파싱 (시행령의 시행규칙, 행정규칙 포함)
          const lawDecreesInfo = lawDecrees.map((res) => {
            const node = LawTree.CreateEmptyTree();
            const header = LawHeader.CreateEmptyHeader();
            const info = res.기본정보[0];
  
            //시행령의 정보 저장
            header.Id = parseInt(info.법령ID[0], 10);
            header.StartDate = info.시행일자[0];
            header.LawTitle = info.법령명[0];
            
            node.LawInfo = header;
            node.ParentLaw = rootTree;
            node.LawType = "법-시행령";
            
            //시행령의 행정규칙 저장
            const decreeRules = new Map<number, ILawHanjung>();
            const parsedHanjungRules:any[] = res.행정규칙
            if(parsedHanjungRules){
              //훈령인 경우
              const lawRootHanjungHun:any[] = parsedHanjungRules[0].훈령;
              if(lawRootHanjungHun){
                lawRootHanjungHun.forEach((item) => {
                  const info = item.기본정보[0];
                  const header = LawHeader.CreateEmptyHeader();
      
                  header.Id = info.행정규칙ID[0];
                  header.LawTitle = info.행정규칙명[0];
                  header.StartDate = info.시행일자[0];
                  
                  const hanjung = LawHanjung.CreateEmptyHanjung();
                  hanjung.LawInfo = header;
                  hanjung.RuleType = "훈령";
                  decreeRules.set(hanjung.LawInfo.Id, hanjung);
                });
              }
      
              //고시인 경우
              const lawRootHanjungGosi:any[] = parsedHanjungRules[0].고시;
              if(lawRootHanjungGosi){
                lawRootHanjungGosi.forEach((item) => {
                  const info = item.기본정보[0];
                  const header = LawHeader.CreateEmptyHeader();
      
                  header.Id = info.행정규칙ID[0];
                  header.LawTitle = info.행정규칙명[0];
                  header.StartDate = info.시행일자[0];
      
                  const hanjung = LawHanjung.CreateEmptyHanjung();
                  hanjung.LawInfo = header;
                  hanjung.RuleType = "고시";
                  decreeRules.set(hanjung.LawInfo.Id, hanjung);
                });
              }

              //예규인 경우
              const lawRootHanjungYegyu:any[] = parsedHanjungRules[0].예규;
              if(lawRootHanjungYegyu){
                lawRootHanjungYegyu.forEach((item) => {
                  const info = item.기본정보[0];
                  const header = LawHeader.CreateEmptyHeader();
      
                  header.Id = info.행정규칙ID[0];
                  header.LawTitle = info.행정규칙명[0];
                  header.StartDate = info.시행일자[0];
      
                  const hanjung = LawHanjung.CreateEmptyHanjung();
                  hanjung.LawInfo = header;
                  hanjung.RuleType = "예규";
                  lawRootHanjung.push(hanjung);
                });
              }
            }
            node.HanjungRules = decreeRules;

            //시행령의 시행규칙 저장
            const sihangRule:any[] = res.시행규칙;
            sihangRule?.map((item) => {
              
              //시행규칙 정보 저장
              const law = LawTree.CreateEmptyTree();
              const info = item.기본정보[0];
              const header = LawHeader.CreateEmptyHeader();

              header.Id = parseInt(info.법령ID[0], 10);
              header.LawTitle = info.법령명[0];
              header.StartDate = info.시행일자[0];

              law.LawInfo = header;
              law.LawType = "법-시행령-시행규칙"
              
              //시행규칙의 행정규칙 등록
              const decreeRules = new Map<number, ILawHanjung>();
              const parsedHanjungRules:any[] = item.행정규칙
              if(parsedHanjungRules){
                //훈령인 경우
                const lawRootHanjungHun:any[] = parsedHanjungRules[0].훈령;
                if(lawRootHanjungHun){
                  lawRootHanjungHun.forEach((item) => {
                    const info = item.기본정보[0];
                    const header = LawHeader.CreateEmptyHeader();
        
                    header.Id = info.행정규칙ID[0];
                    header.LawTitle = info.행정규칙명[0];
                    header.StartDate = info.시행일자[0];
                    
                    const hanjung = LawHanjung.CreateEmptyHanjung();
                    hanjung.LawInfo = header;
                    hanjung.RuleType = "훈령";
                    decreeRules.set(hanjung.LawInfo.Id, hanjung);
                  });
                }
        
                //고시인 경우
                const lawRootHanjungGosi:any[] = parsedHanjungRules[0].고시;
                if(lawRootHanjungGosi){
                  lawRootHanjungGosi.forEach((item) => {
                    const info = item.기본정보[0];
                    const header = LawHeader.CreateEmptyHeader();
        
                    header.Id = info.행정규칙ID[0];
                    header.LawTitle = info.행정규칙명[0];
                    header.StartDate = info.시행일자[0];
        
                    const hanjung = LawHanjung.CreateEmptyHanjung();
                    hanjung.LawInfo = header;
                    hanjung.RuleType = "고시";
                    decreeRules.set(hanjung.LawInfo.Id, hanjung);
                  });
                }
              }
              law.HanjungRules = decreeRules;

              //부모-자식노드 등록;
              law.ParentLaw = node;
              node.ChildLaw.set(law.LawInfo.Id, law);
            });
            
  
            //최상위법의 자식법으로 등록
            rootTree.ChildLaw.set(node.LawInfo.Id, node);
          });
          //#endregion

          //법-시행규칙 등록
          if(lawRules){
            const lawRulesInfo = lawRules.map((res) => {
              const header = LawHeader.CreateEmptyHeader();
              const node = LawTree.CreateEmptyTree();
              const info = res.기본정보[0];
              
              //시행규칙의 정보 저장
              header.Id = parseInt(info.법령ID[0], 10);
              header.StartDate = info.시행일자[0];
              header.LawTitle = info.법령명[0];
              
              node.LawInfo = header;
              node.ParentLaw = rootTree;
              node.LawType = "법-시행규칙";
    
              node.LawInfo = header;
    
              //시행규칙의 행정규칙 등록
              const decreeRules = new Map<number, ILawHanjung>();
              const parsedHanjungRules:any[] = res.행정규칙
              if(parsedHanjungRules){
                //훈령인 경우
                const lawRootHanjungHun:any[] = parsedHanjungRules[0].훈령;
                if(lawRootHanjungHun){
                  lawRootHanjungHun.forEach((item) => {
                    const info = item.기본정보[0];
                    const header = LawHeader.CreateEmptyHeader();
        
                    header.Id = info.행정규칙ID[0];
                    header.LawTitle = info.행정규칙명[0];
                    header.StartDate = info.시행일자[0];
                    
                    const hanjung = LawHanjung.CreateEmptyHanjung();
                    hanjung.LawInfo = header;
                    hanjung.RuleType = "훈령";
                    decreeRules.set(hanjung.LawInfo.Id, hanjung);
                  });
                }
        
                //고시인 경우
                const lawRootHanjungGosi:any[] = parsedHanjungRules[0].고시;
                if(lawRootHanjungGosi){
                  lawRootHanjungGosi.forEach((item) => {
                    const info = item.기본정보[0];
                    const header = LawHeader.CreateEmptyHeader();
        
                    header.Id = info.행정규칙ID[0];
                    header.LawTitle = info.행정규칙명[0];
                    header.StartDate = info.시행일자[0];
        
                    const hanjung = LawHanjung.CreateEmptyHanjung();
                    hanjung.LawInfo = header;
                    hanjung.RuleType = "고시";
                    decreeRules.set(hanjung.LawInfo.Id, hanjung);
                  });
                }

                //예규인 경우
                const lawRootHanjungYegyu:any[] = parsedHanjungRules[0].예규;
                if(lawRootHanjungYegyu){
                  lawRootHanjungYegyu.forEach((item) => {
                    const info = item.기본정보[0];
                    const header = LawHeader.CreateEmptyHeader();
        
                    header.Id = info.행정규칙ID[0];
                    header.LawTitle = info.행정규칙명[0];
                    header.StartDate = info.시행일자[0];
        
                    const hanjung = LawHanjung.CreateEmptyHanjung();
                    hanjung.LawInfo = header;
                    hanjung.RuleType = "예규";
                    lawRootHanjung.push(hanjung);
                  });
                }
              }
              node.HanjungRules = decreeRules;
              
              node.ParentLaw = rootTree;
              rootTree.ChildLaw.set(node.LawInfo.Id, node);
            });
          }
        });
  
        APIs.registerLawTree(rootTree);
        return rootTree;
      } catch (error) {
        console.log(error)
        return LawTree.CreateEmptyTree();
      }
    }
  }

  static async fetchLawContentByRootLaw(apiParams: { apiId: string, node: ILawTree }): Promise<{ result: boolean, content?: string }> {
    const url = 'http://www.law.go.kr/DRF/lawService.do';
    const params = {
        OC: apiParams.apiId,
        target: 'law',
        type: 'XML',
        ID: apiParams.node.LawInfo.Id,
    };

    const response = await axios.get(url, { params });
    const extractedText = await this.extractSections(response.data);
    if (extractedText) {
        return {
            result: true,
            content: extractedText
        };
    } else {
        return {
            result: false,
        };
    }
  }

  static async fetchHangjungRuleById(apiParams: { apiId: string, id: number }): Promise<{ result: boolean, content?: string }> {
    const url = 'http://www.law.go.kr/DRF/lawService.do';
    const params = {
        OC: apiParams.apiId,
        target: 'admrul',
        type: 'XML',
        LID: apiParams.id,
    };

    const response = await axios.get(url, { params });
    const extractedText = await this.extractSections(response.data);
    if (extractedText) {
        return {
            result: true,
            content: extractedText
        };
    } else {
        return {
            result: false,
        };
    }
  }

  static extractSections = async (lawData:any):Promise<string> => {
    const result = await this.parseAndCombineText(lawData);
    return result;
  }

  
  // XML 데이터를 파싱하고 텍스트를 합치는 함수
  static async parseAndCombineText(xmlData: string): Promise<string> {
    const result = await parseStringPromise(xmlData);

    // 내부 함수: XML 객체를 순회하여 텍스트를 추출하는 함수
    function extractText(obj: any, parentKey: string = ''): string {
        let text = '';

        if (typeof obj === 'string') {
            text += `[${parentKey}] ${obj}\n`;
        } else if (Array.isArray(obj)) {
            obj.forEach((item) => {
                text += extractText(item, parentKey);
            });
        } else if (typeof obj === 'object') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const newKey = key; // 최종 속성만 사용
                    if (typeof obj[key] === 'string' || Array.isArray(obj[key])) {
                        text += extractText(obj[key], newKey);
                    } else {
                        text += extractText(obj[key], newKey);
                    }
                }
            }
        }

        return text;
    }

    return extractText(result);
  }
}