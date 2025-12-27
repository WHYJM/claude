import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { settingsService } from '../services/settingsService';
import { aiService } from '../services/aiService';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const [apiKey, setApiKey] = useState(() => settingsService.getGeminiApiKey() || '');
  const [userName, setUserName] = useState(() => settingsService.getUserName() || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const [saved, setSaved] = useState(false);

  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      alert('请输入 API Key');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await aiService.validateApiKey(apiKey);
      setValidationResult(isValid ? 'success' : 'error');
    } catch {
      setValidationResult('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    settingsService.saveGeminiApiKey(apiKey);
    settingsService.saveUserName(userName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-container">
      <h2>设置</h2>

      <div className="settings-section">
        <h3>用户信息</h3>
        <div className="form-group">
          <label>你的名字</label>
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="用于食谱创建者标识"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>AI 配置</h3>
        <p className="settings-description">
          配置 Gemini API Key 以启用 AI 智能推荐功能。
          <br />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
          >
            点击这里获取免费的 API Key →
          </a>
        </p>

        <div className="form-group">
          <label>Gemini API Key</label>
          <div className="api-key-input">
            <input
              type="password"
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setValidationResult(null);
              }}
              placeholder="输入你的 Gemini API Key"
            />
            <button
              onClick={handleValidateApiKey}
              className="btn btn-secondary"
              disabled={isValidating}
            >
              {isValidating ? '验证中...' : '验证'}
            </button>
          </div>
          {validationResult === 'success' && (
            <p className="validation-success">✓ API Key 有效</p>
          )}
          {validationResult === 'error' && (
            <p className="validation-error">✗ API Key 无效，请检查后重试</p>
          )}
        </div>

        <div className="api-key-tips">
          <h4>如何获取 API Key？</h4>
          <ol>
            <li>访问 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>登录你的 Google 账号</li>
            <li>点击 "Create API Key" 创建一个新的 Key</li>
            <li>复制 Key 并粘贴到上面的输入框</li>
          </ol>
          <p className="tips-note">
            💡 提示：Gemini API 有免费额度，个人使用完全够用！
          </p>
        </div>
      </div>

      <div className="settings-actions">
        <button onClick={handleSave} className="btn btn-primary">
          保存设置
        </button>
        {saved && <span className="save-success">✓ 已保存</span>}
      </div>
    </div>
  );
}
