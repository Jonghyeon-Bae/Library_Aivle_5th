// app/lib/bookApi.ts
import apiClient from './apiClient';
import { bookProps } from '../page';

// 1. 도서 목록 조회 (GET) - Spring Boot 스펙에 맞게 파라미터 보정 및 어댑터 적용
export async function getBooks(page: number, size: number, sort: string) {
  const { data } = await apiClient.get('/api/books', {
    params: { 
      page: page - 1, // Next.js(1) -> Spring Boot(0) 보정
      size, 
      sort 
    },
  });

  // 기존 PocketBase 데이터 구조로 포맷팅하여 반환해줌으로써 기존 page.tsx의 수정 최소화
  return {
    items: (data.content || []) as bookProps[],
    totalPages: Math.ceil((data.totalElements || 0) / size), // 전체 개수로 총 페이지 계산
    totalItems: data.totalElements || 0
  };
}

// 2. 도서 추가 (POST)
export async function createBook(bookData: Omit<bookProps, 'id'>) {
  const { data } = await apiClient.post('/api/books', bookData);
  return data;
}

// 3. 대출 상태 수정 (PUT / PATCH)
// Spring Boot의 BookController는 PATCH /api/books/{id} 로 매핑되어 있습니다.
export async function updateBookStatus(id: string, isAvailable: boolean, borrowerId?: string) {
  const { data } = await apiClient.patch(`/api/books/${id}`, {
    isAvailable,
    borrower_id: borrowerId,
  });
  return data;
}

// 4. 도서 삭제 (DELETE)
export async function deleteBook(id: string) {
  const { data } = await apiClient.delete(`/api/books/${id}`);
  return data;
}

// 5. 도서 상세 조회 (GET)
export async function getBookById(id: string) {
  const { data } = await apiClient.get(`/api/books/${id}`);
  return data;
}

// 6. AI 리뷰 업데이트 (PATCH)
export async function updateBookReview(id: string, aiReview: string) {
  const { data } = await apiClient.patch(`/api/books/${id}`, {
    aiReview,
  });
  return data;
}

// 7. ISBN 중복 체크 (GET)
export async function checkDuplicateIsbn13(isbn13: string) {
  const { data } = await apiClient.get('/api/books/check-isbn', {
    params: { isbn13 },
  });
  return data; // boolean 반환
}

// 8. 최근 검색 기록 조회 (GET)
export async function getSearchHistory(userId: string) {
  const { data } = await apiClient.get('/api/search-history', {
    params: { userId },
  });
  return {
    items: data || [],
  };
}

// 9. 검색 기록 저장 (POST)
export async function createSearchHistory(userId: string, keyword: string) {
  const { data } = await apiClient.post('/api/search-history', {
    userId,
    keyword,
  });
  return data;
}

// 10. 특정 유저가 등록한 도서 조회 (GET)
export async function getBooksByUser(userId: string, page: number, size: number) {
  const { data } = await apiClient.get(`/api/books/user/${userId}`, {
    params: {
      page: page - 1, // Next.js(1) -> Spring Boot(0)
      size,
    },
  });
  return {
    items: (data.content || []) as bookProps[],
    totalPages: Math.ceil((data.totalElements || 0) / size),
    totalItems: data.totalElements || 0
  };
}

// 11. 인기 도서 TOP 10 랭킹 조회 (GET)
export async function getPopularBooks() {
  const { data } = await apiClient.get('/api/books/ranking');
  return data as bookProps[];
}

// 12. AI 도서 표지 저장 (PATCH)
export async function updateBookCover(id: string, coverDataUrl: string) {
  const { data } = await apiClient.patch(`/api/books/${id}/cover`, {
    coverDataUrl,
  });
  return data;
}

