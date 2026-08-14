import { useEffect } from "react";

import { useLocalChatStore } from "@/src/features/chat/localChatStore";

export function useLocalChatLifecycle(userId: string | undefined, duoId: string | undefined) {
  const activeScopeKey = useLocalChatStore((state) => state.activeScopeKey);
  const reset = useLocalChatStore((state) => state.reset);

  useEffect(() => {
    if (!activeScopeKey) return;
    if (!userId || !duoId || !activeScopeKey.startsWith(`${userId}:${duoId}:`)) reset();
  }, [activeScopeKey, duoId, reset, userId]);
}
