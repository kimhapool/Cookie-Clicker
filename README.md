# Cookie Clicker

Expo SDK 57 기반의 세로형 모바일 쿠키 클리커입니다. 일반 휴대폰과 넓은 폴드 화면을 지원하며 진행 상황은 기기 내부에 저장됩니다.

## 실행

```powershell
npm ci
npx expo start --lan
```

컴퓨터와 휴대폰을 같은 네트워크에 연결한 뒤 SDK 57용 Expo Go로 QR 코드를 엽니다. 이 컴퓨터에는 바탕화면의 `Start-Cookie-Clicker-Expo.bat` 실행 파일도 준비되어 있습니다. 브라우저 확인은 `npm run web`을 사용합니다.

배경 음악은 기본으로 꺼져 있습니다. 설정에서 언어, 효과음 종류, 효과음/진동 여부를 변경할 수 있습니다.

## 구현된 게임 시스템

- 쿠키 클릭, 중심에 고정된 획득량·부스러기·파동·한입 효과, 연속 터치 단계
- 자동화 건물 6종 구매/판매/무한 강화와 건물별 생산 연출
- 오븐 17종 장착·강화·융합·분해, 코어와 에피루스, 선택한 오븐의 특성 강화
- 기본/프리미엄/특성 뽑기, 1회/10회/전부 뽑기, 레벨·확률 보정 아이템
- 모든 뽑기의 개별 비행 연출과 Secret의 57조각 재조립 연출
- 교환, 더블 포션/피버 타임, 환생, 미션, 도전과제, 우편, 단계별 튜토리얼
- 75% 효율·최대 4시간 오프라인 생산, 중복 수령 방지, 저장 복원
- 한국어/영어/일본어/중국어/아랍어/독일어/러시아어, 6단계 초기화 확인

## 구조

- `App.tsx`: 저장 복원, 앱 생명주기, 내비게이션, 전역 모달
- `App.styles.ts`: 앱 공통 스타일
- `src/components/HomePage.tsx`: 반응형 홈과 부스트·자동화 영역
- `src/components/GamePages.tsx`: 뽑기/인벤토리/자동화/교환/강화/도전과제 컴포넌트
- `src/components/SettingsModal.tsx`: 설정과 초기화 확인
- `src/components/TapCookie.tsx`, `DrawSequence.tsx`, `AutomationVista.tsx`, `TraitDraw.tsx`: 게임 연출·특성 UI
- `src/store/useGameStore.ts`: 저장 상태와 게임 경제
- `src/data`, `src/i18n`, `src/utils`: 게임 데이터·번역·계산

## 검증

```powershell
npm test
npx tsc --noEmit
npx expo export --platform android
```

검증 기록과 화면은 `docs/verification`에 있습니다. 브라우저 테스트와 Android Expo Go 실행, 자동화된 경제 테스트를 구분해 기록했습니다. Expo export 결과는 Android용 JS/Hermes 번들이며 서명된 APK/AAB는 아닙니다.

최신 요구사항 대조표와 검증 범위는 [복원 검증 기록](docs/verification/2026-11-08-recovery-audit.md)에 정리되어 있습니다. 자동 테스트 27개, Expo 검사 21개와 TypeScript 검사 및 Android 번들 생성이 통과했습니다. 물리적 Fold의 접기/펼치기와 출시 빌드 성능은 별도 실기기 확인이 필요합니다.

개발용 연출 프리뷰는 웹 개발 모드의 `?preview=draw`, `?preview=automation`에서만 열립니다. 실제 저장소와 분리되어 있고 Android 릴리스 번들에는 포함되지 않습니다.

## 자산

쿠키 이미지와 오디오, `assets/icon-original.png`는 사용자가 제공한 원본 게임 자료/APK에서 복원한 자산입니다. 아이콘은 원본 APK의 `res-images/5c.webp` 바이트를 그대로 사용하고 실제 PNG 형식에 맞게 확장자만 정정했습니다. 게임 연출과 UI는 프로젝트 코드로 작성했습니다. 유료 서비스나 광고 SDK는 사용하지 않습니다.
