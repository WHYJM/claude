import { useState, useEffect } from 'react';
import { collaborationService, type CollaborationState } from '../services/collaborationService';

export function useCollaboration() {
  const [state, setState] = useState<CollaborationState>(() =>
    collaborationService.getState()
  );

  useEffect(() => {
    const unsubscribe = collaborationService.onStateChange(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

// TODO: 项目级别的协同 hooks 将在后续实现
// 目前协同功能暂时不可用
