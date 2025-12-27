import { createFileRoute, Link } from '@tanstack/react-router';
import { recipeService } from '@/services/recipeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/project/$projectId/recipe/$recipeId')({
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const { projectId, recipeId } = Route.useParams();
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/project/$projectId" params={{ projectId }}>
            <span className="mr-1">&larr;</span> 返回
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Title and Image */}
          {recipe.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{recipe.name}</h1>
              <p className="text-muted-foreground mt-2">{recipe.description}</p>
            </div>
            <Button asChild>
              <Link to="/project/$projectId/edit/$recipeId" params={{ projectId, recipeId: recipe.id }}>编辑</Link>
            </Button>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 py-4 bg-muted/50 rounded-lg px-4">
            <div>
              <p className="text-sm text-muted-foreground">准备时间</p>
              <p className="font-semibold">{recipe.prepTime} 分钟</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">烹饪时间</p>
              <p className="font-semibold">{recipe.cookTime} 分钟</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">份量</p>
              <p className="font-semibold">{recipe.servings} 人份</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">分类</p>
              <p className="font-semibold">{recipe.category}</p>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Ingredients */}
          <div>
            <h2 className="text-xl font-semibold mb-4">食材</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {recipe.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span>{ingredient.name}</span>
                  <span className="text-muted-foreground">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Steps */}
          <div>
            <h2 className="text-xl font-semibold mb-4">步骤</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <p className="pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-sm text-muted-foreground">
            <p>创建者：{recipe.createdBy}</p>
            <p>创建时间：{new Date(recipe.createdAt).toLocaleString()}</p>
            <p>最后更新：{new Date(recipe.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
