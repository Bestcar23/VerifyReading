# 세화고 독서가 인증 여부 확인

정적 배포용 웹앱입니다. GitHub에 업로드한 뒤 Vercel에서 바로 배포할 수 있습니다.

## 포함 파일
- `index.html` : 메인 화면
- `styles.css` : 디자인
- `app.js` : 조회 로직
- `config.js` : Apps Script 웹앱 URL 설정
- `Code.gs` : 구글 시트에 넣을 Apps Script
- `vercel.json` : Vercel 정적 배포 설정

## 현재 반영된 Apps Script URL
- `config.js`에 실제 URL이 이미 입력되어 있습니다.

## 구글 시트 구조
- 시트 이름: `Sheet1`
- D열: 학번
- E열: 성명
- F열: 인증 결과

## 배포 방법
1. 구글 시트에서 `확장 프로그램 > Apps Script`로 이동합니다.
2. `Code.gs`를 붙여넣고 저장합니다.
3. `배포 > 새 배포 > 웹앱`으로 배포합니다.
4. 접근 권한은 필요한 범위로 설정합니다.
5. 정적 파일 세트를 GitHub 저장소에 업로드합니다.
6. Vercel에서 저장소를 Import하여 배포합니다.

## 참고
정적 웹앱에서 Apps Script를 안정적으로 호출할 수 있도록 `callback` 파라미터를 사용하는 JSONP 방식도 지원하도록 `Code.gs`가 작성되어 있습니다.
