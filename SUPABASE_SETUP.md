# Supabase 설정 가이드

이 가이드는 태스크 관리 앱을 위한 Supabase 데이터베이스 설정 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성하세요.
2. 프로젝트 이름과 비밀번호를 설정하세요.
3. 지역을 선택하세요 (한국 사용자는 ap-northeast-1 추천).

## 2. 데이터베이스 스키마 생성

프로젝트 대시보드에서 SQL Editor로 이동하여 다음 SQL을 실행하세요:

```sql
-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_posts_task_id ON public.posts(task_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now)
CREATE POLICY "Enable all operations for tasks" ON public.tasks 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for posts" ON public.posts 
    FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tasks table
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## 3. 환경 변수 설정

`.env.local` 파일에 다음 내용을 추가하세요:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- `NEXT_PUBLIC_SUPABASE_URL`: 프로젝트 설정 > API에서 확인
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 프로젝트 설정 > API에서 확인

## 4. 실시간 기능 활성화

1. Supabase 대시보드에서 Database > Replication으로 이동
2. `tasks`와 `posts` 테이블에 대한 실시간 복제를 활성화하세요.

## 5. 테스트

앱을 실행하고 다음을 확인하세요:

1. 태스크 생성/수정/삭제가 정상 작동하는지
2. 게시물 생성/삭제가 정상 작동하는지
3. 다른 기기에서 접속했을 때 데이터가 동기화되는지
4. 오프라인 상태에서도 앱이 정상 작동하는지

## 주요 기능

- **실시간 동기화**: 여러 기기에서 실시간으로 데이터 동기화
- **오프라인 지원**: 인터넷 연결이 없어도 앱 사용 가능
- **자동 백업**: 온라인 상태가 되면 자동으로 Supabase와 동기화
- **충돌 해결**: 마지막 수정 시간 기준으로 충돌 해결

## 보안 고려사항

현재 설정은 개발/테스트용입니다. 운영 환경에서는 다음을 고려하세요:

1. **인증 추가**: Supabase Auth를 사용하여 사용자 인증 구현
2. **RLS 정책 강화**: 사용자별 데이터 접근 제한
3. **API 키 보안**: 환경 변수 관리 강화

## 문제 해결

1. **데이터가 동기화되지 않는 경우**:
   - 인터넷 연결 확인
   - 환경 변수 설정 확인
   - 브라우저 콘솔에서 에러 확인

2. **실시간 업데이트가 작동하지 않는 경우**:
   - Supabase 실시간 기능 활성화 확인
   - 웹소켓 연결 상태 확인

3. **데이터베이스 연결 오류**:
   - Supabase 프로젝트 상태 확인
   - API 키 유효성 확인