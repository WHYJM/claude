// ============================================
// Smart Kitchen - 认证状态 Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { AuthState, SignInRequest, SignUpRequest, AuthResult } from '../types/auth';

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

// 模块级状态管理
let currentState: AuthState = initialState;
const listeners = new Set<(state: AuthState) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(currentState));
}

function setState(newState: Partial<AuthState>) {
  currentState = { ...currentState, ...newState };
  notifyListeners();
}

// 检查登录状态
async function checkAuth() {
  try {
    const response = await authService.getMe();
    setState({
      isAuthenticated: response.authenticated,
      user: response.user,
      expiresAt: response.expiresAt,
      isLoading: false,
    });
  } catch {
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  }
}

// 应用启动时检查登录状态
checkAuth();

export function useAuth() {
  const [state, setLocalState] = useState<AuthState>(currentState);

  useEffect(() => {
    const listener = (newState: AuthState) => setLocalState(newState);
    listeners.add(listener);
    // 同步初始状态
    setLocalState(currentState);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const signIn = useCallback(async (data: SignInRequest): Promise<AuthResult> => {
    setState({ isLoading: true });
    try {
      const result = await authService.signIn(data);
      setState({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      setState({ isLoading: false });
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败',
      };
    }
  }, []);

  const signUp = useCallback(async (data: SignUpRequest): Promise<AuthResult> => {
    setState({ isLoading: true });
    try {
      const result = await authService.signUp(data);
      setState({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      setState({ isLoading: false });
      return {
        success: false,
        error: error instanceof Error ? error.message : '注册失败',
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshAuth,
  };
}
