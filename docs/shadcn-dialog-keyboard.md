# shadcn/ui Dialog 键盘适配指南

## 快速开始

键盘适配已全局启用，shadcn/ui 组件自动支持。

## 基础用法

### 1. 简单表单弹窗

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

function RecipeDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>新建食谱</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>新建食谱</DialogTitle>
        </DialogHeader>

        {/* 使用 ScrollArea 包裹内容 */}
        <ScrollArea className="max-h-[60vh] pr-4">
          <form className="space-y-4">
            <div>
              <label>食谱名称</label>
              <input type="text" className="w-full" />
            </div>

            <div>
              <label>描述</label>
              <textarea rows={4} className="w-full" />
            </div>

            {/* 更多字段... */}
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. 长内容弹窗

```tsx
function EditRecipeDialog({ recipe }: { recipe: Recipe }) {
  return (
    <Dialog>
      <DialogContent className="max-w-2xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>编辑食谱</DialogTitle>
          <DialogDescription>
            修改食谱信息并保存
          </DialogDescription>
        </DialogHeader>

        {/* ScrollArea 自动处理键盘适配 */}
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* 基本信息 */}
            <section>
              <h3>基本信息</h3>
              <input type="text" defaultValue={recipe.name} />
              <textarea defaultValue={recipe.description} rows={3} />
            </section>

            {/* 食材列表 */}
            <section>
              <h3>食材</h3>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" defaultValue={ing.name} />
                  <input type="text" defaultValue={ing.amount} />
                </div>
              ))}
            </section>

            {/* 步骤 */}
            <section>
              <h3>步骤</h3>
              {recipe.steps.map((step, i) => (
                <textarea key={i} defaultValue={step} rows={2} />
              ))}
            </section>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline">取消</Button>
          <Button>保存更改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. 不使用 ScrollArea（手动控制）

如果不想使用 ScrollArea 组件，可以手动添加 `data-dialog-content` 属性：

```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>表单</DialogTitle>
    </DialogHeader>

    {/* 手动添加 data-dialog-content 属性 */}
    <div
      data-dialog-content
      className="max-h-[70vh] overflow-y-auto pr-2"
    >
      <form className="space-y-4">
        {/* 表单内容 */}
      </form>
    </div>

    <DialogFooter>
      <Button>提交</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 推荐的高度设置

### 移动端优化

```tsx
<DialogContent className="max-h-[95vh] sm:max-h-none">
  <ScrollArea className="max-h-[70vh] sm:max-h-[600px]">
    {/* 内容 */}
  </ScrollArea>
</DialogContent>
```

说明：
- `max-h-[95vh]` - 移动端弹窗最大高度
- `sm:max-h-none` - 桌面端不限制高度
- `max-h-[70vh]` - 移动端内容区域高度（预留空间给键盘）
- `sm:max-h-[600px]` - 桌面端固定高度

## 常见场景

### 场景 1：多步骤表单

```tsx
function MultiStepDialog() {
  const [step, setStep] = useState(1);

  return (
    <Dialog>
      <DialogContent className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>步骤 {step}/3</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          {step === 1 && <Step1Form />}
          {step === 2 && <Step2Form />}
          {step === 3 && <Step3Form />}
        </ScrollArea>

        <DialogFooter>
          {step > 1 && <Button onClick={() => setStep(step - 1)}>上一步</Button>}
          {step < 3 && <Button onClick={() => setStep(step + 1)}>下一步</Button>}
          {step === 3 && <Button>完成</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 场景 2：搜索+列表

```tsx
function SearchDialog() {
  return (
    <Dialog>
      <DialogContent className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>搜索食谱</DialogTitle>
        </DialogHeader>

        {/* 搜索框固定在顶部 */}
        <input
          type="search"
          placeholder="搜索..."
          className="w-full mb-4"
        />

        {/* 结果列表可滚动 */}
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2">
            {results.map(item => (
              <div key={item.id} className="p-4 border rounded">
                {item.name}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

## 样式自定义

### 调整滚动区域内边距

```tsx
{/* 增加右侧内边距，避免滚动条遮挡内容 */}
<ScrollArea className="max-h-[70vh]">
  <div className="pr-4">
    {/* 内容 */}
  </div>
</ScrollArea>
```

### 自定义移动端行为

```tsx
<DialogContent
  className={cn(
    "max-h-[95vh]",
    "max-w-[calc(100vw-2rem)]", // 移动端留边距
    "sm:max-w-2xl" // 桌面端固定宽度
  )}
>
  <ScrollArea className="max-h-[calc(95vh-10rem)]">
    {/* 内容 */}
  </ScrollArea>
</DialogContent>
```

## 最佳实践

### ✅ 推荐

1. **使用 ScrollArea**
   ```tsx
   <ScrollArea className="max-h-[70vh]">
     <form>{/* 内容 */}</form>
   </ScrollArea>
   ```

2. **固定标题和底部按钮**
   ```tsx
   <DialogHeader>{/* 固定 */}</DialogHeader>
   <ScrollArea>{/* 可滚动 */}</ScrollArea>
   <DialogFooter>{/* 固定 */}</DialogFooter>
   ```

3. **响应式高度**
   ```tsx
   className="max-h-[70vh] sm:max-h-[600px]"
   ```

### ❌ 避免

1. **不要让整个 Dialog 滚动**
   ```tsx
   {/* ❌ 错误 */}
   <DialogContent className="overflow-y-auto">
     <form>{/* 很长的内容 */}</form>
   </DialogContent>
   ```

2. **不要使用固定高度（移动端）**
   ```tsx
   {/* ❌ 错误 - 键盘弹起时会被遮挡 */}
   <ScrollArea className="h-[500px]">
   ```

3. **不要忘记预留空间**
   ```tsx
   {/* ❌ 错误 - 会占满整个视口 */}
   <ScrollArea className="max-h-[100vh]">
   ```

## 工作原理

1. **自动检测**：系统自动检测 `data-slot="scroll-area-viewport"`
2. **智能滚动**：输入框聚焦时，只滚动 ScrollArea 内容
3. **动态高度**：使用 `dvh` 单位适配键盘高度
4. **防止缩放**：iOS 输入框字体大小自动调整为 16px

## 调试技巧

### 检查滚动容器

在浏览器开发工具中检查元素，确认：
- ScrollArea 有 `data-slot="scroll-area-viewport"` 属性
- 该元素有 `overflow-y: auto` 样式
- 高度使用 `max-h-[XXvh]` 设置

### 测试键盘弹起

1. 在移动设备上打开弹窗
2. 点击输入框
3. 观察是否自动滚动到可见区域
4. 检查是否可以滚动查看其他内容
