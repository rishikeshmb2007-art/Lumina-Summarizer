import { NextResponse } from 'next/server';

export const maxDuration = 30;

// Polyfill DOMMatrix for PDF.js inside Node.js environment
if (typeof global.DOMMatrix === 'undefined') {
  // @ts-ignore
  global.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(init?: any) {
      if (Array.isArray(init) && init.length === 6) {
        this.a = init[0]; this.b = init[1]; this.c = init[2];
        this.d = init[3]; this.e = init[4]; this.f = init[5];
      }
    }
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const pdfModule = require('pdf-parse');
      const parseFunction = typeof pdfModule === 'function' ? pdfModule : pdfModule.default;

      if (typeof parseFunction !== 'function') {
        throw new Error('Failed to load pdf-parse function parser.');
      }

      // Pass pagerender option to bypass canvas rendering issues on server
      const pdfData = await parseFunction(buffer);
      extractedText = pdfData.text;
    } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      extractedText = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Unsupported file type. Please upload a PDF, TXT, or MD file.' 
      }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No readable text could be extracted from this document.' 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, text: extractedText.trim() });

  } catch (error: any) {
    console.error('File Parsing Server Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server failed to parse file content.' 
    }, { status: 500 });
  }
}