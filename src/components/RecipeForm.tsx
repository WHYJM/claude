import { useState } from 'react';
import type { Recipe, RecipeFormData } from '../types/recipe';
import { v4 as uuidv4 } from 'uuid';

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
}

export function RecipeForm({ initialData, onSubmit, onCancel }: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    ingredients: initialData?.ingredients || [],
    steps: initialData?.steps || [''],
    prepTime: initialData?.prepTime || 0,
    cookTime: initialData?.cookTime || 0,
    servings: initialData?.servings || 4,
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    imageUrl: initialData?.imageUrl || '',
  });

  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '' });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount) {
      setFormData({
        ...formData,
        ingredients: [
          ...formData.ingredients,
          { ...newIngredient, id: uuidv4() },
        ],
      });
      setNewIngredient({ name: '', amount: '', unit: '' });
    }
  };

  const removeIngredient = (id: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((ing) => ing.id !== id),
    });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, ''],
    });
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="recipe-form">
      <div className="form-group">
        <label>食谱名称 *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="例如：红烧肉"
        />
      </div>

      <div className="form-group">
        <label>描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="简单描述这道菜..."
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>分类</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="例如：中餐、甜点"
          />
        </div>

        <div className="form-group">
          <label>准备时间（分钟）</label>
          <input
            type="number"
            value={formData.prepTime}
            onChange={(e) => setFormData({ ...formData, prepTime: Number(e.target.value) })}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>烹饪时间（分钟）</label>
          <input
            type="number"
            value={formData.cookTime}
            onChange={(e) => setFormData({ ...formData, cookTime: Number(e.target.value) })}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>份数</label>
          <input
            type="number"
            value={formData.servings}
            onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
            min="1"
          />
        </div>
      </div>

      <div className="form-group">
        <label>图片链接</label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="form-section">
        <h3>食材</h3>
        <div className="ingredient-input">
          <input
            type="text"
            placeholder="食材名称"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="用量"
            value={newIngredient.amount}
            onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
          />
          <input
            type="text"
            placeholder="单位"
            value={newIngredient.unit}
            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
          />
          <button type="button" onClick={addIngredient} className="btn btn-small btn-secondary">
            添加
          </button>
        </div>
        <ul className="ingredient-list">
          {formData.ingredients.map((ing) => (
            <li key={ing.id}>
              {ing.name} - {ing.amount} {ing.unit}
              <button
                type="button"
                onClick={() => removeIngredient(ing.id)}
                className="btn-remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="form-section">
        <h3>步骤</h3>
        {formData.steps.map((step, index) => (
          <div key={index} className="step-input">
            <span className="step-number">{index + 1}.</span>
            <textarea
              value={step}
              onChange={(e) => updateStep(index, e.target.value)}
              placeholder="描述这一步的操作..."
              rows={2}
            />
            <button
              type="button"
              onClick={() => removeStep(index)}
              className="btn-remove"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={addStep} className="btn btn-secondary">
          + 添加步骤
        </button>
      </div>

      <div className="form-section">
        <h3>标签</h3>
        <div className="tag-input">
          <input
            type="text"
            placeholder="添加标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <button type="button" onClick={addTag} className="btn btn-small btn-secondary">
            添加
          </button>
        </div>
        <div className="tag-list">
          {formData.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="tag-remove">
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialData ? '更新食谱' : '创建食谱'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          取消
        </button>
      </div>
    </form>
  );
}
