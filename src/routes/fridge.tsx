import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { fridgeService, FRIDGE_CATEGORIES } from '../services/fridgeService';
import type { FridgeItem, FridgeCategory } from '../types/recipe';

export const Route = createFileRoute('/fridge')({
  component: FridgePage,
});

function FridgePage() {
  const [items, setItems] = useState(() => fridgeService.getAllItems());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<FridgeCategory | 'all'>('all');

  // 新食材表单状态
  const [formData, setFormData] = useState({
    name: '',
    amount: 1,
    unit: '个',
    category: '蔬菜' as FridgeCategory,
    expiryDate: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 1,
      unit: '个',
      category: '蔬菜',
      expiryDate: '',
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      fridgeService.updateItem(editingItem.id, {
        ...formData,
        expiryDate: formData.expiryDate || undefined,
      });
    } else {
      fridgeService.addItem({
        ...formData,
        expiryDate: formData.expiryDate || undefined,
      });
    }

    setItems(fridgeService.getAllItems());
    resetForm();
  };

  const handleEdit = (item: FridgeItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      category: item.category,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个食材吗？')) {
      fridgeService.deleteItem(id);
      setItems(fridgeService.getAllItems());
    }
  };

  // 过滤食材
  const filteredItems =
    filterCategory === 'all'
      ? items
      : items.filter(item => item.category === filterCategory);

  // 获取过期状态
  const getExpiryStatus = (item: FridgeItem) => {
    if (!item.expiryDate) return 'normal';
    const now = new Date();
    const expiry = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring';
    return 'normal';
  };

  const expiringCount = items.filter(i => getExpiryStatus(i) === 'expiring').length;
  const expiredCount = items.filter(i => getExpiryStatus(i) === 'expired').length;

  return (
    <div className="fridge-container">
      <div className="fridge-header">
        <h2>我的冰箱</h2>
        <div className="fridge-actions">
          <Link to="/recommend" className="btn btn-primary">
            AI 推荐菜品
          </Link>
          <button onClick={() => setShowAddForm(true)} className="btn btn-secondary">
            + 添加食材
          </button>
        </div>
      </div>

      {/* 提醒区域 */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="fridge-alerts">
          {expiredCount > 0 && (
            <div className="alert alert-danger">
              ⚠️ 有 {expiredCount} 种食材已过期！
            </div>
          )}
          {expiringCount > 0 && (
            <div className="alert alert-warning">
              ⏰ 有 {expiringCount} 种食材即将过期（3天内）
            </div>
          )}
        </div>
      )}

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingItem ? '编辑食材' : '添加食材'}</h3>
            <form onSubmit={handleSubmit} className="fridge-form">
              <div className="form-group">
                <label>食材名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：鸡蛋"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>数量</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e =>
                      setFormData({ ...formData, amount: Number(e.target.value) })
                    }
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="个/克/斤"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>分类</label>
                <select
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value as FridgeCategory })
                  }
                >
                  {FRIDGE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>过期日期（可选）</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingItem ? '更新' : '添加'}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 分类过滤 */}
      <div className="category-filter">
        <button
          className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          全部 ({items.length})
        </button>
        {FRIDGE_CATEGORIES.map(cat => {
          const count = items.filter(i => i.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* 食材列表 */}
      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>冰箱空空如也，快去添加一些食材吧！</p>
        </div>
      ) : (
        <div className="fridge-grid">
          {filteredItems.map(item => {
            const status = getExpiryStatus(item);
            return (
              <div
                key={item.id}
                className={`fridge-item ${status === 'expired' ? 'expired' : ''} ${status === 'expiring' ? 'expiring' : ''}`}
              >
                <div className="item-header">
                  <span className="item-category">{item.category}</span>
                  {status === 'expired' && <span className="status-badge danger">已过期</span>}
                  {status === 'expiring' && <span className="status-badge warning">即将过期</span>}
                </div>
                <h4 className="item-name">{item.name}</h4>
                <p className="item-amount">
                  {item.amount} {item.unit}
                </p>
                {item.expiryDate && (
                  <p className="item-expiry">
                    保质期至：{new Date(item.expiryDate).toLocaleDateString('zh-CN')}
                  </p>
                )}
                <div className="item-actions">
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn btn-small btn-secondary"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-small btn-danger"
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
