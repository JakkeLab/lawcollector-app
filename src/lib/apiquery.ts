import axios from "axios";
import { parseString } from 'xml2js';
import { chosungIncludes, getChosung, hangulIncludes } from "es-hangul";
import { ILawHanjung, LawHanjung, LawHeader, LawTree } from "../model/lawmodel";

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

export class APIs {
  static _lawStorage:LawStorage;

  static initiateStorage = (laws:ILaw[]) => {
    this._lawStorage = new LawStorage(laws);
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
  
  getMatchLawsById(lawSerialNumber:number){
    
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

  static async fetchLawStructureById(apiParams:{apiId:string, lawId:number}) {
    try {
      const url = 'http://www.law.go.kr/DRF/lawService.do';
      const params = {
        OC : apiParams.apiId,
        target: 'lsStmd',
        type: 'XML',
        ID: apiParams.lawId,
      }
      const response = await axios.get(url, { params });
      const result = parseString(response.data, (err, result) => {
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

        //법령트리 생성
        const rootTree = LawTree.CreateEmptyTree();
        rootTree.LawType = "법";
        
        //#region 최상위법 파싱
        //1-1. 최상위법의 정보 가져오기
        const rootHeader = LawHeader.CreateEmptyHeader();
        const lawRootInfo = {
          title : lawRootHeader.법령명[0],
          id : lawRootHeader.법령ID[0],
          startDate : lawRootHeader.시행일자[0],
        }
        rootHeader.Id = lawRootInfo.id,
        rootHeader.LawTitle = lawRootInfo.title,
        rootHeader.StartDate = lawRootInfo.startDate,

        rootTree.LawInfo = rootHeader;
        
        //1-2. 최상위법의 행정규칙 가져오기
        const lawRootHanjung:LawHanjung[] = [];
        const parsedHanjungRules:any[] = lawRoot.행정규칙

        //훈령인 경우
        const lawRootHanjungHun:any[] = parsedHanjungRules[0].훈령;
        if(lawRootHanjungHun){
          lawRootHanjungHun.forEach((item) => {
            const info = item.기본정보[0];
            const header = LawHeader.CreateEmptyHeader();

            header.Id = info.행정규칙ID[0]
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

            header.Id = info.행정규칙ID[0]
            header.LawTitle = info.행정규칙명[0];
            header.StartDate = info.시행일자[0];

            const hanjung = LawHanjung.CreateEmptyHanjung();
            hanjung.LawInfo = header;
            hanjung.RuleType = "고시";
            lawRootHanjung.push(hanjung);
          });
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
          header.Id = info.법령ID[0];
          header.StartDate = info.시행일자[0];
          header.LawTitle = info.법령명[0];
          
          node.LawInfo = header;
          node.ParentLaw = rootTree;
          node.LawType = "법-시행령";
          
          //시행령의 행정규칙 저장
          const decreeRules = new Map<number, ILawHanjung>();
          const rules:any[] = res.행정규칙;
          rules.map((rule) => {
            const ruleHun:any[] = rule.훈령;
            if(ruleHun) {
              const rules = ruleHun.map((item) => {
                const rule = LawHanjung.CreateEmptyHanjung();
                const id = item.행정규칙ID;
                const name = item.행정규칙명;
                const startDate = item.시행일자;

                const header = LawHeader.CreateEmptyHeader();
                header.Id = id;
                header.LawTitle = name;
                header.StartDate = startDate;

                rule.LawInfo = header;
                rule.RuleType = '훈령'
                return rule;
              });

              rules.forEach((rule) => {
                decreeRules.set(rule.LawInfo.Id, rule);
              });
            }

            const ruleGosi:any[] = rule.고시;
            if(ruleGosi) {
              const rules = ruleGosi.map((item) => {
                const rule = LawHanjung.CreateEmptyHanjung();
                const id = item.행정규칙ID;
                const name = item.행정규칙명;
                const startDate = item.시행일자;

                const header = LawHeader.CreateEmptyHeader();
                header.Id = id;
                header.LawTitle = name;
                header.StartDate = startDate;

                rule.LawInfo = header;
                rule.RuleType = '고시'
                return rule;
              });
              rules.forEach((rule) => {
                decreeRules.set(rule.LawInfo.Id, rule);
              });
            }
          });

          //시행령의 시행규칙 저장
          const sihangRule:any[] = res.시행규칙;
          if(sihangRule){
            sihangRule.map((item) => {
              
              //시행규칙 정보 저장
              const law = LawTree.CreateEmptyTree();
              const info = item.기본정보[0];
              const header = LawHeader.CreateEmptyHeader();

              header.Id = info.법령ID[0];
              header.LawTitle = info.법령명[0];
              header.StartDate = info.시행일자[0];

              law.LawInfo = header;
              law.LawType = "법-시행령-시행규칙"
              
              //시행규칙의 행정규칙 등록
              const hanjung:any[] = item.행정규칙;
              if(hanjung){
                hanjung.map((rule) => {
                  const ruleHun:any[] = rule.훈령;
                  if(ruleHun) {
                    const rules = ruleHun.map((item) => {
                      const rule = LawHanjung.CreateEmptyHanjung();
                      const id = item.행정규칙ID;
                      const name = item.행정규칙명;
                      const startDate = item.시행일자;
      
                      const header = LawHeader.CreateEmptyHeader();
                      header.Id = id;
                      header.LawTitle = name;
                      header.StartDate = startDate;
      
                      rule.LawInfo = header;
                      rule.RuleType = '훈령'
                      return rule;
                    });
  
                    rules.forEach((rule) => {
                      law.HanjungRules.set(rule.LawInfo.Id, rule);
                    });
                  }
      
                  const ruleGosi:any[] = rule.고시;
                  if(ruleGosi) {
                    const rules = ruleGosi.map((item) => {
                      const rule = LawHanjung.CreateEmptyHanjung();
                      const id = item.행정규칙ID;
                      const name = item.행정규칙명;
                      const startDate = item.시행일자;
      
                      const header = LawHeader.CreateEmptyHeader();
                      header.Id = id;
                      header.LawTitle = name;
                      header.StartDate = startDate;
      
                      rule.LawInfo = header;
                      rule.RuleType = '고시'
                      return rule;
                    });
  
                    rules.forEach((rule) => {
                      law.HanjungRules.set(rule.LawInfo.Id, rule);
                    });
                  }
                });
              }

              //부모-자식노드 등록;
              law.ParentLaw = node;
              node.ChildLaw.set(law.LawInfo.Id, law);
            });
          }

          //최상위법의 자식법으로 등록
          rootTree.ChildLaw = node.ChildLaw.set(node.LawInfo.Id, node);
        });
        //#endregion
        
        console.log('------시행규칙------')
        const lawRulesInfo = lawRules.map((res) => {
          const header = LawHeader.CreateEmptyHeader();
          const node = LawTree.CreateEmptyTree();
          const info = res.기본정보[0];
          
          //시행규칙의 정보 저장
          header.Id = info.법령ID[0];
          header.StartDate = info.시행일자[0];
          header.LawTitle = info.법령명[0];
          
          node.LawInfo = header;
          node.ParentLaw = rootTree;
          node.LawType = "법-시행규칙";

          node.LawInfo = header;

          //시행규칙의 행정규칙 저장
          const hanjungRules:Map<number, LawHanjung> = new Map<number, LawHanjung>();
          const hanjungs:any[] = res.행정규칙;
          if(hanjungs){
            hanjungs.forEach((item) => {
              const ruleHun:any[] = item.훈령;
              if(ruleHun) {
                ruleHun.forEach((item) => {
                  const rule = LawHanjung.CreateEmptyHanjung();
                  const id = item.행정규칙ID;
                  const name = item.행정규칙명;
                  const startDate = item.시행일자;
  
                  const header = LawHeader.CreateEmptyHeader();
                  header.Id = id;
                  header.LawTitle = name;
                  header.StartDate = startDate;
  
                  rule.LawInfo = header;
                  rule.RuleType = '훈령'
                  hanjungRules.set(id, rule);
                });
              }

              const ruleGosi:any[] = item.고시;
              if(ruleGosi) {
                ruleGosi.forEach((item) => {
                  const rule = LawHanjung.CreateEmptyHanjung();
                  const id = item.행정규칙ID;
                  const name = item.행정규칙명;
                  const startDate = item.시행일자;

                  const header = LawHeader.CreateEmptyHeader();
                  header.Id = id;
                  header.LawTitle = name;
                  header.StartDate = startDate;

                  rule.LawInfo = header;
                  rule.RuleType = '고시'
                  hanjungRules.set(id, rule);
                });
              }
            })            
          }

          node.HanjungRules = hanjungRules;
          
          node.ParentLaw = rootTree;
          rootTree.ChildLaw.set(node.LawInfo.Id, node);
        });

        console.log(rootTree);
      });
    } catch (error) {
      console.log(error)
    }
  }
}

