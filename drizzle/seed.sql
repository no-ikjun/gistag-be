-- Example places and NFC tag (run after migrations). Adjust coordinates as needed.
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
) VALUES
  (
    '제2학생회관 헬스장',
    '캠퍼스 내 헬스장',
    'gym',
    NULL,
    35.2131,
    126.8378,
    '중앙도서관에서 도보 약 5분',
    60,
    0,
    true
  ),
  (
    'GIST 대학 기숙사 A동 러닝 코스',
    '기숙사 주변 러닝 코스',
    'running',
    NULL,
    35.2140,
    126.8385,
    '기숙사 A동 인근',
    30,
    1,
    true
  );

INSERT INTO "nfc_tags" (
  "tag_code",
  "place_id",
  "status",
  "ndef_payload",
  "ndef_type",
  "activated_at"
)
VALUES (
  'GISTAG_TAG_DEMO_001',
  1,
  'ACTIVE',
  'gistag://tag/GISTAG_TAG_DEMO_001',
  'URI',
  now()
);
