import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Button } from '@/components/ui/button';
import { useKeyboardAdjustment, useVisualViewport } from '@/hooks/useKeyboard';

function RootComponent() {
  // Handle keyboard adjustments for mobile
  useKeyboardAdjustment();
  useVisualViewport();

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
