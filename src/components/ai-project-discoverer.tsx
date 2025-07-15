'use client';
import { useState } from 'react';
import { discoverRelatedProjects } from '@/ai/flows/discover-related-projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AiProjectDiscoverer({ taskDescription }: { taskDescription: string | undefined }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDiscover = async () => {
    if (!taskDescription) {
      toast({
        variant: 'destructive',
        title: '설명 누락',
        description: '먼저 태스크 설명을 입력해주세요.',
      });
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const result = await discoverRelatedProjects({ taskDescription });
      if (result.relatedProjects && result.relatedProjects.length > 0) {
        setSuggestions(result.relatedProjects);
      } else {
         toast({ title: '추천 항목 없음', description: 'AI가 이 설명과 관련된 프로젝트를 찾지 못했습니다.' });
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'AI 오류',
        description: '추천을 받아오지 못했습니다. 나중에 다시 시도해주세요.',
      });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-accent/50 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="text-primary" />
          AI 프로젝트 탐색
        </CardTitle>
        <CardDescription>목표 달성에 도움이 될 만한 관련 프로젝트에 대한 AI 기반 추천을 받아보세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDiscover} disabled={loading || !taskDescription} className="w-full">
          {loading ? <Loader2 className="animate-spin" /> : '관련 프로젝트 탐색하기'}
        </Button>
        {suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm">추천:</h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
