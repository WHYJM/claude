// [IN]: React, TanStack Router, routeTree.gen, index.css / React、TanStack Router、生成的路由树、全局样式
// [OUT]: Renders React app to DOM root element / 将 React 应用渲染到 DOM 根元素
// [POS]: Application entry point, initializes router and mounts React / 应用入口，初始化路由并挂载 React
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({
  routeTree,
  basepath: '/claude'
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
