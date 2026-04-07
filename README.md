# 세화고 독서가 인증 여부 확인

구글 시트의 `Sheet1`에 저장된 정보를 바탕으로 학생의 **학번**과 **성명**을 입력하면 인증 결과를 확인할 수 있는 정적 웹앱입니다.

## 파일 구조

```text
.
├─ index.html
├─ README.md
├─ vercel.json
└─ assets
   ├─ app.js
   ├─ logo.svg
   └─ styles.css
```

## 반영된 Apps Script 웹앱 URL

`assets/app.js`에 아래 URL이 반영되어 있습니다.

```text
https://script.google.com/macros/s/AKfycbyMf1rP8Zf1SWZQbWCox0-KMznlM4eWMSxJMSEaJTrfh7JxjzSW1yJyHmUxeCQyduUa/exec
```

## 배포 방법

### 1. GitHub 업로드
루트에 있는 파일과 `assets` 폴더를 그대로 GitHub 저장소에 업로드합니다.

### 2. Vercel 배포
Vercel에서 해당 GitHub 저장소를 Import 합니다.

### 3. Framework Preset
별도 프레임워크를 선택하지 않아도 됩니다.

### 4. 배포
`vercel.json`이 포함되어 있으므로 정적 사이트로 바로 배포할 수 있습니다.

## 화면 동작 방식

1. 사용자가 학번과 성명을 입력합니다.
2. 정적 웹앱이 Apps Script 웹앱으로 요청을 보냅니다.
3. 시트의 D열(학번), E열(성명), F열(인증 결과)을 조회합니다.
4. 일치하는 행이 있으면 F열 값을 화면에 보여줍니다.

## 구글 시트 구조

- 시트 이름: `Sheet1`
- D열: 학번
- E열: 성명
- F열: 인증 결과 (`충족`, `미충족` 등)
- 1행: 헤더
- 2행부터 데이터

## 꼭 확인할 사항

정적 웹앱이 정상적으로 동작하려면 Apps Script 쪽 `Code.gs`가 **JSONP callback 파라미터를 처리하는 버전**으로 배포되어 있어야 합니다.

즉, Apps Script의 `doGet(e)`에서 아래와 같은 형태를 지원해야 합니다.

```javascript
const callback = e.parameter.callback || '';
if (callback) {
  return ContentService
    .createTextOutput(`${callback}(${JSON.stringify(result)})`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
```

이 부분이 없으면 브라우저에서 “웹 앱에 연결할 수 없음” 또는 응답 처리 오류가 발생할 수 있습니다.
