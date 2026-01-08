import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useCallback, useEffect } from 'react';
import { projectService } from '@/services/projectService';
import { recipeService } from '@/services/recipeService';
import { fridgeService, FRIDGE_CATEGORIES } from '@/services/fridgeService';
import { settingsService } from '@/services/settingsService';
import { collaborationService, type CollaborationState } from '@/services/collaborationService';
import { useCollaboration } from '@/hooks/useCollaboration';
import type { Recipe, FridgeItem, FridgeCategory, RecipeFormData } from '@/types/recipe';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/project/$projectId')({
  component: ProjectPage,
});

// 协同面板组件
function CollaborationPanel({
  projectId,
  collabState,
  recipes,
  fridgeItems,
  onDataChange,
}: {
  projectId: string;
  collabState: CollaborationState;
  recipes: Recipe[];
  fridgeItems: FridgeItem[];
  onDataChange: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [answerCode, setAnswerCode] = useState('');
  const settings = settingsService.getSettings();

  // 设置用户名
  useEffect(() => {
    if (settings.userName) {
      collaborationService.setUserName(settings.userName);
    }
  }, [settings.userName]);

  // 创建协同房间
  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const roomId = await collaborationService.createRoom();
      // 保存 roomId 到项目
      projectService.setProjectRoomId(projectId, roomId);
      // 导入本地数据到协同
      collaborationService.importFromLocal(recipes, fridgeItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建房间失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 复制连接代码
  const handleCopyOffer = async () => {
    const offer = collaborationService.getConnectionOffer();
    if (offer) {
      await navigator.clipboard.writeText(offer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 处理 answer（房主粘贴加入者的 answer）
  const handleSubmitAnswer = async () => {
    if (!answerCode.trim()) {
      alert('请粘贴连接响应代码');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await collaborationService.handleAnswer(answerCode.trim());
      setAnswerCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理响应失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 离开协同
  const handleLeaveRoom = () => {
    collaborationService.leaveRoom();
    setAnswerCode('');
    onDataChange();
  };

  // 如果已连接，显示协同状态
  if (collabState.isConnected) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            协同管理
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>协同编辑</DialogTitle>
            <DialogDescription>
              当前正在协同编辑此项目
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* 房间信息 */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">连接状态</span>
                <Badge variant="default">已连接</Badge>
              </div>
              {collabState.isHost && (
                <Badge variant="secondary">你是房主</Badge>
              )}
            </div>

            {/* 在线用户 */}
            <div>
              <h4 className="text-sm font-medium mb-2">在线用户 ({collabState.peers.length})</h4>
              <div className="space-y-2">
                {collabState.peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">{peer.name}</span>
                    {peer.id === collabState.peerId && (
                      <Badge variant="outline" className="text-xs">你</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" onClick={handleLeaveRoom}>
                离开协同
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 如果等待 answer，显示连接信息
  if (collabState.needsAnswer && collabState.connectionOffer) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <span className="animate-pulse absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full" />
            等待连接
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>等待对方连接</DialogTitle>
            <DialogDescription>
              请将连接信息发送给对方，然后粘贴对方的响应代码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* 步骤 1: 复制连接信息 */}
            <div className="space-y-2">
              <Label>步骤 1: 复制以下连接信息发送给对方</Label>
              <div className="relative">
                <Textarea
                  value={collabState.connectionOffer}
                  readOnly
                  className="font-mono text-xs h-32 resize-none pr-20"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={handleCopyOffer}
                >
                  {copied ? '已复制!' : '复制'}
                </Button>
              </div>
            </div>

            {/* 步骤 2: 粘贴响应代码 */}
            <div className="space-y-2">
              <Label htmlFor="answerCode">步骤 2: 粘贴对方的响应代码</Label>
              <Textarea
                id="answerCode"
                value={answerCode}
                onChange={(e) => setAnswerCode(e.target.value)}
                placeholder="粘贴对方返回的响应代码..."
                className="font-mono text-xs h-32 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmitAnswer} disabled={isLoading || !answerCode.trim()}>
                {isLoading ? '连接中...' : '完成连接'}
              </Button>
              <Button variant="outline" onClick={handleLeaveRoom}>
                取消协同
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 未连接状态
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          开启协同
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>开启协同编辑</DialogTitle>
          <DialogDescription>
            创建协同房间后，可以通过复制粘贴连接信息邀请其他人加入
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              开启协同后，你的食谱和冰箱数据将可以与其他人实时同步编辑。
            </p>
            <p className="text-sm text-muted-foreground">
              当前用户名：<strong>{settings.userName || '未设置'}</strong>
              {!settings.userName && (
                <span className="text-yellow-600 ml-1">
                  （建议先在设置中设置用户名）
                </span>
              )}
            </p>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm space-y-1">
              <p className="font-medium">连接步骤：</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>点击"创建协同房间"生成连接信息</li>
                <li>将连接信息发送给对方（微信/邮件等）</li>
                <li>对方使用连接信息加入并生成响应代码</li>
                <li>将对方的响应代码粘贴回来完成连接</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreateRoom} disabled={isLoading}>
              {isLoading ? '创建中...' : '创建协同房间'}
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProjectPage() {
  const { projectId } = Route.useParams();
  const project = projectService.getProjectById(projectId);
  const collabState = useCollaboration();

  const [activeTab, setActiveTab] = useState<'recipes' | 'fridge'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FridgeCategory | 'all'>('all');

  // Load data
  const loadData = useCallback(() => {
    setRecipes(recipeService.getAllRecipes(projectId));
    setFridgeItems(fridgeService.getAllItems(projectId));
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 监听协同数据变化
  useEffect(() => {
    if (collabState.isConnected) {
      const unsubscribe = collaborationService.onDataChange(() => {
        // 从协同数据同步到本地
        const collabRecipes = collaborationService.getAllRecipes();
        const collabFridgeItems = collaborationService.getAllFridgeItems();
        recipeService.syncFromCollab(projectId, collabRecipes);
        fridgeService.syncFromCollab(projectId, collabFridgeItems);
        loadData();
      });
      return () => unsubscribe();
    }
  }, [collabState.isConnected, projectId, loadData]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold text-muted-foreground">项目不存在</h2>
        <Button asChild>
          <Link to="/">返回首页</Link>
        </Button>
      </div>
    );
  }

  const filteredRecipes = searchQuery
    ? recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recipes;

  const filteredFridgeItems = selectedCategory === 'all'
    ? fridgeItems
    : fridgeItems.filter(item => item.category === selectedCategory);

  const expiringItems = fridgeService.getExpiringItems(projectId, 3);
  const expiredItems = fridgeService.getExpiredItems(projectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <span className="mr-1">&larr;</span> 返回
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground text-sm">{project.description}</p>
            )}
          </div>
          {collabState.isConnected && (
            <Badge variant="default" className="bg-green-600">
              协同中 · {collabState.peers.length} 人在线
            </Badge>
          )}
        </div>
        <CollaborationPanel
          projectId={projectId}
          collabState={collabState}
          recipes={recipes}
          fridgeItems={fridgeItems}
          onDataChange={loadData}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'recipes' | 'fridge')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="recipes">
            食谱 ({recipes.length})
          </TabsTrigger>
          <TabsTrigger value="fridge">
            冰箱 ({fridgeItems.length})
            {(expiringItems.length > 0 || expiredItems.length > 0) && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                {expiringItems.length + expiredItems.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Recipes Tab */}
        <TabsContent value="recipes" className="mt-6">
          <RecipesSection
            projectId={projectId}
            recipes={filteredRecipes}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={loadData}
          />
        </TabsContent>

        {/* Fridge Tab */}
        <TabsContent value="fridge" className="mt-6">
          <FridgeSection
            projectId={projectId}
            items={filteredFridgeItems}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            expiringItems={expiringItems}
            expiredItems={expiredItems}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Recipes Section Component
function RecipesSection({
  projectId,
  recipes,
  searchQuery,
  onSearchChange,
  onRefresh,
}: {
  projectId: string;
  recipes: Recipe[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const settings = settingsService.getSettings();
  const userName = settings.userName || '未命名用户';

  const handleAddRecipe = (data: RecipeFormData) => {
    recipeService.createRecipe(projectId, data, userName);
    onRefresh();
    setIsAddDialogOpen(false);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('确定要删除这个食谱吗？')) {
      recipeService.deleteRecipe(projectId, id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="搜索食谱..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>添加食谱</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加新食谱</DialogTitle>
            </DialogHeader>
            <RecipeForm onSubmit={handleAddRecipe} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">暂无食谱</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>添加第一个食谱</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              projectId={projectId}
              onDelete={() => handleDeleteRecipe(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Recipe Card Component
function RecipeCard({
  recipe,
  projectId,
  onDelete,
}: {
  recipe: Recipe;
  projectId: string;
  onDelete: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      {recipe.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{recipe.name}</CardTitle>
          <Badge variant="outline">{recipe.category}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground mb-3">
          <span>准备 {recipe.prepTime} 分钟</span>
          <span>烹饪 {recipe.cookTime} 分钟</span>
          <span>{recipe.servings} 人份</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/project/$projectId/recipe/$recipeId" params={{ projectId, recipeId: recipe.id }}>查看</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/project/$projectId/edit/$recipeId" params={{ projectId, recipeId: recipe.id }}>编辑</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
            删除
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Recipe Form Component
function RecipeForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: RecipeFormData;
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<RecipeFormData>(
    initialData || {
      name: '',
      description: '',
      ingredients: [],
      steps: [],
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      category: '家常菜',
      tags: [],
      imageUrl: '',
    }
  );

  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '' });
  const [newStep, setNewStep] = useState('');
  const [newTag, setNewTag] = useState('');

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, { ...newIngredient, id: uuidv4() }],
      });
      setNewIngredient({ name: '', amount: '', unit: '' });
    }
  };

  const removeIngredient = (id: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((i) => i.id !== id),
    });
  };

  const addStep = () => {
    if (newStep.trim()) {
      setFormData({ ...formData, steps: [...formData.steps, newStep.trim()] });
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入食谱名称');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">食谱名称 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：红烧肉"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">分类</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="例如：家常菜"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="简单描述这道菜..."
          rows={2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="prepTime">准备时间 (分钟)</Label>
          <Input
            id="prepTime"
            type="number"
            value={formData.prepTime}
            onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cookTime">烹饪时间 (分钟)</Label>
          <Input
            id="cookTime"
            type="number"
            value={formData.cookTime}
            onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servings">份量 (人份)</Label>
          <Input
            id="servings"
            type="number"
            value={formData.servings}
            onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">图片链接</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <Label>食材</Label>
        <div className="flex gap-2">
          <Input
            placeholder="食材名"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="用量"
            value={newIngredient.amount}
            onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
            className="w-20"
          />
          <Input
            placeholder="单位"
            value={newIngredient.unit}
            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
            className="w-20"
          />
          <Button type="button" variant="outline" onClick={addIngredient}>
            添加
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.ingredients.map((ing) => (
            <Badge key={ing.id} variant="secondary" className="gap-1">
              {ing.name} {ing.amount}{ing.unit}
              <button
                type="button"
                onClick={() => removeIngredient(ing.id)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <Label>步骤</Label>
        <div className="flex gap-2">
          <Textarea
            placeholder="描述步骤..."
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            rows={2}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addStep}>
            添加
          </Button>
        </div>
        <ol className="space-y-2 list-decimal list-inside">
          {formData.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-2 bg-muted p-2 rounded">
              <span className="flex-1">{step}</span>
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label>标签</Label>
        <div className="flex gap-2">
          <Input
            placeholder="添加标签..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="max-w-xs"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            添加
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit">保存</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

// Fridge Section Component
function FridgeSection({
  projectId,
  items,
  selectedCategory,
  onCategoryChange,
  expiringItems,
  expiredItems,
  onRefresh,
}: {
  projectId: string;
  items: FridgeItem[];
  selectedCategory: FridgeCategory | 'all';
  onCategoryChange: (cat: FridgeCategory | 'all') => void;
  expiringItems: FridgeItem[];
  expiredItems: FridgeItem[];
  onRefresh: () => void;
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);

  const handleAddItem = (data: Omit<FridgeItem, 'id' | 'addedAt' | 'updatedAt'>) => {
    fridgeService.addItem(projectId, data);
    onRefresh();
    setIsAddDialogOpen(false);
  };

  const handleUpdateItem = (id: string, data: Partial<FridgeItem>) => {
    fridgeService.updateItem(projectId, id, data);
    onRefresh();
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('确定要删除这个食材吗？')) {
      fridgeService.deleteItem(projectId, id);
      onRefresh();
    }
  };

  const getItemStatus = (item: FridgeItem) => {
    if (expiredItems.some(i => i.id === item.id)) return 'expired';
    if (expiringItems.some(i => i.id === item.id)) return 'expiring';
    return 'normal';
  };

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(expiredItems.length > 0 || expiringItems.length > 0) && (
        <div className="flex gap-2">
          {expiredItems.length > 0 && (
            <Badge variant="destructive">
              {expiredItems.length} 个已过期
            </Badge>
          )}
          {expiringItems.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {expiringItems.length} 个即将过期
            </Badge>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange('all')}
          >
            全部
          </Button>
          {FRIDGE_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>添加食材</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加食材</DialogTitle>
            </DialogHeader>
            <FridgeItemForm onSubmit={handleAddItem} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">冰箱是空的</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>添加第一个食材</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const status = getItemStatus(item);
            return (
              <Card
                key={item.id}
                className={
                  status === 'expired'
                    ? 'border-destructive bg-destructive/5'
                    : status === 'expiring'
                    ? 'border-yellow-500 bg-yellow-50'
                    : ''
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <CardDescription>
                    {item.amount} {item.unit}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {item.expiryDate && (
                    <p className={`text-sm mb-3 ${
                      status === 'expired' ? 'text-destructive' :
                      status === 'expiring' ? 'text-yellow-600' :
                      'text-muted-foreground'
                    }`}>
                      {status === 'expired' ? '已过期：' : '过期日期：'}
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                          编辑
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>编辑食材</DialogTitle>
                        </DialogHeader>
                        <FridgeItemForm
                          initialData={item}
                          onSubmit={(data) => handleUpdateItem(item.id, data)}
                          onCancel={() => setEditingItem(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-destructive"
                    >
                      删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Fridge Item Form Component
function FridgeItemForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: FridgeItem;
  onSubmit: (data: Omit<FridgeItem, 'id' | 'addedAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    amount: initialData?.amount || 1,
    unit: initialData?.unit || '个',
    category: initialData?.category || ('蔬菜' as FridgeCategory),
    expiryDate: initialData?.expiryDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入食材名称');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">食材名称 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例如：西红柿"
        />
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">数量</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">单位</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="个、斤、克..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">分类</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value as FridgeCategory })}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            {FRIDGE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiryDate">过期日期</Label>
        <Input
          id="expiryDate"
          type="date"
          value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit">保存</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}
