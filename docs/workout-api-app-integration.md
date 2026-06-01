# Gistag 운동/NFC API 앱 연동 가이드

이번 백엔드 작업으로 NFC 태그 검증, 운동 세션 시작/복구/종료, 최근 운동 기록 조회 API가 추가되었습니다. 앱에서는 NFC 칩에서 읽은 **`hardwareUid`** 를 서버에 전달하고, 서버가 장소 검증과 운동 시간/XP/streak 계산을 담당합니다. (이전 버전의 `tagCode` 중심 흐름은 호환을 위해 일부 운영 API에만 남아 있습니다.)

## 공통

모든 API는 JWT access token이 필요합니다.

```http
Authorization: Bearer <appAccessToken>
Content-Type: application/json
```

공통 에러는 NestJS 기본 에러 포맷을 따릅니다.

```json
{
  "statusCode": 401,
  "message": "Invalid or expired access token",
  "error": "Unauthorized"
}
```

## NFC 스티커 읽기 방식

앱은 NFC 칩의 **하드웨어 UID(`hardwareUid`)** 를 주 식별자로 사용합니다. 운영자가 `POST /admin/nfc-tags/register`로 등록할 때 같은 UID를 키로 저장하기 때문에, 앱이 읽은 UID 값을 그대로 서버에 보내면 됩니다.

```json
{
  "hardwareUid": "04A1B2C3D4E5F6",
  "ndefPayload": null
}
```

`ndefPayload`는 읽을 수 있을 때만 함께 보내는 보조 정보이며, 검증에는 사용되지 않습니다.

## 사용자 앱 Flow

```mermaid
flowchart LR
  scan["NFC Scan"] --> resolve["POST /tags/resolve"]
  resolve --> success["Place Confirm"]
  success --> start["POST /workout-sessions/start"]
  start --> active["Active Workout"]
  active --> restore["GET /workout-sessions/active"]
  active --> finish["POST /workout-sessions/{sessionId}/finish"]
  finish --> recent["GET /workout-records/me/recent"]
```

## 1. 태그 검증

```http
POST /tags/resolve
```

NFC 칩에서 읽은 `hardwareUid`가 유효한 장소에 연결되어 있는지 확인합니다. `hardwareUid`가 1차 식별자입니다.

### Request

```json
{
  "hardwareUid": "04A1B2C3D4E5F6",
  "ndefPayload": null
}
```

`ndefPayload`는 선택값입니다(읽을 수 있을 때만 함께 전달).

### Response 200

```json
{
  "tag": {
    "id": 1,
    "code": "04A1B2C3D4E5F6",
    "status": "ACTIVE"
  },
  "place": {
    "id": 10,
    "name": "GIST 체육관",
    "workoutType": "헬스",
    "latitude": 35.2131,
    "longitude": 126.8378
  },
  "canStartWorkout": true,
  "blockedReason": null
}
```

`tag.code`는 `hardwareUid`와 동일한 값을 반환합니다. 운동 시작 시 그대로 `hardwareUid` 필드에 넣어 보냅니다.

### 주요 에러

- `404 Tag not found`: 등록되지 않은 태그
- `422 Tag is inactive`: 비활성 또는 폐기된 태그
- `422 Tag is not assigned to a place`: 아직 장소에 연결되지 않은 태그

## 2. 진행 중인 운동 조회

```http
GET /workout-sessions/active
```

앱 재실행, background 복귀, 홈 진입 시 진행 중인 세션을 복구할 때 사용합니다.

### Response 200, 세션 있음

```json
{
  "session": {
    "id": "6e6f2772-65f5-40c7-b58f-9c7de570c9ff",
    "status": "ACTIVE",
    "startedAt": "2026-05-26T09:12:30.000Z",
    "place": {
      "id": 1,
      "name": "제2학생회관 헬스장",
      "category": "gym"
    },
    "startedByTag": {
      "id": 1,
      "code": "GISTAG_TAG_DEMO_001"
    }
  }
}
```

### Response 200, 세션 없음

```json
{
  "session": null
}
```

## 3. 운동 시작

```http
POST /workout-sessions/start
```

태그 검증 화면에서 사용자가 시작 버튼을 누를 때 호출합니다. 앱이 보낸 `placeId`와 서버의 `hardwareUid -> placeId` 매핑이 다시 검증됩니다.

### Request

```json
{
  "hardwareUid": "04A1B2C3D4E5F6",
  "placeId": 10
}
```

### Response 201

```json
{
  "session": {
    "id": "6e6f2772-65f5-40c7-b58f-9c7de570c9ff",
    "status": "ACTIVE",
    "startedAt": "2026-05-26T09:12:30.000Z",
    "place": {
      "id": 1,
      "name": "제2학생회관 헬스장",
      "category": "gym"
    }
  }
}
```

### 주요 에러

- `404 Tag not found`: 태그 없음
- `409 Active workout session already exists`: 이미 진행 중인 운동 있음
- `422 Tag is inactive`: 태그가 활성 상태가 아님
- `422 Tag does not belong to place`: 앱이 확인한 장소와 태그의 실제 장소가 다름

`409`를 받으면 앱은 `GET /workout-sessions/active`로 기존 세션을 복구하면 됩니다.

## 4. 운동 종료

```http
POST /workout-sessions/{sessionId}/finish
```

운동 종료 버튼을 누를 때 호출합니다. 최종 `finishedAt`, `durationSeconds`, `earnedXp`, streak 갱신은 서버 기준으로 계산됩니다.

### Request

```json
{
  "clientFinishedAt": "2026-05-26T09:42:30.000Z"
}
```

`clientFinishedAt`은 참고용입니다. 서버 계산에는 사용하지 않습니다.

### Response 200

```json
{
  "record": {
    "id": "2a89d38f-c8e6-49af-b815-3e670a6f7bd8",
    "sessionId": "6e6f2772-65f5-40c7-b58f-9c7de570c9ff",
    "place": {
      "id": 1,
      "name": "제2학생회관 헬스장",
      "category": "gym"
    },
    "startedAt": "2026-05-26T09:12:30.000Z",
    "finishedAt": "2026-05-26T09:42:30.000Z",
    "durationSeconds": 1800,
    "earnedXp": 120
  },
  "reward": {
    "earnedXp": 120,
    "totalXp": 940,
    "level": 3,
    "streakDays": 5,
    "streakUpdated": true
  }
}
```

이미 종료된 세션에 대한 재요청은 가능한 경우 기존 record를 반환합니다.

```json
{
  "record": {
    "id": "2a89d38f-c8e6-49af-b815-3e670a6f7bd8",
    "sessionId": "6e6f2772-65f5-40c7-b58f-9c7de570c9ff",
    "place": {
      "id": 1,
      "name": "제2학생회관 헬스장",
      "category": "gym"
    },
    "startedAt": "2026-05-26T09:12:30.000Z",
    "finishedAt": "2026-05-26T09:42:30.000Z",
    "durationSeconds": 1800,
    "earnedXp": 120
  },
  "reward": {
    "earnedXp": 120,
    "totalXp": 940,
    "level": 3,
    "streakDays": 5,
    "streakUpdated": false
  },
  "alreadyFinished": true
}
```

### 주요 에러

- `404 Workout session not found`: 세션이 없거나 내 세션이 아님
- `409 Workout session already cancelled`: 이미 취소된 세션
- `409 Workout session already finished`: 종료 상태지만 record를 찾을 수 없는 비정상 상태
- `422 Workout duration is too short`: 최소 운동 시간 미만

현재 최소 운동 시간은 60초입니다.

## 5. 운동 취소

```http
POST /workout-sessions/{sessionId}/cancel
```

실수로 운동을 시작했거나 기록으로 남기지 않을 때 사용합니다. 취소된 세션은 운동 기록으로 저장되지 않습니다.

### Request

```json
{
  "reason": "USER_CANCELLED"
}
```

`reason`은 선택값입니다.

### Response 200

```json
{
  "ok": true
}
```

## 6. 최근 운동 기록

```http
GET /workout-records/me/recent?limit=5
```

홈 화면 최근 기록 카드용 API입니다.

### Query

- `limit`: 선택값, 기본 5, 최대 20

### Response 200

```json
{
  "items": [
    {
      "id": "2a89d38f-c8e6-49af-b815-3e670a6f7bd8",
      "placeName": "제2학생회관 헬스장",
      "startedAt": "2026-05-26T09:12:30.000Z",
      "durationSeconds": 1800,
      "earnedXp": 120
    }
  ]
}
```

## 운영자용 NFC 관리 API

아래 API는 NFC 스티커를 운동 장소에 묶어 시연 환경을 구성할 때 사용합니다. 현재는 JWT 인증만 적용되어 있고, 별도 admin role guard는 아직 없습니다.

### 장소 + NFC 태그 동시 등록 (권장)

```http
POST /admin/nfc-tags/register
```

운영자가 새 운동 장소를 만들고 그 장소에 NFC 스티커를 한 번에 묶습니다. `hardwareUid`가 1차 식별자입니다.

#### Request

```json
{
  "hardwareUid": "04A1B2C3D4E5F6",
  "place": {
    "name": "GIST 체육관",
    "description": "시연용 운동 장소",
    "workoutType": "헬스",
    "latitude": 35.2131,
    "longitude": 126.8378
  },
  "tagMetadata": {
    "technologies": ["NfcA", "Ndef"],
    "ndefPayload": null
  }
}
```

- `place`는 항상 새로 생성됩니다.
- `tagMetadata`는 선택값입니다.
- 동일 `hardwareUid`로 다시 호출하면 기존 태그의 `placeId`/메타데이터가 새 장소 기준으로 갱신됩니다 (RETIRED 상태는 거부).

#### Response 201

```json
{
  "tag": {
    "id": 1,
    "hardwareUid": "04A1B2C3D4E5F6",
    "status": "ACTIVE"
  },
  "place": {
    "id": 10,
    "name": "GIST 체육관",
    "latitude": 35.2131,
    "longitude": 126.8378
  }
}
```

#### 주요 에러

- `400 Bad Request`: 필수 필드 누락
- `409 Retired NFC tag cannot be re-registered`: 이미 폐기된 태그
- `401 Unauthorized`: 토큰 없음/만료

### (레거시) NFC tagCode 기반 관리 API

기존 `tagCode` 기반 운영 API는 호환을 위해 그대로 유지됩니다. 신규 시연 환경에서는 위 `/admin/nfc-tags/register`를 사용하세요.

| Method | Path | 설명 |
| ------ | ---- | ---- |
| `POST` | `/nfc/issue` | 새 `tagCode` 발급 + UNASSIGNED 태그 생성 |
| `POST` | `/nfc/register` | `tagCode` 기반 등록/업데이트 |
| `PATCH` | `/nfc/{tagId}/place` | 장소 연결 변경 |
| `PATCH` | `/nfc/{tagId}/status` | 상태 변경 (UNASSIGNED/ACTIVE/INACTIVE/RETIRED) |

## 앱 연동 체크리스트

1. NFC 스캔 결과에서 칩의 `hardwareUid`(또는 NDEF payload)를 읽습니다.
2. `POST /tags/resolve`로 `hardwareUid`를 보내 장소를 검증합니다.
3. 성공 시 장소 확인 화면을 보여주고, 시작 버튼에서 `POST /workout-sessions/start`를 호출합니다 (`hardwareUid` + `placeId`).
4. 운동 화면에서는 로컬 타이머를 보여주되, 최종 시간은 서버 응답을 사용합니다.
5. 앱 재시작/background 복귀 시 `GET /workout-sessions/active`로 세션을 복구합니다.
6. 종료 버튼에서 `POST /workout-sessions/{sessionId}/finish`를 호출하고 결과 화면은 `record`와 `reward` 응답으로 구성합니다.
7. 홈 최근 기록 카드는 `GET /workout-records/me/recent?limit=5`를 사용합니다.
