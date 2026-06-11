'use client';

import { memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLikeStatus, likeBook, unlikeBook } from '../lib/likeApi';

const LikeButton = memo(function LikeButton({ 
  bookId, 
  initialLikeCount,
  currentUser,
  onRequireLogin
}: { 
  bookId: string; 
  initialLikeCount: number;
  currentUser: any;
  onRequireLogin?: () => void;
}) {
  const queryClient = useQueryClient();

  // 1. 현재 도서의 좋아요 상태(여부 및 전체 개수) 통합 조회
  const { data: likeStatus, refetch: refetchLikeStatus } = useQuery({
    queryKey: ['likeStatus', bookId, currentUser?.id],
    queryFn: () => getLikeStatus(bookId),
    enabled: !!bookId,
  });

  const isLiked = likeStatus?.liked ?? false;
  const currentLikeCount = likeStatus?.likeCount ?? initialLikeCount ?? 0;

  // 2. 좋아요 토글 뮤테이션
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('로그인이 필요합니다.');
      if (isLiked) {
        return await unlikeBook(bookId);
      } else {
        return await likeBook(bookId);
      }
    },
    onMutate: async () => {
      // Optimistic update (UI 즉시 반응)
      await queryClient.cancelQueries({ queryKey: ['likeStatus', bookId, currentUser?.id] });
      const previousLikeStatus = queryClient.getQueryData(['likeStatus', bookId, currentUser?.id]);

      queryClient.setQueryData(['likeStatus', bookId, currentUser?.id], (old: any) => {
        if (!old) return { liked: !isLiked, likeCount: isLiked ? currentLikeCount - 1 : currentLikeCount + 1 };
        return {
          liked: !old.liked,
          likeCount: old.liked ? old.likeCount - 1 : old.likeCount + 1,
        };
      });

      return { previousLikeStatus };
    },
    onSuccess: () => {
      // 쿼리 갱신 및 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['allLikeCounts'] });
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
      refetchLikeStatus();
    },
    onError: (error: any, variables, context: any) => {
      console.error('좋아요 에러:', error?.message || error);
      // 에러 발생 시 롤백
      if (context?.previousLikeStatus !== undefined) {
        queryClient.setQueryData(['likeStatus', bookId, currentUser?.id], context.previousLikeStatus);
      }
    },
  });

  return (
    <button 
      onClick={() => {
        if (!currentUser) {
          if (onRequireLogin) onRequireLogin();
          else alert('로그인 후 이용 가능합니다.');
          return;
        }
        if (toggleLikeMutation.isPending) return;
        toggleLikeMutation.mutate();
      }}
      disabled={toggleLikeMutation.isPending}
      className={`mt-4 w-full py-2 cursor-pointer rounded-lg font-bold text-sm transition-colors ${
        isLiked 
          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      } ${toggleLikeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLiked ? '♥' : '♡'} {currentLikeCount} 
    </button>
  );
});

export default LikeButton;