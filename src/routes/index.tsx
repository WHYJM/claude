import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useCallback, useEffect } from 'react';
import { projectService } from '@/services/projectService';
import { recipeService } from '@/services/recipeService';
import { fridgeService } from '@/services/fridgeService';
import type { Project } from '@/types/recipe';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const navigate = useNavigate();

  const loadProjects = useCallback(() => {
    setProjects(projectService.getAllProjects());
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = (name: string, description?: string) => {
    const newProject = projectService.createProject(name, description, 'local');
    setIsCreateDialogOpen(false);
    navigate({ to: '/project/$projectId', params: { projectId: newProject.id } });
  };

  const handleJoinProject = (roomId: string, name: string) => {
    const project = projectService.joinCollaborativeProject(roomId, name);
    setIsJoinDialogOpen(false);
    navigate({ to: '/project/$projectId', params: { projectId: project.id } });
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('确定要删除这个项目吗？项目内的所有数据都将被删除。')) {
      projectService.deleteProject(id);
      loadProjects();
    }
  };

  const localProjects = projects.filter(p => p.type === 'local');
  const collabProjects = projects.filter(p => p.type === 'collaborative');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的项目</h1>
          <p className="text-muted-foreground mt-1">管理你的食谱和冰箱</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>创建本地项目</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新项目</DialogTitle>
              </DialogHeader>
              <CreateProjectForm
                onSubmit={handleCreateProject}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">加入协同项目</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>加入协同项目</DialogTitle>
              </DialogHeader>
              <JoinProjectForm
                onSubmit={handleJoinProject}
                onCancel={() => setIsJoinDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-xl font-semibold mb-2">还没有项目</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              创建一个本地项目来管理你的食谱和冰箱，或者加入一个协同项目与家人一起编辑。
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                创建本地项目
              </Button>
              <Button variant="outline" onClick={() => setIsJoinDialogOpen(true)}>
                加入协同项目
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Projects */}
      {localProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            本地项目
            <Badge variant="secondary">{localProjects.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {localProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={(e) => handleDeleteProject(project.id, e)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collaborative Projects */}
      {collabProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            协同项目
            <Badge variant="secondary">{collabProjects.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collabProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={(e) => handleDeleteProject(project.id, e)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const recipeCount = recipeService.getAllRecipes(project.id).length;
  const fridgeCount = fridgeService.getAllItems(project.id).length;

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <Link to="/project/$projectId" params={{ projectId: project.id }} className="block">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {project.name}
                {project.type === 'collaborative' && (
                  <Badge variant="outline" className="text-xs">协同</Badge>
                )}
              </CardTitle>
              {project.description && (
                <CardDescription className="mt-1">{project.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
            <span>{recipeCount} 个食谱</span>
            <span>{fridgeCount} 个食材</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              创建于 {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
            >
              删除
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

// Create Project Form
function CreateProjectForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, description?: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入项目名称');
      return;
    }
    onSubmit(name.trim(), description.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">项目名称 *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：我的家庭食谱"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">描述（可选）</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="简单描述这个项目..."
          rows={2}
        />
      </div>
      <div className="flex gap-4 pt-2">
        <Button type="submit">创建</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

// Join Project Form
function JoinProjectForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (roomId: string, name: string) => void;
  onCancel: () => void;
}) {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) {
      alert('请输入房间 ID');
      return;
    }
    if (!name.trim()) {
      alert('请输入项目名称');
      return;
    }
    onSubmit(roomId.trim().toUpperCase(), name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roomId">房间 ID *</Label>
        <Input
          id="roomId"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          placeholder="例如：ROOM-XXXXX"
          className="font-mono uppercase"
          autoFocus
        />
        <p className="text-sm text-muted-foreground">
          输入房主分享的房间 ID 来加入协同编辑
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">本地显示名称 *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：家庭食谱"
        />
        <p className="text-sm text-muted-foreground">
          这个名称只在你本地显示
        </p>
      </div>
      <div className="flex gap-4 pt-2">
        <Button type="submit">加入</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}
