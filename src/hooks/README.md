# 移动端键盘适配使用指南

## 基础用法

键盘适配已在应用根组件中全局启用，无需额外配置。

## 弹窗/对话框场景

### 1. 使用 Radix UI Dialog

确保 Dialog 组件正确标记可滚动区域：

```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';

function MyDialog() {
  return (
    <Dialog>
      <DialogContent>
        {/* 可滚动内容区域 */}
        <div data-dialog-content className="max-h-[70vh] overflow-y-auto">
          <form>
            <input type="text" placeholder="姓名" />
            <textarea placeholder="描述" />
            {/* 更多表单字段 */}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. 自定义弹窗

对于自定义弹窗组件，添加必要的属性：

```tsx
function CustomModal({ children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="dialog-content"
    >
      {/* 可滚动区域 */}
      <div
        data-dialog-content
        className="dialog-scroll-area max-h-[80vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}
```

### 3. 关键属性说明

- `role="dialog"` 或 `role="alertdialog"` - 标识弹窗
- `data-dialog-content` - 标记可滚动内容区域
- `.dialog-scroll-area` - 可选的 CSS 类名

## CSS 工具类

### 动态视口高度

```tsx
// 使用动态视口高度，自动适应键盘
<div className="h-screen-safe">
  {/* 内容 */}
</div>

<div className="min-h-screen-safe">
  {/* 内容 */}
</div>
```

### 弹窗高度限制

```tsx
// 移动端自动适配键盘高度
<DialogContent className="max-h-[90vh] md:max-h-none">
  <div data-dialog-content className="overflow-y-auto">
    {/* 表单内容 */}
  </div>
</DialogContent>
```

## 最佳实践

### 1. 表单在弹窗中

```tsx
<Dialog>
  <DialogContent>
    {/* 可滚动区域，限制高度 */}
    <ScrollArea className="max-h-[70vh]" data-dialog-content>
      <form className="space-y-4 p-4">
        <input type="text" />
        <textarea rows={4} />
        <button type="submit">提交</button>
      </form>
    </ScrollArea>
  </DialogContent>
</Dialog>
```

### 2. 长内容弹窗

```tsx
<Dialog>
  <DialogContent className="max-w-2xl">
    {/* 标题固定 */}
    <DialogHeader>
      <DialogTitle>编辑食谱</DialogTitle>
    </DialogHeader>

    {/* 内容可滚动 */}
    <div
      data-dialog-content
      className="max-h-[60vh] overflow-y-auto px-1"
    >
      {/* 长表单内容 */}
    </div>

    {/* 底部按钮固定 */}
    <DialogFooter>
      <Button>保存</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3. 避免的问题

❌ **错误做法**
```tsx
// 没有标记可滚动区域
<Dialog>
  <DialogContent>
    <form>
      {/* 很多输入框 */}
    </form>
  </DialogContent>
</Dialog>
```

✅ **正确做法**
```tsx
// 明确标记可滚动区域
<Dialog>
  <DialogContent>
    <div data-dialog-content className="max-h-[70vh] overflow-y-auto">
      <form>
        {/* 很多输入框 */}
      </form>
    </div>
  </DialogContent>
</Dialog>
```

## 技术说明

### 自动滚动逻辑

1. 检测输入框是否在弹窗内
2. 如果在弹窗内，滚动弹窗的内容区域（而不是整个页面）
3. 计算输入框相对于视口的位置
4. 确保输入框在键盘上方可见

### CSS 变量

- `--viewport-height` - 动态更新的视口高度
- 在键盘弹起时会自动更新
- 可在 CSS 中使用：`height: var(--viewport-height)`

### 浏览器兼容性

- ✅ iOS Safari 13+
- ✅ Chrome/Edge Android
- ✅ Firefox Mobile
- ⚠️ 旧版浏览器会回退到标准行为
