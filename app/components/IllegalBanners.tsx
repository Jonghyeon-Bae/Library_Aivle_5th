'use client';

import { useState } from 'react';
import { ShieldAlert, Percent, Flame, Sparkles, HelpCircle, Coffee, GraduationCap, Award, BookOpen } from 'lucide-react';

interface BannerProps {
  id: number;
  title: string;
  badge: string;
  description: string;
  alertMsg: string;
  styleType: 'neon' | 'rainbow' | 'blink' | 'crazy';
  icon: React.ReactNode;
  url?: string;
}

export default function IllegalBanners() {
  // 수정_최승헌_5-4 static 배너 데이터를 useState의 초기값으로 설정하여 useEffect 내의 setState 린트 오류 해결
  const [banners] = useState<BannerProps[]>([
    {
      id: 5,
      title: '🤖 KT AIVLE 9기 코딩 노예 모집',
      badge: '수당지급',
      description: '하루 8시간 코딩 지옥! 6개월 뒤 당신도 AI 마스터!',
      alertMsg: '🤖 [KT 에이블스쿨 9기] "너두 코딩할 수 있어!" AI/DX 트랙 지옥행 열차에 탑승하기 위해 공식 홈페이지로 이동합니다! 🚀',
      styleType: 'neon',
      icon: <Sparkles size={16} />,
      url: 'https://aivle.kt.co.kr',
    },
    {
      id: 8,
      title: '🎯 AICE 자격시험 응시료 100% 지원!',
      badge: '전액공짜',
      description: '에이블러 특권! 실패해도 부담 없는 AICE 무료 응시 찬스!',
      alertMsg: '🎯 [AICE 시험 혜택] 에이블스쿨이 당신의 AICE 응시료를 전액 지원합니다! 시험 정보 페이지로 이동합니다!',
      styleType: 'rainbow',
      icon: <GraduationCap size={16} className="animate-pulse" />,
      url: 'https://aice.study',
    },
    {
      id: 10,
      title: '🛌 [DX전용] 꿀잼(?) 강의 무료 체험',
      badge: '졸음퇴치',
      description: '듣기만 해도 잠이 확 달아나는 리얼 DX 프로젝트 트레이닝!',
      alertMsg: '🛌 [DX 실습실] 졸음 방지 시스템 가동! 강사님의 레이저 눈빛이 당신을 응시합니다. 자면 코딩 테스트 100줄 추가!',
      styleType: 'rainbow',
      icon: <BookOpen size={16} />,
    },
    {
      id: 7,
      title: '🏆 [경사] 5조 에이블러, 코딩 왕 등극',
      badge: '전원수료',
      description: '프로젝트 우수 조 선정! 1등 먹튀 없는 청정 도서관!',
      alertMsg: '🏆 [5조 도서관 전원 취업 기원] 에이블스쿨 9기 동기님들 파이팅! 코딩왕은 바로 당신!',
      styleType: 'crazy',
      icon: <Sparkles size={16} className="animate-bounce" />,
    },
    {
      id: 9,
      title: '📘 장천명의 "코딩? 흠 그정둔가.."',
      badge: '에이블데이1위',
      description: '1차 에이블데이 우승자 장천명의 극비 코딩 기술 수록!',
      alertMsg: '📘 [베스트셀러 독점] "장천명의 코딩? 흠 그정둔가.." - "이 책을 읽고 저도 9기 에이블데이를 제패했습니다." (도서관 특별 한정판)',
      styleType: 'crazy',
      icon: <Award size={16} className="animate-bounce" />,
    },
    {
      id: 14,
      title: '📘 장문경의 "백엔드? ㅎ 못해?"',
      badge: '에이블데이2위',
      description: '백엔드 전공자 장문경의 백엔드 개론 수록!',
      alertMsg: '📘 [베스트셀러 독점] "장문경의 백엔드? ㅎ 못해?" - "이 책을 읽고 저도 5차 미니프로젝트에서 백엔드를 완성했습니다." (도서관 특별 한정판)',
      styleType: 'crazy',
      icon: <Award size={16} className="animate-bounce" />,
    },
    {
      id: 6,
      title: '☕ 에이블러 필수! 생존 포션 판매',
      badge: '카페인100%',
      description: '아침 9시 정각을 견디는 마법의 음료! 즉시 충전!',
      alertMsg: '☕ 에이블러 전용 아메리카노 수혈 완료! 졸음 퇴치 버프가 부여되었습니다. (남은 수업: 8시간)',
      styleType: 'blink',
      icon: <Coffee size={16} className="animate-pulse" />,
    },
    {
      id: 2,
      title: '💸 [긴급] 무서류 당일 책 대출',
      badge: '신용무관',
      description: '연체 시 사서의 새벽 방문 독촉 서비스 제공!',
      alertMsg: '💸 대출 한도가 조회되었습니다. [신용등급: 독서 우수자] 지금 당장 책 빌리러 가세요!',
      styleType: 'neon',
      icon: <ShieldAlert size={16} className="animate-pulse" />,
    },
    {
      id: 1,
      title: '5조 보증 [먹튀 없는 도서 대출]',
      badge: '공식인증',
      description: '연체 일수 +3일 특별 보너스! 신속 대출 보장!',
      alertMsg: '🚨 [경고] 먹튀는 불가능합니다. 반납 예정일을 준수하세요! 대출 완료!',
      styleType: 'rainbow',
      icon: <Flame size={16} className="animate-bounce" />,
    },
    {
      id: 3,
      title: '🔥 [속보] 밤길 조심! 연체자 추적중',
      badge: '수배중',
      description: '연체 즉시 사서의 분노 폭발! 자수하여 광명찾자!',
      alertMsg: '👤 당신도 연체자 명단에 등록될 수 있습니다. 얼른 반납 하십시오... 👁️👁️',
      styleType: 'blink',
      icon: <Percent size={16} />,
    },
    {
      id: 4,
      title: '✨ [뇌섹전용] 읽기만 해도 서울대?!',
      badge: '100%당첨',
      description: '공부 안 하면 더 나은 미래는 없다! 지금 당장 공부!',
      alertMsg: '🎓 축하합니다! 뇌 세포가 1% 활성화되었습니다. 어서 책장으로 가십시오!',
      styleType: 'crazy',
      icon: <Sparkles size={16} />,
    },
    {
      id: 11,
      title: '📡 KT GiGA 1G 초고속 인터넷 가입',
      badge: 'AIVLE혜택',
      description: '9기 에이블러 전용 사은품 지급! 기가지니 포함 초특가 가입!',
      alertMsg: '📡 [KT GiGA 인터넷] 에이블스쿨 9기 동기 한정 특별 결합 할인 혜택! 가입 상담은 국번 없이 100번!',
      styleType: 'rainbow',
      icon: <ShieldAlert size={16} />,
    },
    {
      id: 12,
      title: '📺 KT genie TV 지니 초이스 무료!',
      badge: '공짜영화',
      description: '매월 최신 영화/드라마 무료 시청! 에이블 코딩 특강 독점 오픈!',
      alertMsg: '📺 [genie TV] 지니 TV 초이스 요금제 가입 시 OTT 무료 제공! 에이블 프로젝트 꿀팁 영상 무제한 시청 가능!',
      styleType: 'neon',
      icon: <Award size={16} />,
    },
    {
      id: 13,
      title: '💚 KT Y박스 데이터 2GB 무료 충전',
      badge: '데이터나눔',
      description: '데이터 걱정 없는 9기 에이블러 생활! 매월 공짜 데이터 획득!',
      alertMsg: '💚 [KT Y박스] 데이터가 부족한 에이블 동기들에게 무료로 데이터를 선물해 보세요!',
      styleType: 'crazy',
      icon: <Percent size={16} />,
    },
  ]);

  const handleBannerClick = (banner: BannerProps) => {
    alert(banner.alertMsg);
    if (banner.url) {
      window.open(banner.url, '_blank');
    }
  };

  const getStyleClasses = (type: string) => {
    switch (type) {
      case 'rainbow':
        return 'animate-rainbow-bg text-white border-2 border-yellow-300 font-bold';
      case 'neon':
        return 'bg-black text-[#00f0ff] border-2 border-[#ff007f] animate-neon-border';
      case 'blink':
        return 'bg-red-600 text-yellow-300 border-4 border-yellow-400 animate-rapid-blink font-black';
      case 'crazy':
        return 'bg-yellow-400 text-slate-900 border-2 border-dashed border-red-600 hover:animate-crazy-shake font-extrabold';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  return (
    <div className="w-full space-y-4 min-h-[60vh]">
      {/* 타이틀 바 (역시 킹받게 네온 보드 스타일) */}
      <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3 text-center shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
        <p className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 animate-pulse">
          ⚡ 5조 도서관 공식 후원 파트너 
           KT AivleSchool 9기 ⚡
        </p>
      </div>

      {/* 스크롤 가능한 배너 영역 */}
      <div className="max-h-[500px] overflow-y-auto ugly-scrollbar pr-1.5 space-y-3 min-h-[60vh]">
        {banners.map((banner) => (
          <div
            key={banner.id}
            onClick={() => handleBannerClick(banner)}
            className={`p-3.5 rounded-xl cursor-pointer select-none transition-all duration-200 active:scale-95 shadow-md flex flex-col justify-between h-24 relative overflow-hidden group ${getStyleClasses(
              banner.styleType
            )}`}
          >
            {/* 반짝이 효과 오버레이 */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none"></div>
            
            {/* 상단 뱃지 + 아이콘 */}
            <div className="flex justify-between items-center z-10">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-black tracking-tighter ${
                banner.styleType === 'blink' ? 'bg-yellow-400 text-black' : 
                banner.styleType === 'neon' ? 'bg-[#ff007f] text-white' : 
                banner.styleType === 'rainbow' ? 'bg-black text-yellow-300' : 'bg-red-600 text-white animate-bounce'
              }`}>
                {banner.badge}
              </span>
              <span className="shrink-0">
                {banner.icon}
              </span>
            </div>

            {/* 타이틀 및 설명 */}
            <div className="mt-1.5 z-10">
              <h4 className="text-xs font-black truncate leading-tight group-hover:underline">
                {banner.title}
              </h4>
              <p className={`text-[10px] truncate mt-0.5 font-medium ${
                banner.styleType === 'neon' ? 'text-[#00ff66]' : 
                banner.styleType === 'rainbow' ? 'text-yellow-200' : 
                banner.styleType === 'blink' ? 'text-white' : 'text-slate-700'
              }`}>
                {banner.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 푸터 배너 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-[10px] text-slate-500 select-none">
        <span className="flex items-center gap-1">
          <HelpCircle size={10} />
          광고 문의: Information
        </span>
        <span className="text-red-500 font-bold animate-pulse">
          심의 준수 100%
        </span>
      </div>
    </div>
  );
}
