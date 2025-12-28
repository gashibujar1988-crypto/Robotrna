
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import PptxGenJS from 'pptxgenjs';

const UPLOADS_DIR = path.join(__dirname, '../public/generated');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const generateExcel = async (filename: string, data: any[][]) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const filePath = path.join(UPLOADS_DIR, `${filename}.xlsx`);
    XLSX.writeFile(wb, filePath);
    return `/generated/${filename}.xlsx`;
};

export const generateWord = async (filename: string, title: string, content: string) => {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: title,
                    heading: HeadingLevel.TITLE,
                }),
                ...content.split('\n\n').map(para => new Paragraph({
                    children: [new TextRun(para)],
                    spacing: { after: 200 }
                }))
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(UPLOADS_DIR, `${filename}.docx`);
    fs.writeFileSync(filePath, buffer);
    return `/generated/${filename}.docx`;
};

export const generatePowerPoint = async (filename: string, title: string, slidesData: { title: string, text: string }[]) => {
    const pptx = new PptxGenJS();

    // Title Slide
    let slide = pptx.addSlide();
    slide.addText(title, { x: 1, y: 1, w: '80%', h: 1, fontSize: 36, align: 'center' });

    // Content Slides
    slidesData.forEach(s => {
        slide = pptx.addSlide();
        slide.addText(s.title, { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 24, bold: true });
        // Split text by newlines for bullet points
        const items = s.text.split('\n').filter(l => l.trim().length > 0);

        // Add text heavily customized
        slide.addText(items.map(item => ({ text: item.trim(), options: { breakLine: true, bullet: true } })), {
            x: 0.5, y: 1.2, w: '90%', h: 4, fontSize: 18
        });
    });

    const filePath = path.join(UPLOADS_DIR, `${filename}.pptx`);
    await pptx.writeFile({ fileName: filePath });
    return `/generated/${filename}.pptx`;
};
