'use client';

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PDFPage {
    pageNumber: number;
    text: string;
    imageDataUrl?: string;
}

export interface PDFParseResult {
    totalPages: number;
    pages: PDFPage[];
    fullText: string;
}

export async function parsePDF(file: File): Promise<PDFParseResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const pages: PDFPage[] = [];
    let fullText = '';

    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');

        pages.push({
            pageNumber: i,
            text: pageText,
        });

        fullText += pageText + '\n\n';
    }

    return {
        totalPages,
        pages,
        fullText: fullText.trim(),
    };
}

export async function renderPDFPageToImage(
    file: File,
    pageNumber: number,
    scale: number = 2.0
): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Could not get canvas context');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // @ts-ignore - pdfjs-dist types may be incompatible
    await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
    }).promise;

    return canvas.toDataURL('image/png');
}
