// [IN]: types/recipe (Project types), uuid, localStorage / 项目类型、uuid、本地存储
// [OUT]: projectService object - CRUD, join collaborative, filter methods / projectService 对象 - 项目 CRUD 和协作方法
// [POS]: Service layer, manages project data persistence in localStorage / 服务层，管理项目数据在本地存储中的持久化
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

import type { Project, ProjectType } from '../types/recipe';
import { v4 as uuidv4 } from 'uuid';

const PROJECTS_KEY = 'family-projects';

export const projectService = {
  // 获取所有项目
  getAllProjects(): Project[] {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // 获取单个项目
  getProjectById(id: string): Project | undefined {
    return this.getAllProjects().find(p => p.id === id);
  },

  // 创建项目
  createProject(name: string, description?: string, type: ProjectType = 'local'): Project {
    const projects = this.getAllProjects();
    const now = new Date().toISOString();
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      type,
      createdAt: now,
      updatedAt: now,
    };
    projects.push(newProject);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return newProject;
  },

  // 加入协同项目（创建一个 collaborative 类型的项目引用）
  joinCollaborativeProject(roomId: string, name: string): Project {
    const projects = this.getAllProjects();
    // 检查是否已存在相同 roomId 的项目
    const existing = projects.find(p => p.roomId === roomId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const newProject: Project = {
      id: uuidv4(),
      name,
      type: 'collaborative',
      roomId,
      createdAt: now,
      updatedAt: now,
    };
    projects.push(newProject);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return newProject;
  },

  // 更新项目
  updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Project | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return projects[index];
  },

  // 设置项目的 roomId（开启协同时）
  setProjectRoomId(id: string, roomId: string): Project | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      roomId,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return projects[index];
  },

  // 删除项目
  deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;

    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));

    // 同时删除项目关联的食谱和冰箱数据
    localStorage.removeItem(`project:${id}:recipes`);
    localStorage.removeItem(`project:${id}:fridge`);

    return true;
  },

  // 获取本地项目
  getLocalProjects(): Project[] {
    return this.getAllProjects().filter(p => p.type === 'local');
  },

  // 获取协同项目
  getCollaborativeProjects(): Project[] {
    return this.getAllProjects().filter(p => p.type === 'collaborative');
  },
};
