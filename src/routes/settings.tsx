import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { settingsService } from '@/services/settingsService';
import { aiService } from '@/services/aiService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">设置</h1>
        <p className="text-muted-foreground mt-1">管理你的个人偏好和 API 配置</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
          <CardDescription>设置你的个人信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">你的名字</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="用于食谱创建者标识"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Config */}
      <Card>
        <CardHeader>
          <CardTitle>AI 配置</CardTitle>
          <CardDescription>
            配置 Gemini API Key 以启用 AI 智能推荐功能。
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              点击这里获取免费的 API Key →
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="输入你的 Gemini API Key"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleValidateApiKey}
                disabled={isValidating}
              >
                {isValidating ? '验证中...' : '验证'}
              </Button>
            </div>
            {validationResult === 'success' && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                ✓ API Key 有效
              </p>
            )}
            {validationResult === 'error' && (
              <p className="text-sm text-destructive flex items-center gap-1">
                ✗ API Key 无效，请检查后重试
              </p>
            )}
          </div>

          <Separator />

          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h4 className="font-medium">如何获取 API Key？</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                访问{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </li>
              <li>登录你的 Google 账号</li>
              <li>点击 "Create API Key" 创建一个新的 Key</li>
              <li>复制 Key 并粘贴到上面的输入框</li>
            </ol>
            <div className="bg-green-50 text-green-800 p-2 rounded text-sm">
              💡 提示：Gemini API 有免费额度，个人使用完全够用！
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave}>保存设置</Button>
        {saved && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✓ 已保存
          </Badge>
        )}
      </div>
    </div>
  );
}
