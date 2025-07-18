'use client';

import { useEffect } from 'react';
import { useSupabaseSync } from '@/hooks/use-supabase-sync';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff } from 'lucide-react';

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { isOnline } = useSupabaseSync();

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        {!isOnline && (
          <Badge variant="secondary" className="gap-2">
            <CloudOff className="h-4 w-4" />
            오프라인 모드
          </Badge>
        )}
      </div>
    </>
  );
}