import jsPDF from "jspdf";
import { FontBase64 } from "./fontlib";

export class PDFApi {
    static exportTextChunksAsPdf(content: string): void {
        const doc: jsPDF = new jsPDF("p", "mm", "a4");

        // base64 폰트 데이터를 등록합니다.
        doc.addFileToVFS('malgun.ttf', FontBase64.malgun);
        doc.addFont('malgun.ttf', 'Malgun', 'normal');
        doc.setFont('Malgun'); // 등록된 폰트로 설정합니다.
        doc.setFontSize(10); // 폰트 크기 설정

        // 연속된 줄바꿈을 하나의 줄바꿈으로 대체합니다.
        const cleanedContent: string = content.replace(/\n\s*\n/g, '\n');

        const margin: number = 15;
        const pageHeight: number = doc.internal.pageSize.getHeight();
        const lineHeight: number = 12 * 0.8; // 폰트 크기 * 줄 간격
        const maxLinesPerPage: number = Math.floor((pageHeight - margin * 2) / lineHeight);

        const lines: string[] = doc.splitTextToSize(cleanedContent, doc.internal.pageSize.getWidth() - margin * 2) as string[];

        let cursorY: number = margin;
        lines.forEach((line: string, index: number) => {
            if (index > 0 && index % maxLinesPerPage === 0) {
                doc.addPage();
                cursorY = margin;
            }
            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
        });

        doc.save('web.pdf');
    }
}