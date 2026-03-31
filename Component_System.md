# COMPONENT_SYSTEM

## 목적

- 모든 UI 컴포넌트를 일관된 구조로 설계한다.
- 컴포넌트는 재사용 가능하고 독립적으로 동작해야 한다.
- 모든 스타일은 DESIGN_SYSTEM.md의 토큰을 기반으로 구성한다.

---

## 공통 설계 원칙

### 1. 독립성

- 컴포넌트는 다른 컴포넌트에 의존하지 않는다.
- 단독으로 사용해도 UI가 깨지지 않아야 한다.

### 2. 재사용성

- 동일 구조는 클래스 확장 방식으로 처리한다.
- 중복 마크업/스타일 최소화

### 3. 확장성

- 타입, 상태, 옵션을 클래스 조합으로 확장한다.
- 기존 구조를 변경하지 않고 확장 가능해야 한다.

### 4. 일관성

- 모든 컴포넌트는 동일한 네이밍 규칙을 따른다.
- 상태 표현 방식 통일

---

## 클래스 작성 규칙

- 클래스는 `block + element` 구조를 사용한다.
- element는 camelCase로 작성한다.
- 상태는 `is-*` 클래스로 분리한다.
- 타입/크기/변형은 modifier 클래스로 분리한다.

### 예시

✔ 허용

- `card`
- `cardHeader`
- `inputField`
- `searchButton`
- `dropbox-option`
- `is-active`

❌ 금지

- `card-header`
- `input-field`
- `btn__icon`
- `btn--primary`

---

## 상태 관리 규칙

- 상태는 `is-*` 클래스로 표현한다.

### 공통 상태

- `is-active`
- `is-disabled`
- `is-open`
- `is-selected`
- `is-error`
- `is-loading`

### 상태 처리 기준

- `:focus`
- `:hover`
- `:active`

사용자 인터랙션 기반 상태는 CSS pseudo-class로 처리한다.

예:

- `input:focus`
- `button:hover`

데이터 / 로직 기반 상태는 class로 처리한다.

예:

- `is-error`
- `is-disabled`
- `is-open`

---

## 컴포넌트 목록

- Button
- Input
- SearchBox
- Dropdown
- Table
- Card

---

## Button

### 구조

```html
<button class="btn is-primary">
    <span class="btnIcon"></span>
    <span class="btnText">버튼</span>
</button>
```

### 타입

- `is-primary`
- `is-secondary`
- `is-ghost`

### 상태

- `is-disabled`
- `is-active`
- `is-loading`

---

## Input

### 규칙

- label은 optional
- message 영역은 항상 DOM에 존재해야 한다
- 상태(`is-error`)가 적용되면 message를 표시한다
- input은 단독 또는 다른 컴포넌트와 조합 가능하다

### 조합

- input + button (Search)
- input + dropdown (Select)
- input + calendar (DatePicker)

### 구조

```html
<div class="input">
    <label class="inputLabel">라벨</label>
    <input class="inputField" type="text" />
    <p class="inputMessage">메시지</p>
</div>
```

### 상태

- `is-disabled`
- `is-readonly`
- `is-error`

### 상태 처리 기준

- focus 상태는 `:focus`로 처리한다.
- error 상태는 `.input.is-error`로 처리한다.

예:

```css
.inputField:focus {
    outline: none;
}

.input.is-error .inputField {
    border-color: var(--color-error);
}

.input.is-error .inputMessage {
    display: block;
}
```

---

## 🔎 Search Input

검색 영역은 기본적으로 **input + search button** 구조를 사용한다.

- 검색 버튼이 텍스트 없이 아이콘만 있는 경우, 버튼은 input 내부에 배치할 수 있어야 한다.
- 이 경우 검색 버튼은 input의 trailing area 내부 요소로 처리한다.
- input 외부 버튼 형태와 input 내부 아이콘 버튼 형태를 모두 지원할 수 있어야 한다.

---

## 🔽 Select / Dropdown

열림/닫힘 상태에 따른 기존 인터랙션 규칙은 유지한다.
열림 상태에서는 화살표 아이콘이 rotate 될 수 있다.

---

## SearchBox

### 구조

- input + button 조합

```html
<div class="search">
    <input class="searchInput" type="text" />
    <button class="searchButton"></button>
</div>
```

- input 안에 버튼 조합

```html
<div class="search">
    <input class="searchInput" id="filterText1" type="text" placeholder="가나다" autocomplete="off" />
    <button class="searchButton filterSearchBtn" type="button" title="검색" aria-label="검색">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
    </button>
</div>
```

### 규칙

- 두 가지의 SearchBox 조합이 필요하다
- input + button 조합
- input 안에 버튼(검색아이콘만 있는 경우) 조합
- 버튼은 항상 존재해야 한다

## Dropdown

### 규칙

- Dropdown은 custom select 컴포넌트로 사용한다.
- trigger 영역과 optionlist를 포함해야 한다.
- JS 초기화 대상은 `data-component="dropbox"`로 식별한다.
- 선택된 값은 `.selected-text`에 표시한다.
- 옵션 리스트는 기본적으로 닫힌 상태이며, 열릴 때 `is-open`을 사용한다.
- 선택된 옵션은 `is-selected` 상태로 표시한다.

### 구조

```html
<div class="dropbox" data-component="dropbox">
    <p class="selected-text">전체</p>
    <ul class="dropbox-option">
        <li class="is-selected">
            <p class="option-text">선택1</p>
        </li>
        <li>
            <p class="option-text">선택2</p>
        </li>
    </ul>
</div>
```

### 상태

- `is-open`
- `is-selected`
- `is-disabled`

## Dropdown open direction

드롭다운은 기본적으로 아래 방향으로 열린다.

단, dropdown menu가 화면 하단을 넘어가거나 잘려서 전체 항목이 보이지 않는 경우에만
자동으로 위 방향으로 열리도록 처리한다.

### Rules

- 기본 동작: open downward
- 예외: menu가 viewport 밖으로 잘리면 open upward
- 화면에 충분한 공간이 있으면 항상 아래로 연다
- 페이지 하단에 위치했다는 이유만으로 무조건 위로 열지 않는다
- pagination 영역의 dropdown도 동일한 규칙을 따른다

### 예외 규칙

- Dropdown은 커스텀 UI 컴포넌트로 별도의 DOM 구조를 가질 수 있다.
- 상태 클래스(`is-*`)는 공통 규칙을 따른다.
- JS 바인딩이 필요한 경우 `data-*` 속성을 사용할 수 있다.

---

## Table

### 구조

```html
<table class="table">
    <thead class="tableHead">
        <tr>
            <th>제목</th>
        </tr>
    </thead>
    <tbody class="tableBody">
        <tr>
            <td>내용</td>
        </tr>
    </tbody>
</table>
```

### 상태

- hover
- empty
- disabled row

---

## Card

### 구조

```html
<div class="card">
    <div class="cardHeader"></div>
    <div class="cardBody"></div>
    <div class="cardFooter"></div>
</div>
```

### 타입

- `is-shadow`
- `is-outline`

---

## Datepicker / Timepicker

### 기본 정책

- Datepicker 및 Timepicker는 **Air Datepicker의 CDN(css, js)** 을 사용한다.
- 기본 locale은 **한국어(ko)** 로 설정한다.
- 기본 UI는 **input field + icon** 조합으로 구성한다.
- icon은 input과 함께 하나의 field wrapper 내부에 배치한다.
- 별도 요청이 없는 한, 커스텀 구현보다 **Air Datepicker 기본 기능을 우선 사용**한다.

### Datepicker

- input 영역 전체를 클릭하면 캘린더가 노출되어야 한다.
- 기본 표시 형식은 `YYYY.MM.DD` 로 한다.
- 단일 선택(single)과 기간 선택(range) 모두 지원 가능해야 한다.
- range 형태를 사용하는 경우, **종료일은 시작일보다 빠를 수 없다.**
- range 형태를 사용하는 경우, **종료일 input은 시작일 이전 날짜를 선택할 수 없도록 제한**해야 한다.
- range 형태를 사용하는 경우, **종료일의 최소 선택 가능일(min date)은 시작일과 같거나 이후여야 한다.**
- 시작일이 선택되지 않은 상태에서는 종료일 선택 로직이 비정상적으로 동작하지 않도록 처리해야 한다.
- 시작일이 변경되면 종료일의 선택 가능 범위와 유효성도 함께 갱신되어야 한다.
- 기존에 선택된 종료일이 시작일보다 빠른 값이 되는 경우, 해당 종료일 값은 유지되지 않도록 처리해야 한다.

### Timepicker

- input 영역 전체를 클릭하면 timepicker가 노출되어야 한다.
- 기본 시간 형식은 `HH:mm` 으로 한다.
- 시간 선택은 시/분 기준으로 처리한다.

#### Datepicker&Timepicker 공통

- Datepicker와 Timepicker는 기본적으로 사용성과 일관성을 우선하며, input과 icon이 분리된 개별 트리거처럼 동작하지 않고 하나의 field로 동작해야 한다.

## 한 줄 핵심

👉 모든 컴포넌트는 `block + camelCase element + is-* 상태` 구조로 설계한다.
