import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RecipeForm } from '../components/RecipeForm';
import { recipeService } from '../services/recipeService';
import type { RecipeFormData } from '../types/recipe';

export const Route = createFileRoute('/edit/$recipeId')({
  component: EditRecipe,
});

function EditRecipe() {
  const { recipeId } = Route.useParams();
  const navigate = useNavigate();
  const recipe = recipeService.getRecipeById(recipeId);

  if (!recipe) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>找不到食谱</h2>
          <p>该食谱可能已被删除。</p>
          <button onClick={() => navigate({ to: '/' })} className="btn btn-primary">
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: RecipeFormData) => {
    recipeService.updateRecipe(recipeId, data);
    navigate({ to: '/recipes/$recipeId', params: { recipeId } });
  };

  return (
    <div className="page-container">
      <h2>编辑食谱</h2>
      <RecipeForm
        initialData={recipe}
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: '/recipes/$recipeId', params: { recipeId } })}
      />
    </div>
  );
}
