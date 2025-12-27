import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { fridgeService } from '../services/fridgeService';
import { aiService } from '../services/aiService';
import { settingsService } from '../services/settingsService';
import { recipeService } from '../services/recipeService';
import type { AIGeneratedRecipe } from '../types/recipe';

export const Route = createFileRoute('/recommend')({
  component: RecommendPage,
});

function RecommendPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<AIGeneratedRecipe[]>([]);
  const [searchDish, setSearchDish] = useState('');
  const [singleRecipe, setSingleRecipe] = useState<AIGeneratedRecipe | null>(null);

  const fridgeItems = fridgeService.getAllItems();
  const expiringItems = fridgeService.getExpiringItems();
  const hasApiKey = settingsService.hasApiKey();

  const handleRecommend = async () => {
    if (!hasApiKey) {
      setError('请先在设置中配置 Gemini API Key');
      return;
    }

    if (fridgeItems.length === 0) {
      setError('冰箱里没有食材，请先添加一些食材');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setSingleRecipe(null);

    try {
      const result = await aiService.recommendRecipes(fridgeItems, expiringItems);
      setRecipes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取推荐失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchDish = async () => {
    if (!hasApiKey) {
      setError('请先在设置中配置 Gemini API Key');
      return;
    }

    if (!searchDish.trim()) {
      setError('请输入想吃的菜名');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setSingleRecipe(null);

    try {
      const result = await aiService.generateRecipe(searchDish);
      setSingleRecipe(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成食谱失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = (recipe: AIGeneratedRecipe) => {
    const userName = settingsService.getUserName() || '家人';

    recipeService.createRecipe(
      {
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients.map((ing, idx) => ({
          id: `ing-${idx}`,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        })),
        steps: recipe.steps,
        prepTime: 10,
        cookTime: recipe.estimatedTime || 30,
        servings: 2,
        category: '家常菜',
        tags: ['AI生成'],
      },
      userName
    );

    alert('食谱已保存到我的食谱！');
  };

  const handleCheckIngredients = async (recipe: AIGeneratedRecipe) => {
    if (!hasApiKey) {
      setError('请先在设置中配置 Gemini API Key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.checkIngredients(
        recipe.name,
        recipe.ingredients.map(i => `${i.name} ${i.amount}${i.unit}`),
        fridgeItems
      );

      alert(
        `【${recipe.name}】食材检查结果：\n\n` +
          `${result.canMake ? '✅ 可以制作！' : '❌ 食材不足'}\n\n` +
          `已有食材：${result.available.join('、') || '无'}\n\n` +
          `缺少食材：${result.missing.join('、') || '无'}\n\n` +
          `建议：${result.suggestions}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查食材失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="recommend-container">
        <div className="no-api-key">
          <h2>🤖 AI 智能推荐</h2>
          <p>需要配置 Gemini API Key 才能使用 AI 功能</p>
          <Link to="/settings" className="btn btn-primary">
            去设置 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recommend-container">
      <h2>🤖 AI 智能推荐</h2>

      {/* 冰箱食材概览 */}
      <div className="fridge-summary">
        <div className="summary-header">
          <h3>冰箱食材概览</h3>
          <Link to="/fridge" className="btn btn-small btn-secondary">
            管理食材
          </Link>
        </div>
        {fridgeItems.length === 0 ? (
          <p className="empty-text">冰箱空空如也</p>
        ) : (
          <div className="ingredient-tags">
            {fridgeItems.map(item => (
              <span
                key={item.id}
                className={`ingredient-tag ${expiringItems.some(e => e.id === item.id) ? 'expiring' : ''}`}
              >
                {item.name} {item.amount}{item.unit}
              </span>
            ))}
          </div>
        )}
        {expiringItems.length > 0 && (
          <p className="expiring-notice">
            ⚠️ {expiringItems.map(i => i.name).join('、')} 即将过期，建议优先使用
          </p>
        )}
      </div>

      {/* 功能区 */}
      <div className="recommend-actions">
        <div className="action-card">
          <h3>🍳 根据食材推荐</h3>
          <p>让 AI 根据冰箱里的食材，推荐可以做的菜</p>
          <button
            onClick={handleRecommend}
            className="btn btn-primary"
            disabled={isLoading || fridgeItems.length === 0}
          >
            {isLoading ? '正在思考...' : '获取推荐'}
          </button>
        </div>

        <div className="action-card">
          <h3>🔍 想吃什么菜？</h3>
          <p>输入菜名，AI 帮你生成完整食谱</p>
          <div className="search-input-group">
            <input
              type="text"
              value={searchDish}
              onChange={e => setSearchDish(e.target.value)}
              placeholder="例如：红烧肉、糖醋排骨"
              onKeyPress={e => e.key === 'Enter' && handleSearchDish()}
            />
            <button
              onClick={handleSearchDish}
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '生成中...' : '生成食谱'}
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>AI 正在为你思考美味的菜品...</p>
        </div>
      )}

      {/* 推荐结果 */}
      {recipes.length > 0 && (
        <div className="recommend-results">
          <h3>推荐菜品</h3>
          <div className="recipe-cards">
            {recipes.map((recipe, index) => (
              <div key={index} className="ai-recipe-card">
                <h4>{recipe.name}</h4>
                <p className="recipe-desc">{recipe.description}</p>

                <div className="recipe-section">
                  <h5>食材</h5>
                  <ul>
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>
                        {ing.name} {ing.amount}{ing.unit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="recipe-section">
                  <h5>步骤</h5>
                  <ol>
                    {recipe.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {recipe.tips && (
                  <div className="recipe-tips">
                    💡 {recipe.tips}
                  </div>
                )}

                <div className="recipe-card-actions">
                  <button
                    onClick={() => handleCheckIngredients(recipe)}
                    className="btn btn-small btn-secondary"
                    disabled={isLoading}
                  >
                    检查食材
                  </button>
                  <button
                    onClick={() => handleSaveRecipe(recipe)}
                    className="btn btn-small btn-primary"
                  >
                    保存食谱
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 单个食谱结果 */}
      {singleRecipe && (
        <div className="recommend-results">
          <h3>生成的食谱</h3>
          <div className="ai-recipe-card single">
            <h4>{singleRecipe.name}</h4>
            <p className="recipe-desc">{singleRecipe.description}</p>

            {singleRecipe.estimatedTime && (
              <p className="recipe-time">⏱️ 预计用时：{singleRecipe.estimatedTime} 分钟</p>
            )}

            <div className="recipe-section">
              <h5>食材</h5>
              <ul>
                {singleRecipe.ingredients.map((ing, idx) => (
                  <li key={idx}>
                    {ing.name} {ing.amount}{ing.unit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="recipe-section">
              <h5>步骤</h5>
              <ol>
                {singleRecipe.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {singleRecipe.tips && (
              <div className="recipe-tips">
                💡 {singleRecipe.tips}
              </div>
            )}

            <div className="recipe-card-actions">
              <button
                onClick={() => handleCheckIngredients(singleRecipe)}
                className="btn btn-small btn-secondary"
                disabled={isLoading}
              >
                检查食材
              </button>
              <button
                onClick={() => handleSaveRecipe(singleRecipe)}
                className="btn btn-small btn-primary"
              >
                保存食谱
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
