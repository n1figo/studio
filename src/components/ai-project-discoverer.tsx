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
        title: 'Missing Description',
        description: 'Please provide a task description first.',
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
         toast({ title: 'No suggestions found', description: 'The AI could not find related projects for this description.' });
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to get suggestions. Please try again later.',
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
          AI Project Discovery
        </CardTitle>
        <CardDescription>Get AI-powered suggestions for related projects to enhance your goals.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDiscover} disabled={loading || !taskDescription} className="w-full">
          {loading ? <Loader2 className="animate-spin" /> : 'Discover Related Projects'}
        </Button>
        {suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm">Suggestions:</h3>
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
