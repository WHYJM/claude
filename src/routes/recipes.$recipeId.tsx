import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { recipeService } from '../services/recipeService';

export const Route = createFileRoute('/recipes/$recipeId')({
  component: RecipeDetail,
});

function RecipeDetail() {
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

  const handleDelete = () => {
    if (confirm('确定要删除这个食谱吗？')) {
      recipeService.deleteRecipe(recipeId);
      navigate({ to: '/' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="recipe-detail">
      <div className="detail-header">
        <div>
          <h1>{recipe.name}</h1>
          <p className="detail-description">{recipe.description}</p>
        </div>
        <div className="detail-actions">
          <button onClick={handlePrint} className="btn btn-secondary">
            打印
          </button>
          <Link to="/edit/$recipeId" params={{ recipeId: recipe.id }} className="btn btn-secondary">
            编辑
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            删除
          </button>
        </div>
      </div>

      {recipe.imageUrl && (
        <div className="detail-image">
          <img src={recipe.imageUrl} alt={recipe.name} />
        </div>
      )}

      <div className="detail-meta">
        <div className="meta-item">
          <strong>分类：</strong>
          <span>{recipe.category || '未分类'}</span>
        </div>
        <div className="meta-item">
          <strong>准备时间：</strong>
          <span>{recipe.prepTime} 分钟</span>
        </div>
        <div className="meta-item">
          <strong>烹饪时间：</strong>
          <span>{recipe.cookTime} 分钟</span>
        </div>
        <div className="meta-item">
          <strong>总时间：</strong>
          <span>{recipe.prepTime + recipe.cookTime} 分钟</span>
        </div>
        <div className="meta-item">
          <strong>份数：</strong>
          <span>{recipe.servings} 人份</span>
        </div>
        <div className="meta-item">
          <strong>创建者：</strong>
          <span>{recipe.createdBy}</span>
        </div>
      </div>

      {recipe.tags.length > 0 && (
        <div className="detail-tags">
          {recipe.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="detail-section">
        <h2>食材</h2>
        <ul className="ingredients-list">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              <span className="ingredient-name">{ingredient.name}</span>
              <span className="ingredient-amount">
                {ingredient.amount} {ingredient.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-section">
        <h2>步骤</h2>
        <ol className="steps-list">
          {recipe.steps.map((step, index) => (
            <li key={index}>
              <div className="step-content">{step}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="detail-footer">
        <p className="timestamp">
          创建于：{new Date(recipe.createdAt).toLocaleString('zh-CN')}
        </p>
        <p className="timestamp">
          最后更新：{new Date(recipe.updatedAt).toLocaleString('zh-CN')}
        </p>
      </div>

      <div className="back-link">
        <Link to="/" className="btn btn-secondary">
          ← 返回列表
        </Link>
      </div>
    </div>
  );
}
