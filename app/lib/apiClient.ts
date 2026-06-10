// app/lib/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // 환경 변수에서 주소를 자동으로 읽어옵니다.
  timeout: 2000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// (선택) JWT 토큰 등 인증 헤더 설정이 필요할 때 인터셉터 추가 가능
apiClient.interceptors.request.use(
  (config) => {
    // 예: 로컬 스토리지나 쿠키에서 토큰 꺼내서 붙이기
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
