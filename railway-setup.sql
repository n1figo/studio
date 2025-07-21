-- Railway PostgreSQL 스키마 설정
-- Railway Console에서 "Data" 탭의 Query 에디터에서 실행하세요

-- UUID extension 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks 테이블 생성
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_task_id ON posts(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- 샘플 데이터 삽입
INSERT INTO tasks (name, icon, color, description) VALUES
('매각(쇼츠대행)', 'pen-square', 'hsl(347, 89%, 60%)', '쇼츠 대행 서비스 관련 업무'),
('사업보고서', 'star', 'hsl(280, 89%, 60%)', '사업 보고서 작성 및 관리'),
('룸메이트셀러', 'book', 'hsl(347, 89%, 60%)', '룸메이트 셀러 프로젝트'),
('쌉파호도리', 'code', 'hsl(210, 89%, 60%)', '개발 프로젝트'),
('구매대행', 'dumbbell', 'hsl(110, 89%, 60%)', '구매대행 서비스'),
('운동', 'plane', 'hsl(25, 89%, 60%)', '일일 운동 계획')
ON CONFLICT (id) DO NOTHING;