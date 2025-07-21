-- Insert initial tasks data
INSERT INTO tasks (id, name, icon, color, description, created_at, updated_at) VALUES
  ('192fe276-6889-4413-b010-9e5f8ea7e4a7', '사업보고서', 'FileText', '#ef4444', '월간 사업 보고서 작성 및 분석', now(), now()),
  ('7418a840-435f-47f7-b712-483baed1a653', 'roommatesellers', 'Users', '#3b82f6', '룸메이트 셀러 관리 시스템', now(), now()),
  ('ea0f5388-ef3f-41b9-a7b5-096c2fdfbdea', '운동', 'Dumbbell', '#10b981', '주 3회 헬스장 운동 및 건강 관리', now(), now()),
  ('bf90f124-bcf6-43f5-8f8f-938466be1cbe', '썸머&호도로', 'Coffee', '#f59e0b', '카페 프로젝트 관리 및 운영', now(), now()),
  ('f3d3ec10-5295-49a9-8dc7-d286d992c287', '구메대행', 'ShoppingCart', '#f97316', '구매 대행 서비스 관리', now(), now()),
  ('69028bc0-a629-4555-9e81-87d72e8edbc9', '명성하기', 'Star', '#a855f7', '개인 브랜딩 및 명성 관리', now(), now());

-- Insert some initial posts data
INSERT INTO posts (id, task_id, title, content, created_at) VALUES
  (gen_random_uuid(), '192fe276-6889-4413-b010-9e5f8ea7e4a7', '7월 월간 보고서', '이번 달 주요 성과와 개선사항을 정리했습니다.', now()),
  (gen_random_uuid(), '7418a840-435f-47f7-b712-483baed1a653', '시스템 업데이트', '룸메이트 매칭 알고리즘을 개선했습니다.', now()),
  (gen_random_uuid(), 'ea0f5388-ef3f-41b9-a7b5-096c2fdfbdea', '운동 계획', '이번 주 운동 루틴을 계획했습니다.', now());