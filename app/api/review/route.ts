// app/api/review/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 수정_Antigravity_1 보안 및 키 노출 방지를 위해 서버 측에서 GPT-4o-mini 호출 처리
export async function POST(req: Request) {
  try {
    const { title, author, contents, isAdvanced } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      console.error("환경변수 에러: OPENAI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json({ error: 'API 키 누락' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "당신은 도서 큐레이터입니다. 주어진 책 정보를 바탕으로 핵심을 3~4문장으로 요약하고, 독자의 흥미를 유발하는 리뷰를 작성해주세요." },
        { role: "user", content: `책 제목: ${title}\n저자: ${author}\n책 소개: ${contents || '내용 없음'}` }
      ],
      temperature: 0.3,
      top_p: isAdvanced ? 0.8 : 0.5,
      stream: true,
    });

    // OpenAI의 비동기 스트림을 ReadableStream으로 변환하여 Next.js 응답으로 반환
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            controller.enqueue(new TextEncoder().encode(content));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error("AI Review API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate review";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
