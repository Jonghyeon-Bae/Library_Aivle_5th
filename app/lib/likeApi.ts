// app/lib/likeApi.ts
import apiClient from './apiClient';

// 1. 좋아요 상태 조회 (여부 및 총 개수)
export async function getLikeStatus(bookId: string) {
  const { data } = await apiClient.get(`/api/books/${bookId}/like`);
  return data; // { liked: boolean, likeCount: number }
}

// 2. 좋아요 추가
export async function likeBook(bookId: string) {
  const { data } = await apiClient.post(`/api/books/${bookId}/like`);
  return data;
}

// 3. 좋아요 취소
export async function unlikeBook(bookId: string) {
  const { data } = await apiClient.delete(`/api/books/${bookId}/like`);
  return data;
}
