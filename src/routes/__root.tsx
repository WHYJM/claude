import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">🍳 家庭食谱</h1>
          <div className="nav-links">
            <Link to="/" className="nav-link" activeProps={{ className: 'active' }}>
              食谱
            </Link>
            <Link to="/fridge" className="nav-link" activeProps={{ className: 'active' }}>
              冰箱
            </Link>
            <Link to="/recommend" className="nav-link" activeProps={{ className: 'active' }}>
              AI推荐
            </Link>
            <Link to="/settings" className="nav-link" activeProps={{ className: 'active' }}>
              设置
            </Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
