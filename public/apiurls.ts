/**
 * @constant
 * @type {Object}
 * @property {string} lawList - 현행 법령 목록 조회
 * @property {string} lawBody - 현행 법령 본문 조회
 */
export const ApiUrls = {
    lawList : "http://www.law.go.kr/DRF/lawSearch.do",
    lawBody : "http://www.law.go.kr/DRF/lawService.do",
} as const;

