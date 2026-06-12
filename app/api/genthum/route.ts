import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// OpenAI DALL-E 이미지 생성 API 라우트 추가
export async function POST(request: Request) {
  try {
    const { prompt, bookId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 수정_종현 bookId가 없으면 임시 UUID를 파일명으로 사용 (수동 등록 시 아직 DB 레코드가 없음)
    const fileId = bookId || randomUUID();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY가 환경 변수(.env)에 설정되어 있지 않습니다.' }, { status: 500 });
    }

    // 1. OpenAI API 호출 (gpt-image-2)
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'gpt-image-2',
        prompt: prompt,
        n: 1,
        size: '1024x1536',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const imageData = response.data?.data?.[0];
    if (!imageData) {
      return NextResponse.json({ error: 'OpenAI로부터 이미지를 생성하지 못했습니다.' }, { status: 500 });
    }

    // 2. 이미지 데이터 추출 (Base64가 있으면 즉시 버퍼로 변환, 없으면 URL 다운로드)
    let buffer: Buffer;
    if (imageData.b64_json) {
      buffer = Buffer.from(imageData.b64_json, 'base64');
    } else if (imageData.url) {
      const imageResponse = await axios.get(imageData.url, { responseType: 'arraybuffer' });
      buffer = Buffer.from(imageResponse.data);
    } else {
      return NextResponse.json({ error: '생성된 이미지 데이터 형식을 찾을 수 없습니다.' }, { status: 500 });
    }

    // Render 배포 환경(휘발성 디스크)에서도 유실되지 않도록 이미지를 Base64 Data URL로 변환하여 반환
    const base64Url = `data:image/png;base64,${buffer.toString('base64')}`;

    return NextResponse.json({ url: base64Url });
  } catch (error: unknown) {
    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    if (axios.isAxiosError(error)) {
      console.error('OpenAI 이미지 생성 오류:', error.response?.data || error.message);
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      console.error('이미지 처리 오류:', error.message);
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: `AI 이미지 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
