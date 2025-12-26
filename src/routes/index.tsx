import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { recipeService } from '../services/recipeService';

export const Route = createFileRoute('/')({
  component: RecipeList,
});

function RecipeList() {
  const [recipes, setRecipes] = useState(() => recipeService.getAllRecipes());
  const [searchQuery, setSearchQuery] = useState('');
  const [showImport, setShowImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecipes = searchQuery
    ? recipeService.searchRecipes(searchQuery)
    : recipes;

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个食谱吗？')) {
      recipeService.deleteRecipe(id);
      setRecipes(recipeService.getAllRecipes());
    }
  };

  const handleExport = () => {
    const data = recipeService.exportRecipes();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-recipes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = recipeService.importRecipes(content);

      if (result.success) {
        alert(`成功导入 ${result.count} 个食谱！`);
        setRecipes(recipeService.getAllRecipes());
        setShowImport(false);
      } else {
        alert(`导入失败：${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="recipe-list-container">
      <div className="list-header">
        <h2>我的食谱</h2>
        <div className="actions">
          <button onClick={handleExport} className="btn btn-secondary">
            导出食谱
          </button>
          <button onClick={() => setShowImport(!showImport)} className="btn btn-secondary">
            导入食谱
          </button>
          <Link to="/new" className="btn btn-primary">
            + 新建食谱
          </Link>
        </div>
      </div>

      {showImport && (
        <div className="import-section">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="file-input"
          />
        </div>
      )}

      <div className="search-box">
        <input
          type="text"
          placeholder="搜索食谱名称、标签或分类..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="empty-state">
          <p>还没有食谱，快去创建一个吧！</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              {recipe.imageUrl && (
                <div className="recipe-image">
                  <img src={recipe.imageUrl} alt={recipe.name} />
                </div>
              )}
              <div className="recipe-content">
                <h3>{recipe.name}</h3>
                <p className="recipe-description">{recipe.description}</p>
                <div className="recipe-meta">
                  <span>⏱️ {recipe.prepTime + recipe.cookTime} 分钟</span>
                  <span>👥 {recipe.servings} 人份</span>
                </div>
                <div className="recipe-tags">
                  <span className="category-tag">{recipe.category}</span>
                  {recipe.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="recipe-footer">
                  <span className="created-by">创建者: {recipe.createdBy}</span>
                </div>
                <div className="recipe-actions">
                  <Link to="/recipes/$recipeId" params={{ recipeId: recipe.id }} className="btn btn-small btn-primary">
                    查看
                  </Link>
                  <Link to="/edit/$recipeId" params={{ recipeId: recipe.id }} className="btn btn-small btn-secondary">
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="btn btn-small btn-danger"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
