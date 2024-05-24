import axios from "axios";
import { ApiUrls } from '../../public/apiurls';
import { parseStringPromise } from 'xml2js';

export interface Law {
    lawSerialNumber: string;
    currentHistoryCode: string;
    lawNameKorean: string;
    lawAbbreviation: string;
    enforcementDate: string;
}

export interface LawSearchResult {
    totalCnt: number;
    laws: Law[];
}

export class APIs {
    static parseLawFromXML(serializedXML:string){

    }

    /**
     * 법률명 리스트를 가져오기위한 함수
     * @param params OC, target, type은 제외한 나머지 파라미터를 추가해주세요.
     * @returns 
     */
    static async fetchLawList(id:string, page: number, numOfRows: number = 100): Promise<LawSearchResult> {
        try {
          const url = 'https://api.example.com/lawList'; // 실제 URL로 변경
          const params = {
            OC: id,
            target: 'law',
            type: 'XML',
            page,
            numOfRows
          };
    
          const response = await axios.get(url, { params });
          const result = await parseStringPromise(response.data, { explicitArray: false });
    
          const totalCnt = parseInt(result.LawSearch.totalCnt, 10);
          const laws = result.LawSearch.law.map((law: any) => ({
            lawSerialNumber: law.법령일련번호,
            currentHistoryCode: law.현행연혁코드,
            lawNameKorean: law.법령명한글._,
            lawAbbreviation: law.법령약칭명._,
            enforcementDate: law.시행일자
          }));
    
          return { totalCnt, laws };
        } catch (error) {
          console.error('법률 리스트를 받는 도중 오류가 발생했습니다. :', error);
          throw error;
        }
    }

    /**
     * 법률명 리스트를 전부 가져오기위한 함수
     * @returns 법률들
     */
    static async fetchAllLaws(id:string): Promise<Law[]> {
        // 최초 호출로 totalCnt 값을 얻음
        const firstPageResult = await APIs.fetchLawList(id, 1, 20);
        const totalCount = firstPageResult.totalCnt;
        const totalPages = Math.ceil(totalCount / 100);
    
        let allLaws: Law[] = firstPageResult.laws;
    
        // 2페이지부터 나머지 페이지까지 요청
        for (let page = 2; page <= totalPages; page++) {
          const result = await APIs.fetchLawList(id, page, 100);
          allLaws = allLaws.concat(result.laws);
        }
    
        return allLaws;
    }
}