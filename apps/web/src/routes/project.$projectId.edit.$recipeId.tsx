import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { recipeService } from '@/services/recipeService';
import type { RecipeFormData } from '@/types/recipe';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/project/$projectId/edit/$recipeId')({
  component: EditRecipePage,
});

function EditRecipePage() {
  const { projectId, recipeId } = Route.useParams();
  const navigate = useNavigate();
  const recipe = recipeService.getRecipeById(projectId, recipeId);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold text-muted-foreground">食谱不存在</h2>
        <Button asChild>
          <Link to="/project/$projectId" params={{ projectId }}>返回项目</Link>
        </Button>
      </div>
    );
  }

  const [formData, setFormData] = useState<RecipeFormData>({
    name: recipe.name,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    category: recipe.category,
    tags: recipe.tags,
    imageUrl: recipe.imageUrl,
  });

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
    recipeService.updateRecipe(projectId, recipeId, formData);
    navigate({ to: '/project/$projectId/recipe/$recipeId', params: { projectId, recipeId } });
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个食谱吗？此操作无法撤销。')) {
      recipeService.deleteRecipe(projectId, recipeId);
      navigate({ to: '/project/$projectId', params: { projectId } });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/project/$projectId/recipe/$recipeId" params={{ projectId, recipeId }}>
              <span className="mr-1">&larr;</span> 返回
            </Link>
          </Button>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          删除食谱
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>编辑食谱</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Button type="submit">保存修改</Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/project/$projectId/recipe/$recipeId" params={{ projectId, recipeId }}>取消</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
