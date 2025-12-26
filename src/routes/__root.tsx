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
              食谱列表
            </Link>
            <Link to="/new" className="nav-link" activeProps={{ className: 'active' }}>
              新建食谱
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
