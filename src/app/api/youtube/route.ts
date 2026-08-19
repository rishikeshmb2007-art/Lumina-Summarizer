import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Please provide a valid YouTube URL.' }, { status: 400 });
    }

    // Extract Video ID or handle full URL
    const transcriptItems = await YoutubeTranscript.fetchTranscript(url);

    if (!transcriptItems || transcriptItems.length === 0) {
      return NextResponse.json({ success: false, error: 'No captions/transcript found for this YouTube video.' }, { status: 404 });
    }

    // Combine transcript array into clean text block
    const fullTranscript = transcriptItems.map((item) => item.text).join(' ');

    return NextResponse.json({ success: true, text: fullTranscript });
  } catch (error: any) {
    console.error('YouTube Transcript Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to extract YouTube transcript. Ensure the video has public subtitles/captions enabled.'
    }, { status: 500 });
  }
}