// [IN]: React hooks, collaborationService / React 钩子、协作服务
// [OUT]: useCollaboration() hook - collaboration state subscription / useCollaboration() 钩子 - 协作状态订阅
// [POS]: State management layer, bridges collaborationService to React components / 状态管理层，桥接协作服务到 React 组件
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

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
