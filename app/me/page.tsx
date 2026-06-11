'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooksByUser, deleteBook, updateBookStatus } from '../lib/bookApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Mail, Calendar, User } from 'lucide-react';
import BookDetailView from '../components/BookDetailView';
import BookListView from '../components/BookListView';
import { bookProps } from '../page';
import IllegalBanners from '../components/IllegalBanners';
import RankingSidebar from '../components/RankingSidebar';
import UpdateProfileModal from '../components/UpdateProfileModal';

export default function MyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedBook, setSelectedBook] = useState<bookProps | null>(null);
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState<string>('-created');
  const perPage = 8;
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          alert('로그인이 필요합니다.');
          router.push('/');
        }
      }
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  // 내가 등록한 도서 — 페이지네이션 적용
  const { data, isPending } = useQuery({
    queryKey: ['myBooks', user?.id, sortOption, page],
    queryFn: () => getBooksByUser(user.id, page, perPage),
    enabled: !!user?.id,
  });

  const myBooks = useMemo(() => {
    return (data?.items ?? []) as unknown as bookProps[];
  }, [data?.items]);
  const totalPages = data?.totalPages ?? 1;

  // 통계 카드용 전체 목록 (페이지네이션과 별도)
  const { data: myBooksAll } = useQuery<bookProps[]>({
    queryKey: ['myBooks-stats', user?.id],
    queryFn: () => getBooksByUser(user.id, 1, 1000).then(res => res.items),
    enabled: !!user?.id,
  });

  // 도서 삭제
  // 수정_종현_04 도서 삭제 결과(성공/실패)에 대한 안내 메시지 보완
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      alert('도서가 성공적으로 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
      queryClient.invalidateQueries({ queryKey: ['myBooks-stats'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books-dashboard'] });
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message;
      if (errMsg === 'You do not have permission to modify or delete this resource.') {
        alert('도서를 등록한 본인만 삭제할 수 있습니다.');
      } else {
        alert(errMsg || '도서 삭제 중 오류가 발생했습니다.');
      }
    }
  });

  // 대출 상태 토글 — 메인 페이지와 동일하게 borrower_id 지원
  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable, borrower_id }: { id: string; isAvailable?: boolean; borrower_id?: string }) =>
      updateBookStatus(id, !isAvailable, borrower_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myBooks'] });
      queryClient.invalidateQueries({ queryKey: ['myBooks-stats'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books-dashboard'] });

      // 상세 페이지에서 대출 상태 변경 시 selectedBook도 즉시 반영
      setSelectedBook((prev) => {
        if (!prev || prev.id !== variables.id) return prev;
        return {
          ...prev,
          isAvailable: !variables.isAvailable,
          borrower_id: variables.borrower_id,
        };
      });
    },
  });

  // 페이지네이션 번호 계산
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const startPage = Math.max(1, page - 3);
    const endPage = Math.min(totalPages, page + 3);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  if (!isHydrated || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400 text-lg">로딩 중...</p>
      </main>
    );
  }

  const joinDate = (user.created || user.createdAt)
    ? new Date(user.created || user.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '알 수 없음';

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100">
      {/* 5조 전광판 무한 마키 롤링 배너 — 추가_최승헌_불법배너 */}
      <div className="w-full bg-slate-950 border-y border-purple-500/30 overflow-hidden py-2 select-none relative mb-6 rounded-lg">
        <div className="flex w-max animate-marquee text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-cyan-400 gap-8 py-1">
          <span className="shrink-0 whitespace-nowrap py-0.5">★★★ 5조 도서관 전격 리뉴얼 오픈!  ★★ 1차 에이블데이 1위 장천명 베스트셀러 독점 입고 완료! &apos;코딩? 흠 그정둔가..&apos;  ★★ 연체 시 밤길 조심 사서의 분노 폭발!  ★★ AICE 자격시험 응시료 전액 지원 신청 접수 중!  ★★ 100% 안전한 도서대출 보증! ★★★</span>
          <span className="shrink-0 whitespace-nowrap py-0.5">★★★ 5조 도서관 전격 리뉴얼 오픈!  ★★ 1차 에이블데이 1위 장천명 베스트셀러 독점 입고 완료! &apos;코딩? 흠 그정둔가..&apos;  ★★ 연체 시 밤길 조심 사서의 분노 폭발!  ★★ AICE 자격시험 응시료 전액 지원 신청 접수 중!  ★★ 100% 안전한 도서대출 보증! ★★★</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        {/* 최상단 B급 띠 광고 영역 — 추가_최승헌_불법배너 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {/* 광고 1: 2차 에이블데이 */}
          <div 
            onClick={() => alert('🏆 [2차 에이블데이] 에이블러의 열정을 보여줄 기회! 9기 5조 1등 기원! 대박 기원!')}
            className="cursor-pointer p-2.5 rounded-lg border-2 border-red-500 animate-rapid-blink text-center text-xs font-black text-yellow-300 select-none shadow-md flex items-center justify-center gap-1.5"
          >
            <span className="bg-yellow-400 text-black px-1.5 py-0.5 rounded text-[9px] animate-bounce shrink-0">대박개최</span>
            🏆 [속보] KT AIVLE 9기 2차 에이블데이 곧 개최! &apos;5조, 이번엔 진짜 1등 먹튀간다!&apos; 🚀
          </div>
          {/* 광고 2: AIVLE 스쿨 10기 */}
          <a 
            href="https://aivle.kt.co.kr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg border-2 border-[#ff007f] bg-black text-[#00f0ff] animate-neon-border text-center text-xs font-bold select-none shadow-md flex items-center justify-center gap-1.5 hover:underline"
          >
            <span className="bg-[#ff007f] text-white px-1.5 py-0.5 rounded text-[9px] shrink-0">공식모집</span>
            🤖 KT AIVLE 스쿨 10기 전격 모집 준비중! 100% 국비 전액 무료 ➔ 즉시 지원하기 🤖
          </a>
        </div>

        {/* 상단 네비게이션 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          홈으로 돌아가기
        </Link>

        {/* 프로필 카드 영역 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-[1px] mb-10 shadow-xl shadow-indigo-900/50">
          <div className="rounded-2xl bg-slate-900/95 backdrop-blur-sm p-8 border border-slate-800/50">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* 아바타 */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/30 shrink-0">
                {(user.name || user.email || '?')[0].toUpperCase()}
              </div>

              {/* 유저 정보 */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold text-white mb-1">
                  {user.name || '이름 미설정'}
                </h1>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-400" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-400" />
                    {joinDate} 가입
                  </span>
                </div>
                {/* 추가_최승헌_5-5 개인정보 변경 버튼 */}
                <button
                  onClick={() => setIsUpdateProfileOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-1.5 rounded-lg text-xs border border-slate-700 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <User size={12} className="text-indigo-400" />
                  개인정보 변경
                </button>
              </div>

              {/* 통계 카드 */}
              <div className="flex gap-4 shrink-0">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-6 py-4 text-center">
                  <p className="text-3xl font-extrabold text-indigo-400">{myBooksAll?.length ?? '—'}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">등록한 도서</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-6 py-4 text-center">
                  <p className="text-3xl font-extrabold text-green-400">
                    {myBooksAll?.filter((b) => b.isAvailable).length ?? '—'}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">대출 가능</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일용 불법 배너 광고 보드 — 추가_최승헌_불법배너 */}
        <div className="xl:hidden my-6 z-50 relative">
          <IllegalBanners />
        </div>

        {/* 섹션 타이틀 */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={22} className="text-indigo-400" />
          <h2 className="text-xl font-bold text-slate-200">내가 등록한 도서</h2>
        </div>

        {/* 로딩 */}
        {isPending && (
          <p className="text-center py-16 text-slate-400 text-lg">도서 목록을 불러오는 중... 🔄</p>
        )}

        {/* 빈 상태 */}
        {!isPending && (data?.totalItems ?? 0) === 0 && (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 mb-6 border border-slate-800">
              <BookOpen size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">아직 등록한 도서가 없습니다</h3>
            <p className="text-sm text-slate-500 mb-6">메인 화면에서 도서를 검색하고 등록해 보세요!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg text-sm shadow-md transition-colors"
            >
              도서 등록하러 가기
            </Link>
          </div>
        )}

        {/* 도서 상세 보기 — 메인과 동일한 BookDetailView 사용 */}
        {selectedBook ? (
          <BookDetailView
            selectedBook={selectedBook}
            onBack={() => setSelectedBook(null)}
            toggleMutation={toggleMutation}
            deleteMutation={deleteMutation}
            onDelete={() => setSelectedBook(null)}
            onUpdateBook={setSelectedBook}
            currentUser={user}
          />
        ) : (
          /* 도서 목록 — 메인과 동일한 BookListView + 페이지네이션 */
          <BookListView
            books={myBooks}
            totalPages={totalPages}
            page={page}
            visiblePages={visiblePages}
            sortOption={sortOption}
            setPressSetSelectedBook={setSelectedBook}
            setSortOption={setSortOption}
            setPage={setPage}
            deleteMutation={deleteMutation}
            currentUser={user}
          />
        )}
      </div>

      {/* 좌측 플로팅 랭킹 사이드바 — 공용 적용 */}
      <RankingSidebar onBookSelect={setSelectedBook} />

      {/* 우측 플로팅 불법 배너 광고 — 공용 적용 */}
      <aside className="hidden xl:block fixed top-32 right-8 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-lg p-5 hover:shadow-xl hover:border-slate-700/50 z-30 transition-all duration-300">
        <IllegalBanners />
      </aside>

      {/* 개인정보 변경 모달 */}
      <UpdateProfileModal
        isOpen={isUpdateProfileOpen}
        onClose={() => setIsUpdateProfileOpen(false)}
        currentUser={user}
        onUpdateSuccess={(updatedUser) => {
          setUser(updatedUser);
        }}
      />
    </main>
  );
}
