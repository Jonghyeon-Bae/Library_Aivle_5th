import axios from "axios";
import { NextResponse } from "next/server";

const ALADIN_TTB_KEY = process.env.ALADIN_TTB_KEY;
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    try {
        // 수정_Antigravity_1 TLS 연결 문제 해결을 위해 HTTPS 대신 HTTP 사용
        const res = await axios.get(
            "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx",
            {
                params: {
                    ttbkey: ALADIN_TTB_KEY,
                    Query: query,
                    QueryType: "Title",
                    MaxResults: 10,
                    start: 1,
                    SearchTarget: "Book",
                    output: "js",
                    Version: "20131101",
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            }
        );
        let data = res.data;
        if (typeof data === 'string') {
            data = JSON.parse(data.replace(/;$/, ""));
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Aladin Search API error:", err);
        return NextResponse.json({ message: "Aladin Search API error" }, { status: 500 });
    }
}
export async function POST(req: Request) {
    try {
        const { isbn13 } = await req.json();

        if (!isbn13) {
            return NextResponse.json({ isRecommended: false, salesPoint: 0, customerReviewRank: 0 });
        }

        // 알라딘 상품 조회(ItemLookUp) API 호출
        // 수정_Antigravity_2 TLS 연결 문제 해결을 위해 HTTPS 대신 HTTP 사용
        const res = await axios.get(
            "http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx",
            {
                params: {
                    ttbkey: ALADIN_TTB_KEY,
                    itemIdType: "ISBN13", // ISBN13 기준으로 조회
                    ItemId: isbn13,
                    output: "js",
                    Version: "20131101",
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            }
        );

        let data = res.data;
        if (typeof data === 'string') {
            data = JSON.parse(data.replace(/;$/, ""));
        }

        // 조회된 상품 정보가 없는 경우 방어 코드
        if (!data.item || data.item.length === 0) {
            return NextResponse.json({ isRecommended: false, salesPoint: 0, customerReviewRank: 0 });
        }

        const bookDetail = data.item[0];
        const customerReviewRank = bookDetail.customerReviewRank || 0; // 고객 평점 (10점 만점)
        const salesPoint = bookDetail.salesPoint || 0;                 // 세일즈 포인트
        const description = bookDetail.description || "";

        // 🏆 [자동 추천 판별 시스템 기준] 
        // 리뷰 평점이 8.5점 이상이거나 판매 지수가 15,000점 이상일 때 강추 도서로 판별
        const isRecommended = customerReviewRank >= 8.5 || salesPoint >= 15000;

        return NextResponse.json({
            isRecommended,
            customerReviewRank,
            salesPoint,
            categoryName: bookDetail.categoryName || "미분류",
            description
        });

    } catch (err) {
        console.error("Aladin LookUp API error:", err);
        return NextResponse.json({ isRecommended: false, salesPoint: 0, customerReviewRank: 0 }, { status: 500 });
    }
}