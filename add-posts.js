// 추가 포스트 데이터만 삽입
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zvmwjdrdalnjvhnddssy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bXdqZHJkYWxuanZobmRkc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY3NTE0MywiZXhwIjoyMDY4MjUxMTQzfQ.XHz-qGX0SC3Ci1Jo4Dq0T8rHVKZdaV0pOf2yi9bZ7ck';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPosts() {
  try {
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .insert([
        {
          task_id: '192fe276-6889-4413-b010-9e5f8ea7e4a7',
          title: '분기 실적 분석 완료',
          content: '3분기 실적을 분석하고 4분기 목표를 설정했습니다. 목표 달성률 110%를 기록했습니다.'
        },
        {
          task_id: '7418a840-435f-47f7-b712-483baed1a653', 
          title: '사용자 피드백 반영',
          content: '사용자들의 요청사항을 반영하여 UI/UX를 개선했습니다. 사용자 만족도가 크게 향상되었습니다.'
        },
        {
          task_id: 'ea0f5388-ef3f-41b9-a7b5-096c2fdfbdea',
          title: '헬스장 등록 완료',
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
          content: '이번 주 구매 대행 건수가 지난 주 대비 30% 증가했습니다. 고객 만족도도 높아지고 있습니다.'
        },
        {
          task_id: '69028bc0-a629-4555-9e81-87d72e8edbc9',
          title: '개인 브랜딩 전략 수립',
          content: 'SNS 마케팅 전략을 수립하고 콘텐츠 계획을 세웠습니다. 팔로워 증가가 기대됩니다.'
        }
      ]);

    if (postError) {
      console.error('Post insertion error:', postError);
      return;
    }

    console.log('Additional posts inserted successfully:', posts?.length || 6);

  } catch (error) {
    console.error('Error adding posts:', error);
  }
}

addPosts();