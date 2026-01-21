import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Button } from '@/components/ui/button';
import { useKeyboardAdjustment, useVisualViewport } from '@/hooks/useKeyboard';
import { useAuth } from '@/hooks/useAuth';

function RootComponent() {
  // Handle keyboard adjustments for mobile
  useKeyboardAdjustment();
  useVisualViewport();

  const { isAuthenticated, user, isLoading, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span>🍳</span>
            <span>家庭食谱</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/" activeProps={{ className: 'bg-accent' }}>
                首页
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/settings" activeProps={{ className: 'bg-accent' }}>
                设置
              </Link>
            </Button>

            {/* 认证区域 */}
            {isLoading ? (
              <span className="text-sm text-muted-foreground">...</span>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  登出
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm" asChild className="ml-2">
                <Link to="/login">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
