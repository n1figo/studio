// 초기 데이터 삽입 스크립트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zvmwjdrdalnjvhnddssy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bXdqZHJkYWxuanZobmRkc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY3NTE0MywiZXhwIjoyMDY4MjUxMTQzfQ.XHz-qGX0SC3Ci1Jo4Dq0T8rHVKZdaV0pOf2yi9bZ7ck';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initData() {
  try {
    // 기존 데이터 완전 삭제
    const { error: deletePostsError } = await supabase.from('posts').delete().gte('created_at', '1900-01-01');
    const { error: deleteTasksError } = await supabase.from('tasks').delete().gte('created_at', '1900-01-01');
    
    if (deletePostsError) console.log('Posts delete error:', deletePostsError);
    if (deleteTasksError) console.log('Tasks delete error:', deleteTasksError);
    
    // 태스크 데이터 삽입
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .insert([
        {
          id: '192fe276-6889-4413-b010-9e5f8ea7e4a7',
          name: '사업보고서',
          icon: 'FileText',
          color: '#ef4444',
          description: '월간 사업 보고서 작성 및 분석'
        },
        {
          id: '7418a840-435f-47f7-b712-483baed1a653',
          name: 'roommatesellers',
          icon: 'Users',
          color: '#3b82f6',
          description: '룸메이트 셀러 관리 시스템'
        },
        {
          id: 'ea0f5388-ef3f-41b9-a7b5-096c2fdfbdea',
          name: '운동',
          icon: 'Dumbbell',
          color: '#10b981',
          description: '주 3회 헬스장 운동 및 건강 관리'
        },
        {
          id: 'bf90f124-bcf6-43f5-8f8f-938466be1cbe',
          name: '썸머&호도로',
          icon: 'Coffee',
          color: '#f59e0b',
          description: '카페 프로젝트 관리 및 운영'
        },
        {
          id: 'f3d3ec10-5295-49a9-8dc7-d286d992c287',
          name: '구메대행',
          icon: 'ShoppingCart',
          color: '#f97316',
          description: '구매 대행 서비스 관리'
        },
        {
          id: '69028bc0-a629-4555-9e81-87d72e8edbc9',
          name: '명성하기',
          icon: 'Star',
          color: '#a855f7',
          description: '개인 브랜딩 및 명성 관리'
        }
      ]);

    if (taskError) {
      console.error('Task insertion error:', taskError);
      return;
    }

    console.log('Tasks inserted successfully:', tasks?.length || 6);

    // 포스트 데이터 삽입
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .insert([
        {
          task_id: '192fe276-6889-4413-b010-9e5f8ea7e4a7',
          title: '7월 월간 보고서 작성 완료',
          content: '이번 달 주요 성과와 개선사항을 정리했습니다. 매출 증가율 15%, 고객 만족도 향상 등의 성과가 있었습니다.'
        },
        {
          task_id: '192fe276-6889-4413-b010-9e5f8ea7e4a7',
          title: '분기 실적 분석',
          content: '3분기 실적을 분석하고 4분기 목표를 설정했습니다.'
        },
        {
          task_id: '7418a840-435f-47f7-b712-483baed1a653',
          title: '시스템 업데이트 완료',
          content: '룸메이트 매칭 알고리즘을 개선했습니다. 매칭 정확도가 20% 향상되었습니다.'
        },
        {
          task_id: '7418a840-435f-47f7-b712-483baed1a653',
          title: '사용자 피드백 반영',
          content: '사용자들의 요청사항을 반영하여 UI/UX를 개선했습니다.'
        },
        {
          task_id: 'ea0f5388-ef3f-41b9-a7b5-096c2fdfbdea',
          title: '주간 운동 계획 완료',
          content: '이번 주 운동 루틴을 계획했습니다. 가슴 운동 2회, 등 운동 2회, 하체 운동 1회 예정입니다.'
        },
        {
          task_id: 'ea0f5388-ef3f-41b9-a7b5-096c2fdfbdea',
          title: '헬스장 등록',
          content: '새로운 헬스장에 등록했습니다. 최신 장비와 좋은 환경으로 운동 효율이 높아질 것 같습니다.'
        },
        {
          task_id: 'bf90f124-bcf6-43f5-8f8f-938466be1cbe',
          title: '카페 메뉴 개발',
          content: '신규 음료 메뉴 3종을 개발했습니다. 시그니처 음료로 출시 예정입니다.'
        },
        {
          task_id: 'f3d3ec10-5295-49a9-8dc7-d286d992c287',
          title: '구매 대행 건수 증가',
          content: '이번 주 구매 대행 건수가 지난 주 대비 30% 증가했습니다.'
        },
        {
          task_id: '69028bc0-a629-4555-9e81-87d72e8edbc9',
          title: '개인 브랜딩 전략 수립',
          content: 'SNS 마케팅 전략을 수립하고 콘텐츠 계획을 세웠습니다.'
        }
      ]);

    if (postError) {
      console.error('Post insertion error:', postError);
      return;
    }

    console.log('Posts inserted successfully:', posts?.length || 3);
    console.log('Initial data setup completed!');

  } catch (error) {
    console.error('Error setting up initial data:', error);
  }
}

initData();