import axios from "axios";
import { parseStringPromise } from 'xml2js';
import { chosungIncludes, getChosung, hangulIncludes } from "es-hangul";

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

