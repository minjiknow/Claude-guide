# Design System

Define all tokens as CSS custom properties in `:root`.

## 🎨 Color System

### Primary (Brand Color)

- `--primary-500: #339CD5;`
- `--primary-rgb: 51, 156, 213;`
- `--primary-300: rgba(var(--primary-rgb), 0.30);`
- `--primary-100: rgba(var(--primary-rgb), 0.10);`

### Secondary

- `--secondary-500: #457CE1;`
- `--secondary-rgb: 69,124,225;`
- `--secondary-300: rgba(var(--secondary-rgb), 0.30);`
- `--secondary-100: rgba(var(--secondary-rgb), 0.10);`
- `--secondary-20: rgba(var(--secondary-rgb), 0.02);`

### Neutral (Gray Scale)

- `--gray-900: #111111;`
- `--gray-800: #333333;`
- `--gray-700: #666666;`
- `--gray-600: #929292;`
- `--gray-500: #bbbbbb;`
- `--gray-400: #d7d7d7;`
- `--gray-300: #eeeeee;`
- `--gray-200: #dddddd;`
- `--gray-50: #f7f7f7;`
- `--gray-c50: #f9fafc;`
- `--gray-c100:rgba(233,236,243,0.5);`
- `--gray-c200:#EDF0F6;`

### Semantic (UI Meaning Colors)

- `--color-success: #19973c;`
- `--color-error: #E24949;`
- `--color-warning: #D15E00;`
- `--color-info: #339CD5;`

### Pure

- `--color-red: #e24949;`
- `--color-black: #000000;`
- `--color-white:#ffffff;`

### BrandColor

- `--color-mainbrand: #005CB9;`
- `--color-secondarybrand: #15803D;`

### Optional Colors

- `--state1: #339CD5;`
- `--state2: #0c8ce9;`
- `--state3: #31BB48;`
- `--state4: #F36D00;`
- `--state5: #FF4E4E;`
- `--state6: #18A3B9;`
- `--state7: #9D5EEE;`
- `--state8: #3A79D8;`
- `--state9: #00a170;`
- `--state10: #8c939d;`

---

## 🔤 Font System

### Font-Size

- `--font-large: 24px;`
- `--font-medium: 18px;`
- `--font-primary: 16px;`
- `--font-small: 14px;`
- `--font-xsmall: 12px;`

### Font-Weight

- `--font-weight-thin: 100;`
- `--font-weight-light: 300;`
- `--font-weight-regular: 400;`
- `--font-weight-medium: 500;`
- `--font-weight-semibold: 600;`
- `--font-weight-bold: 700;`
- `--font-weight-extrabold: 800;`

### Line-Height

- `--line-height-100: 100%;`
- `--line-height-120: 120%;`
- `--line-height-140: 140%;`
- `--line-height-150:150%;`

---

## 📏 Spacing

- `--spacing-4: 4px;`
- `--spacing-6: 6px;`
- `--spacing-8: 8px;`
- `--spacing-12: 12px;`
- `--spacing-16: 16px;`
- `--spacing-24: 24px;`

---

## 🔲 Border Radius

- `--border-radius-4: 4px;`
- `--border-radius-8: 8px;`
- `--border-radius-16: 16px;`
- `--border-radius-24: 24px;`
- `--border-radius-full: 100%;`

---

## 🌫️ Shadow

- box-shadow는 반복 사용되는 경우에만 변수로 정의

---

## Rules

- 본 파일에 정의된 디자인 토큰을 기준으로 사용
- color, font-size, font-weight, spacing, border-radius, shadow 값은 직접 입력하지 않음
- input, select, textarea 등의 기본 상태 스타일(:focus, :hover, is-error, is-success, is-warning, is-info)은 /assets/css/common.css에 작성한다.
- 가능한 기존 토큰을 재사용
- 필요한 토큰이 없을 경우, :root에 정의 후 사용
- 의미가 겹치거나 중복되는 토큰은 생성하지 않음
- 전역 CSS 영향 금지
- div 클릭 처리 금지 (button, a 사용)
