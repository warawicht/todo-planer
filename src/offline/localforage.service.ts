import * as fs from 'fs';
import * as path from 'path';
import { Task } from '../tasks/entities/task.entity';
import { TimeBlock } from '../time-blocks/entities/time-block.entity';
import { Project } from '../projects/entities/project.entity';

export class LocalForageService {
  private readonly basePath = './offline-storage';

  constructor() {
    // Ensure base directory exists
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  private getStorePath(storeName: string): string {
    const storePath = path.join(this.basePath, storeName);
    if (!fs.existsSync(storePath)) {
      fs.mkdirSync(storePath, { recursive: true });
    }
    return storePath;
  }

  private getFilePath(storeName: string, key: string): string {
    return path.join(this.getStorePath(storeName), `${key}.json`);
  }

  // Task operations
  async saveTask(task: Task): Promise<void> {
    try {
      const filePath = this.getFilePath('tasks', task.id);
      await fs.promises.writeFile(filePath, JSON.stringify(task, null, 2));
    } catch (error) {
      console.error('Error saving task to local storage:', error);
      throw error;
    }
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      const filePath = this.getFilePath('tasks', id);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error retrieving task from local storage:', error);
      return null;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const storePath = this.getStorePath('tasks');
      const files = await fs.promises.readdir(storePath);
      const tasks: Task[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(storePath, file);
          const data = await fs.promises.readFile(filePath, 'utf8');
          tasks.push(JSON.parse(data));
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('Error retrieving all tasks from local storage:', error);
      return [];
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const filePath = this.getFilePath('tasks', id);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting task from local storage:', error);
      throw error;
    }
  }

  // TimeBlock operations
  async saveTimeBlock(timeBlock: TimeBlock): Promise<void> {
    try {
      const filePath = this.getFilePath('timeBlocks', timeBlock.id);
      await fs.promises.writeFile(filePath, JSON.stringify(timeBlock, null, 2));
    } catch (error) {
      console.error('Error saving time block to local storage:', error);
      throw error;
    }
  }

  async getTimeBlock(id: string): Promise<TimeBlock | null> {
    try {
      const filePath = this.getFilePath('timeBlocks', id);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error retrieving time block from local storage:', error);
      return null;
    }
  }

  async getAllTimeBlocks(): Promise<TimeBlock[]> {
    try {
      const storePath = this.getStorePath('timeBlocks');
      const files = await fs.promises.readdir(storePath);
      const timeBlocks: TimeBlock[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(storePath, file);
          const data = await fs.promises.readFile(filePath, 'utf8');
          timeBlocks.push(JSON.parse(data));
        }
      }
      
      return timeBlocks;
    } catch (error) {
      console.error('Error retrieving all time blocks from local storage:', error);
      return [];
    }
  }

  async deleteTimeBlock(id: string): Promise<void> {
    try {
      const filePath = this.getFilePath('timeBlocks', id);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting time block from local storage:', error);
      throw error;
    }
  }

  // Project operations
  async saveProject(project: Project): Promise<void> {
    try {
      const filePath = this.getFilePath('projects', project.id);
      await fs.promises.writeFile(filePath, JSON.stringify(project, null, 2));
    } catch (error) {
      console.error('Error saving project to local storage:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const filePath = this.getFilePath('projects', id);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error retrieving project from local storage:', error);
      return null;
    }
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const storePath = this.getStorePath('projects');
      const files = await fs.promises.readdir(storePath);
      const projects: Project[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(storePath, file);
          const data = await fs.promises.readFile(filePath, 'utf8');
          projects.push(JSON.parse(data));
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Error retrieving all projects from local storage:', error);
      return [];
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const filePath = this.getFilePath('projects', id);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting project from local storage:', error);
      throw error;
    }
  }

  // Sync Queue operations
  async addToSyncQueue(item: any): Promise<void> {
    try {
      const key = `${item.type}-${item.id}-${Date.now()}`;
      const filePath = this.getFilePath('syncQueue', key);
      await fs.promises.writeFile(filePath, JSON.stringify(item, null, 2));
    } catch (error) {
      console.error('Error adding item to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue(): Promise<any[]> {
    try {
      const storePath = this.getStorePath('syncQueue');
      const files = await fs.promises.readdir(storePath);
      const items: any[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(storePath, file);
          const data = await fs.promises.readFile(filePath, 'utf8');
          items.push(JSON.parse(data));
        }
      }
      
      return items;
    } catch (error) {
      console.error('Error retrieving sync queue:', error);
      return [];
    }
  }

  async removeFromSyncQueue(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath('syncQueue', key);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Error removing item from sync queue:', error);
      throw error;
    }
  }
}