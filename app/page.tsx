'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddBookModal from './components/AddBookModal';
import DashboardChart from './components/DashboardChart';
import LoginModal from './login/LoginModal';
import RegisterModal from './register/RegisterModal';
import { LogIn, UserPlus, LogOut, User } from 'lucide-react';
import RankingSidebar from './components/RankingSidebar';
import Link from 'next/link';
import IllegalBanners from './components/IllegalBanners';
import BookDetailView from './components/BookDetailView';
import BookListView from './components/BookListView';
import ManualAddBookModal from './components/ManualAddBookModal';
import { getBooks, deleteBook, updateBookStatus } from './lib/bookApi';


// 수정_최승헌_5-2 bookProps 업데이트 (ai_review, user_id, created, updated 필드 추가)
export interface bookProps{
  id:string
  title?:string
  contents?:string /*kakao api와 동일 이름 사용  */
  author?:string 
  publisher?:string   // Stinrg or Undefined 
  thumbnail?:string
  cover?:string
  isAvailable?:boolean
  borrower_id?: string;
  bestbook?:boolean
  like_count?:number
  ai_review?:string
  user_id?:string
  created?:string
  updated?:string
  isbn13?:string
}

export default function Home() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>('-created');

  // 
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // 인증 관련 상태
  const [user, setUser] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState<bookProps | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

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
        }
      }
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    alert('로그아웃되었습니다.');
  }, []);

  // 1. 도서 목록 조회 (Read)
  const { data, isPending } = useQuery({
    queryKey: ['books', sortOption, page],
    queryFn: () =>
      getBooks(page,perPage,sortOption)
      // Pocketbase Mode:
      // pb.collection('books').getList(page, perPage, {
      //   sort: sortOption,
      // }),
  });

  const books = useMemo(() => {
    return (data?.items ?? []) as unknown as bookProps[];
  }, [data?.items]);
  const totalPages = data?.totalPages ?? 1;

  // 목록은 페이지네이션 데이터, 대시보드는 전체 통계 데이터가 필요해서 분리
  const { data: dashboardBooks } = useQuery({
    queryKey: ['books-dashboard'],
    queryFn: () => getBooks(1, 1000, '-created').then(res => res.items),
  });

  // 최적화_useMemo로 allBooks 메모이제이션: DashboardChart의 memo 효과 극대화
  // 수정_종현_1 RankingSidebar는 내부에서 getFullList로 직접 조회하므로 여기서 전달하지 않음
  const allBooks = useMemo(() => {
    return (dashboardBooks ?? []) as unknown as bookProps[];
  }, [dashboardBooks]);

  // 최적화_useMemo를 이용한 페이지네이션 번호 계산 메모이제이션
  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    // 현재 페이지 중심 앞뒤로 3페이지씩 보여주기
    const startPage = Math.max(1, page - 3);
    const endPage = Math.min(totalPages, page + 3);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [page, totalPages]);

  // 2. 도서 삭제 (Delete)
  const deleteMutation = useMutation({
    mutationFn: (id:string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books-dashboard'] });
    },
  });

  // 3. 대출 상태 토글 (Update)
  
  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable, borrower_id } : {id:string,isAvailable?:boolean,borrower_id?:string}) =>
      updateBookStatus(id, !isAvailable, borrower_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books-dashboard'] });

      // 상세 페이지에서 대출 상태 변경 시 selectedBook도 즉시 반영
      setSelectedBook((prev) => {
        if (!prev || prev.id !== variables.id) {
          return prev;
        }

        return {
          ...prev,
          isAvailable: !variables.isAvailable,
          borrower_id: variables.borrower_id,
        };
      });
    },
  });

  // 수정_최승헌_5-3 메인 페이지 다크 테마 배경 및 레이아웃 구조 수정
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
          {/* 광고 2: AIVLE 스쿨 9기 */}
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

        {/* 헤더 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-100/10">
          
          <Link href="/" className=" items-center gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-bounce">📚 5조의 도서관<span className='text-red-300'></span></h1>
            <p className="animate-shine font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-red-500 to-slate-400  mt-2">그들의 취미생활....</p>
          </div>
          </Link>

          {/* Buttons / Auth Section */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {isHydrated && user ? (
              <>
                <span className="text-sm font-semibold text-slate-200 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center">
                  {user.name || user.email}
                </span>
                <Link
                  href="/me"
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-md transition-colors"
                >
                  <User size={16} />
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-md transition-colors"
                >
                  <LogOut size={16} />
                  로그아웃
                </button>
              </>
            ) : (
              isHydrated && (
                <>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="cursor-pointer flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-md transition-colors"
                  >
                    <UserPlus size={16} />
                    회원가입
                  </button>

                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="cursor-pointer flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-md transition-colors"
                  >
                    <LogIn size={16} />
                    로그인
                  </button>

                </>
              )
            )}

            <button 
              onClick={() => setIsModalOpen(true)} 
              className="cursor-pointer px-6 py-2 rounded-lg font-bold text-white shadow-lg animate-rapid-blink"
            >
              Search!
            </button>
            <button 
              onClick={() => setIsManualModalOpen(true)} 
              className="cursor-pointer px-6 py-2 rounded-lg font-bold text-white shadow-lg animate-rapid-blink"
            >
              CreatorMode!
            </button>
          </div>
        </div>

        {/* 대시보드 차트 (전체 데이터 기준) */}
        <DashboardChart books={allBooks} />

        {/* 모바일용 불법 배너 광고 보드 — 추가_최승헌_불법배너 */}
        <div className="xl:hidden my-6 z-50 relative">
          <IllegalBanners />
        </div>
      
        {/* 로딩 상태 */}
        {isPending && <p className="text-center py-10 text-gray-500 text-lg">책장을 불러오는 중입니다... 🔄</p>}

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
          <BookListView
            books={books}
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

        {/* 등록 모달 */}
        <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentUser={user} />
        {/* 수동 등록 모달 */}
        <ManualAddBookModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} currentUser={user} />

        {/* 로그인 모달 */}
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onRegisterClick={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            queryClient.invalidateQueries({ queryKey: ['allLikeCounts'] });
          }}
        />

        {/* 회원가입 모달 */}
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onLoginClick={() => {
            setIsRegisterOpen(false);
            setIsLoginOpen(true);
          }}
          onRegisterSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            queryClient.invalidateQueries({ queryKey: ['allLikeCounts'] });
          }}
        />
      </div>

      {/* 좌측 플로팅 랭킹 사이드바 — 수정_종현_1 books prop 제거, 내부 getFullList 조회 */}
      <RankingSidebar onBookSelect={setSelectedBook} />

      {/* 우측 플로팅 불법 배너 광고 — 추가_최승헌_불법배너 */}
      <aside className="hidden xl:block fixed top-32 right-8 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-lg p-5 hover:shadow-xl hover:border-slate-700/50 z-30 transition-all duration-300">
        <IllegalBanners />
      </aside>
    </main>
  );
}
