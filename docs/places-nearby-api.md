# Gistag 장소 지도 API 연동 가이드

지도 화면에서 현재 사용자 주변의 운동 장소를 표시하기 위한 API입니다. 장소 데이터는 `places` 테이블의 `latitude`, `longitude` 값을 기준으로 필터링됩니다.

## 장소 데이터 삽입 SQL

데이터셋을 DB에 넣을 때는 아래 bulk insert 형태를 사용하면 됩니다. `latitude`, `longitude`가 있는 장소만 `GET /places/nearby` 결과에 포함됩니다.

```sql
INSERT INTO "places" (
  "place_name",
  "description",
  "category",
  "image_url",
  "latitude",
  "longitude",
  "distance_text",
  "estimated_duration_minutes",
  "sort_order",
  "is_recommended"
)
VALUES
  (
    '런닝코스 CP1 (대학원기숙사 게시판)',
    '러닝 코스 체크포인트',
    'running',
    NULL,
    35.227179017047455,
    126.83801592988652,
    '대학원기숙사 게시판',
    10,
    0,
    true
  ),
  (
    '운동장',
    '야외 운동장',
    'field',
    NULL,
    35.225092129695625,
    126.83950847322274,
    NULL,
    60,
    1,
    true
  ),
  (
    '배구코트',
    '야외 배구코트',
    'court',
    NULL,
    35.225092129695625,
    126.83950847322274,
    '운동장과 같은 위치',
    60,
    2,
    true
  ),
  (
    '체육관',
    '실내 체육관',
    'gym',
    NULL,
    35.226194175156394,
    126.83792726400596,
    NULL,
    60,
    3,
    true
  ),
  (
    '체육관 헬스장',
    '체육관 내 헬스장',
    'gym',
    NULL,
    35.22653018747589,
    126.83812157368946,
    NULL,
    60,
    4,
    true
  ),
  (
    '런닝코스 CP2 (대학원기숙사 9동)',
    '러닝 코스 체크포인트',
    'running',
    NULL,
    35.228570311108804,
    126.83873817083756,
    '대학원기숙사 9동',
    10,
    5,
    true
  ),
  (
    '런닝코스 CP3 (중앙도서관)',
    '러닝 코스 체크포인트',
    'running',
    NULL,
    35.23002464579894,
    126.84285746605113,
    '중앙도서관',
    10,
    6,
    true
  ),
  (
    '2학 헬스장',
    '제2학생회관 헬스장',
    'gym',
    NULL,
    35.229857050102645,
    126.84570293420097,
    NULL,
    60,
    7,
    true
  ),
  (
    '2학 수영장',
    '제2학생회관 수영장',
    'pool',
    NULL,
    35.22976287030615,
    126.8460656209217,
    NULL,
    60,
    8,
    true
  ),
  (
    '풋살장',
    '야외 풋살장',
    'futsal',
    NULL,
    35.22809404987652,
    126.84679652111815,
    NULL,
    60,
    9,
    true
  ),
  (
    '런닝코스 CP4 (대학기숙사 A동 앞)',
    '러닝 코스 체크포인트',
    'running',
    NULL,
    35.2291081928868,
    126.84689622612856,
    '대학기숙사 A동 앞',
    10,
    10,
    true
  ),
  (
    '학생기숙사 헬스장',
    '학생기숙사 헬스장',
    'gym',
    NULL,
    35.228939804304204,
    126.84738262838628,
    NULL,
    60,
    11,
    true
  )
ON CONFLICT DO NOTHING;
```

실제 데이터셋을 전달받으면 위 `VALUES` 블록만 데이터셋 기준으로 생성하면 됩니다.

### 컬럼 설명

- `place_name`: 앱에 표시할 장소명입니다.
- `description`: 장소 설명입니다. 없으면 `NULL`을 넣습니다.
- `category`: `gym`, `running`, `court`, `field` 등 앱에서 분류에 사용할 문자열입니다.
- `image_url`: 장소 이미지 URL입니다. 없으면 `NULL`을 넣습니다.
- `latitude`, `longitude`: 지도 표시와 주변 조회에 사용하는 좌표입니다.
- `distance_text`: 사람이 읽는 위치 설명입니다. 예: `중앙도서관에서 도보 약 5분`
- `estimated_duration_minutes`: 추천 운동 시간 또는 예상 이용 시간입니다.
- `sort_order`: 추천/목록 정렬 보조값입니다.
- `is_recommended`: 추천 장소 API 포함 여부입니다.

## 주변 장소 조회 API

```http
GET /places/nearby?lat={lat}&lng={lng}&radius={radius}
```

현재 위치 기준 반경 안에 있는 장소를 거리순으로 반환합니다.

### 인증

현재 `places` API는 공개 API입니다. JWT access token은 필요하지 않습니다.

### Query

| 이름     | 타입   | 필수     | 설명               |
| -------- | ------ | -------- | ------------------ |
| `lat`    | number | required | 사용자 현재 위도   |
| `lng`    | number | required | 사용자 현재 경도   |
| `radius` | number | required | 조회 반경, 단위 km |

검증 범위:

- `lat`: -90 이상 90 이하
- `lng`: -180 이상 180 이하
- `radius`: 0.1 이상 50 이하

### Request 예시

```http
GET /places/nearby?lat=35.2131&lng=126.8378&radius=1.5
```

### Response 200

```json
[
  {
    "id": 1,
    "placeName": "제2학생회관 헬스장",
    "description": "캠퍼스 내 헬스장",
    "category": "gym",
    "imageUrl": null,
    "latitude": 35.2131,
    "longitude": 126.8378,
    "distanceText": "중앙도서관에서 도보 약 5분",
    "estimatedDurationMinutes": 60,
    "createdAt": "2026-05-26T04:00:00.000Z",
    "distanceKm": 0
  },
  {
    "id": 2,
    "placeName": "GIST 대학 기숙사 A동 러닝 코스",
    "description": "기숙사 주변 러닝 코스",
    "category": "running",
    "imageUrl": null,
    "latitude": 35.214,
    "longitude": 126.8385,
    "distanceText": "기숙사 A동 인근",
    "estimatedDurationMinutes": 30,
    "createdAt": "2026-05-26T04:00:00.000Z",
    "distanceKm": 0.12
  }
]
```

### 빈 결과

반경 안에 장소가 없으면 빈 배열을 반환합니다.

```json
[]
```

### 주요 에러

쿼리 값이 없거나 범위를 벗어나면 `400 Bad Request`가 반환됩니다.

```json
{
  "message": [
    "lat must not be greater than 90",
    "radius must not be less than 0.1"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## 앱 연동 체크리스트

1. 지도 진입 시 기기의 현재 위치 권한을 확인합니다.
2. 현재 위치를 얻으면 `GET /places/nearby?lat=&lng=&radius=`를 호출합니다.
3. 응답의 `latitude`, `longitude`로 마커를 표시합니다.
4. 마커/카드에는 `placeName`, `category`, `distanceKm`, `distanceText`를 우선 표시합니다.
5. 사용자가 장소를 선택하면 기존 `GET /places/{id}` 또는 NFC flow의 `POST /tags/resolve` 결과와 연결해 상세 화면을 구성합니다.
