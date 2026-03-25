# 기술 스택

- HTML5 (Semantic Markup)
- CSS (커스텀 컴포넌트 네이밍 규칙)
- JavaScript (jQuery 기반)

## 디자인 시스템 규칙

- 모든 색상, 폰트, 간격, radius, shadow는 DESIGN_SYSTEM.md 기준 사용
- 모든 UI 컴포넌트(버튼, 모달, 테이블, 인풋, 검색박스, 칩, 체크박스, 토글 버튼, 알림 박스 등)는 Components_System.md 기준으로 사용
- 임의 HEX 코드 사용 금지
- 기존 토큰 우선 사용

## 반응형 규칙

- Mobile First 방식
- 기준:
    - Mobile: 375px
    - Tablet: 768px 이상
    - Desktop: 1280px 이상
- media query는 min-width 기준 사용

## 전체 파일 구조

- assets
    - images
    - icons
    - css
    - js
    - jquery
- components
- layout
- pages

## 파일 구조 규칙

- 각 컴포넌트는 개별 폴더로 관리

    /components/컴포넌트명/

        index.html
        style.css
        script.js

- 공통 경로
  /assets/css/common.css
  /assets/js/common.js
  /assets/images/파일명/

### CSS 아키텍처 규칙

- 디자인 토큰의 기준 문서는 DESIGN_SYSTEM.md이다.
- COMPONENT_SYSTEM.md에는 컴포넌트 구조와 상태 규칙만 정의한다.
- 실제 구현 시 :root 변수 정의와 공통 상태 스타일은 /assets/css/common.css 파일에서 함께 관리한다.
- 상태 스타일(:focus, :hover, is-error, is-success, is-warning, is-info)은 /assets/css/common.css에서 처리한다.
- 색상 값은 반드시 DESIGN_SYSTEM.md의 토큰을 사용한다.
- reset.css, base.css, tokens.css 등 별도의 CSS 파일은 추가 생성하지 않는다.
- margin/padding override와 같은 유틸리티 클래스는 utility 영역에서만 정의한다.

### 접두어 규칙

- 컴포넌트: c-
- 레이아웃: l-
- 유틸리티: u-
- 상태: `is-`

### HTML 규칙

- semantic tag 우선 사용 (header, main, section, article, nav)
- 클릭 요소는 button 또는 a 사용 (div 금지)
- 모든 이미지 alt 필수
- 정보성: 의미 있는 alt
- 장식용: alt=""
- IR 기법 사용 가능
- 클래스명 내 하이픈(-) 1회 사용 규칙

### CSS 사용 제한

- 인라인 스타일 금지
- HTML 내 스타일 태그 금지
- 반드시 외부 CSS 파일 사용
- 불필요한 wrapper 금지

### JavaScript 규칙

- jQuery 기반 작성
- 전역 변수 최소화
- 이벤트는 초기화 함수에서 바인딩

### UI 규칙

- 버튼 타입 (3종 필수)
    - 아이콘 + 텍스트
    - 텍스트만
    - 아이콘만

- 버튼 상태
    - default
    - hover
    - active
    - disabled

### Date/Time 컴포넌트

- 아래는 반드시 air-datepicker 사용
    - datepicker
    - timepicker
    - daterangepicker
    - timerangepicker
- 다른 라이브러리 사용 금지

### Pagination 규칙

- 이전 / 다음 버튼 포함
- 현재 페이지 표시
- 비활성 상태 처리 포함

### 접근성

- 이미지 alt 필수
- 키보드 접근 가능 구조
- button / link 역할 명확
- form 요소 label 연결 필수

### 컴포넌트 원칙

- 독립적으로 동작
- 재사용 가능 구조
- HTML / CSS / JS 분리
- 전역 CSS 영향 금지

### 수정 작업 규칙

- 기존 구조 유지
- 기존 클래스명 변경 금지
- 영향 범위 최소화
- 공통 수정 시 영향 설명

### 응답 형식

- 항상 아래 순서로 제공

- 작업 내용 요약
    - 파일 구조
    - HTML 코드
    - CSS 코드
    - JavaScript 코드
    - 주의사항

### 기타

- 답변은 항상 한국어
- 코드 중심으로 작성
- 디자인 시스템 → 컴포넌트 → 코드 순으로 작업
