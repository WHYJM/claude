import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RecipeForm } from '../components/RecipeForm';
import { recipeService } from '../services/recipeService';
import type { RecipeFormData } from '../types/recipe';
import { useState } from 'react';

export const Route = createFileRoute('/new')({
  component: NewRecipe,
});

function NewRecipe() {
  const navigate = useNavigate();
  const [createdBy, setCreatedBy] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);

  const handleSubmit = (data: RecipeFormData) => {
    if (!createdBy) {
      alert('请先输入你的名字！');
      return;
    }
    recipeService.createRecipe(data, createdBy);
    navigate({ to: '/' });
  };

  if (showNamePrompt) {
    return (
      <div className="name-prompt">
        <div className="prompt-card">
          <h2>欢迎创建食谱！</h2>
          <p>请输入你的名字，这样家人就知道是谁创建的食谱了。</p>
          <input
            type="text"
            placeholder="你的名字"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createdBy && setShowNamePrompt(false)}
          />
          <button
            onClick={() => createdBy && setShowNamePrompt(false)}
            className="btn btn-primary"
            disabled={!createdBy}
          >
            开始创建
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>新建食谱</h2>
      <RecipeForm
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: '/' })}
      />
    </div>
  );
}
