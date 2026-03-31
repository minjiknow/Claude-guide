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

## ☑️ Checkbox

Checkbox는 상태에 따라 아래 에셋을 사용한다.

- 기본(미선택): `unchkbx.svg`
- 선택됨: `chkbx.svg`
- 비활성화(미선택): `dis_unchkbx.svg`
- 비활성화(선택됨): `dis_chkbx.svg`

Checkbox 에셋은 파일명 자체보다 **실제 UI 상태 기준**으로 정확히 매핑해야 한다.

---

## Form 상태 색상 원칙

- form 계열 컴포넌트의 상태 색상은 root 기준 semantic token을 따른다.
- focus 상태의 border 및 active indicator는 `var(--secondary-500)`를 사용한다.
- error 상태의 border, text, helper message는 `var(--color-error)`를 사용한다.
- disabled와 readonly는 모두 비활성 계열의 시각 규칙을 따르되, 필요 시 상호작용 가능 여부가 구분되도록 표현한다.
- disabled, readonly 상태의 기본 background는 `var(--gray-50)`, border는 `var(--gray-300)`을 사용한다.
- disabled, readonly, default 상태 역시 컴포넌트 개별 정의가 아니라 root 기준 토큰으로 관리한다.
- input, dropdown, searchbox는 같은 상태에 대해 동일한 색상 의미 체계를 가져야 한다.

### 공통 상태 정의 (Input / Dropdown / Searchbox)

| 상태           | border-color                                                   | background      | text color   | box-shadow                       | class / pseudo                |
| -------------- | -------------------------------------------------------------- | --------------- | ------------ | -------------------------------- | ----------------------------- |
| default        | `--gray-300`                                                   | `--color-white` | `--gray-900` | none                             | —                             |
| hover          | `--secondary-500` (input/search) / `--secondary-500` (dropbox) | —               | —            | —                                | `:hover`                      |
| focus / active | `--secondary-500`                                              | —               | —            | `0 0 0 2px var(--secondary-100)` | `:focus` / `.active`          |
| error          | `--color-error`                                                | —               | —            | focus 시 `rgba(226,73,73,0.12)`  | `.is-error`                   |
| success        | `--color-success`                                              | —               | —            | —                                | `.is-success`                 |
| warning        | `--color-warning`                                              | —               | —            | —                                | `.is-warning`                 |
| info           | `--color-info`                                                 | —               | —            | —                                | `.is-info`                    |
| disabled       | `--gray-300`                                                   | `--gray-50`     | `--gray-500` | none                             | `:disabled` / `.is-disabled`  |
| readonly       | `--gray-300`                                                   | `--gray-50`     | `--gray-800` | none (hover/focus 효과 없음)     | `[readonly]` / `.is-readonly` |

---

## 📅 Datepicker / Timepicker

날짜 및 시간 입력 컴포넌트의 아이콘은 아래 에셋을 사용한다.

- datepicker icon: `calico.svg`
- timepicker icon: `timeico.svg`

각 아이콘은 해당 입력 필드의 우측 보조 아이콘 영역에 배치한다.

---

## 🔽 Select / Dropdown

선택형 UI에서는 native HTML `<select>` / `<option>` 태그를 사용하지 않는다.

모든 선택 UI는 반드시 커스텀 dropdown 컴포넌트로 구현한다.

### Rules

- 금지: `<select>`, `<option>`
- 필수: custom dropdown component
- 리스트 항목은 `button`, `label`, `input[type="checkbox"]`, `ul`, `li` 등으로 구성
- 단일 선택 / 멀티 선택 모두 동일하게 custom dropdown 방식 사용
- 화살표 아이콘은 `arrow_down.svg` 사용
- 기존 dropdown 스타일(`dropdown`, `dropdown-toggle`, `dropdown-menu`, `dropdown-option` 등)을 그대로 재사용하거나 동일하게 맞춘다
- `is-*` 클래스는 상태 modifier 전용으로 사용하며, 크기 지정 용도로 사용하지 않는다.
- 고정 높이 클래스는 `h-sm`, `h-md`, `h-lg`처럼 `h-*` prefix로 구분한다.
- 고정 너비 클래스는 `w-sm`, `w-md`, `w-lg`처럼 `w-*` prefix로 구분한다.
- 가로·세로를 함께 고정해야 할 경우에도 각각 `w-*`, `h-*` 클래스를 조합해서 사용한다.
- 버튼과 인풋의 기본 스타일에는 고정 width, height를 포함하지 않는다.
- 지정된 높이는 `h-*` 클래스가 적용된 경우에만 사용한다.
- 지정된 너비는 `w-*` 클래스가 적용된 경우에만 사용한다.
    ```html
    <button class="btn h-md w-full">확인</button>
    <div class="dropdown-toggle h-md w-lg"></div>
    <input class="searchbox h-sm w-full" />
    ```

### Output requirement

- 최종 결과물에 `<select` 또는 `<option` 문자열이 포함되면 안 된다
- 페이지네이션, 정렬, 필터, 폼 선택 UI, 예시 코드까지 모두 동일하게 적용한다

---

## Rules

- 본 파일에 정의된 디자인 토큰을 기준으로 사용
- color, font-size, font-weight, spacing, border-radius, shadow 값은 직접 입력하지 않음
- input, select, textarea 등의 기본 상태 스타일(:focus, :hover, is-error, is-success, is-warning, is-info)은 /assets/css/common.css에 작성한다.
- 상태값에 따라 사용하는 색상은 palette token을 직접 하드코딩하지 않고, 가능한 semantic token을 통해 참조한다.
- 가능한 기존 토큰을 재사용
- 필요한 토큰이 없을 경우, :root에 정의 후 사용
- 의미가 겹치거나 중복되는 토큰은 생성하지 않음
- 전역 CSS 영향 금지
- div 클릭 처리 금지 (button, a 사용)
