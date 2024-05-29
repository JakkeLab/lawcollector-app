import jsPDF from "jspdf";
import { FontBase64 } from "./fontlib";

export class PDFApi {
    // static exportTextChunksAsPdf(content: string): void {
    //     const doc: jsPDF = new jsPDF("p", "mm", "a4");

    //     // base64 폰트 데이터를 등록합니다.
    //     doc.addFileToVFS('malgun.ttf', FontBase64.malgun);
    //     doc.addFont('malgun.ttf', 'Malgun', 'normal');
    //     doc.setFont('Malgun'); // 등록된 폰트로 설정합니다.
    //     doc.setFontSize(10); // 폰트 크기 설정

    //     // 연속된 줄바꿈을 하나의 줄바꿈으로 대체합니다.
    //     const cleanedContent: string = content.replace(/\n\s*\n/g, '\n');

    //     const margin: number = 15;
    //     const pageHeight: number = doc.internal.pageSize.getHeight();
    //     const lineHeight: number = 12 * 0.8; // 폰트 크기 * 줄 간격
    //     const maxLinesPerPage: number = Math.floor((pageHeight - margin * 2) / lineHeight);

    //     const lines: string[] = doc.splitTextToSize(cleanedContent, doc.internal.pageSize.getWidth() - margin * 2) as string[];

    //     let cursorY: number = margin;
    //     lines.forEach((line: string, index: number) => {
    //         if (index > 0 && index % maxLinesPerPage === 0) {
    //             doc.addPage();
    //             cursorY = margin;
    //         }
    //         doc.text(line, margin, cursorY);
    //         cursorY += lineHeight;
    //     });

    //     doc.save('web.pdf');
    // }


    /**
     * 법령 본문을 Blob 형태로 생성합니다.
     * @param lawContent
     * @returns Blob
     */
    static async generatePdfBlob(lawContent: {
        rootLawName: string;
        subContents: {
            title: string;
            content: string;
        }[];
    }): Promise<Blob> {
        console.log(lawContent);
        const doc: jsPDF = new jsPDF("p", "mm", "a4");

        // base64 폰트 데이터를 등록합니다.
        doc.addFileToVFS('malgun.ttf', FontBase64.malgun);
        doc.addFont('malgun.ttf', 'Malgun', 'normal');
        doc.setFont('Malgun'); // 등록된 폰트로 설정합니다.

        const margin: number = 15;
        const pageHeight: number = doc.internal.pageSize.getHeight();
        const contentWidth: number = doc.internal.pageSize.getWidth() - margin * 2;
        const lineHeight: number = 12 * 1.2; // 폰트 크기 * 줄 간격

        lawContent.subContents.forEach((content) => {
            const cleanedTitle: string = content.title.replace(/\n\s*\n/g, '\n');
            const cleanedContent: string = content.content.replace(/\n\s*\n/g, '\n');

            // 각 문서 시작 시 페이지 추가 (첫 페이지 제외)
            if (doc.internal.pages.length > 1) {
                doc.addPage();
            }

            // 제목 추가
            doc.setFontSize(14); // 제목 폰트 크기
            const titleLines: string[] = doc.splitTextToSize(cleanedTitle, contentWidth) as string[];
            let cursorY: number = margin;
            titleLines.forEach((line: string) => {
                doc.text(line, margin, cursorY);
                cursorY += lineHeight;
            });

            // 본문 추가
            doc.setFontSize(10); // 본문 폰트 크기
            const contentLines: string[] = doc.splitTextToSize(cleanedContent, contentWidth) as string[];
            contentLines.forEach((line: string, index: number) => {
                if (cursorY + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    cursorY = margin;
                }
                doc.text(line, margin, cursorY);
                cursorY += lineHeight;
            });
        });

        const blob = doc.output('blob');
        return blob;
    }
}