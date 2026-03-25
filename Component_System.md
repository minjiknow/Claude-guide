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

## SearchBox

### 구조

```html
<div class="search">
    <input class="searchInput" type="text" />
    <button class="searchButton"></button>
</div>
```

### 규칙

- input + button 조합
- 버튼은 항상 존재해야 한다

---

## Dropdown

### 규칙

- Dropdown은 custom select 컴포넌트로 사용한다.
- trigger 영역과 option list를 포함해야 한다.
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

## 한 줄 핵심

👉 모든 컴포넌트는 `block + camelCase element + is-* 상태` 구조로 설계한다.
