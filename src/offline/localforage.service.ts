import localforage from 'localforage';
import { Task } from '../tasks/entities/task.entity';
import { TimeBlock } from '../time-blocks/entities/time-block.entity';
import { Project } from '../projects/entities/project.entity';

export class LocalForageService {
  private taskStore: localforage.LocalForage;
  private timeBlockStore: localforage.LocalForage;
  private projectStore: localforage.LocalForage;
  private syncQueueStore: localforage.LocalForage;

  constructor() {
    this.initializeStores();
  }

  private initializeStores(): void {
    // Initialize Tasks store
    this.taskStore = localforage.createInstance({
      name: 'TodoPlaner',
      storeName: 'tasks',
      description: 'Tasks storage for offline functionality'
    });

    // Initialize TimeBlocks store
    this.timeBlockStore = localforage.createInstance({
      name: 'TodoPlaner',
      storeName: 'timeBlocks',
      description: 'Time blocks storage for offline functionality'
    });

    // Initialize Projects store
    this.projectStore = localforage.createInstance({
      name: 'TodoPlaner',
      storeName: 'projects',
      description: 'Projects storage for offline functionality'
    });

    // Initialize Sync Queue store
    this.syncQueueStore = localforage.createInstance({
      name: 'TodoPlaner',
      storeName: 'syncQueue',
      description: 'Sync queue for pending changes'
    });
  }

  // Task operations
  async saveTask(task: Task): Promise<void> {
    try {
      await this.taskStore.setItem(task.id, task);
    } catch (error) {
      console.error('Error saving task to local storage:', error);
      throw error;
    }
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      const task = await this.taskStore.getItem<Task>(id);
      return task || null;
    } catch (error) {
      console.error('Error retrieving task from local storage:', error);
      return null;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const tasks: Task[] = [];
      await this.taskStore.iterate((task: Task) => {
        tasks.push(task);
      });
      return tasks;
    } catch (error) {
      console.error('Error retrieving all tasks from local storage:', error);
      return [];
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.taskStore.removeItem(id);
    } catch (error) {
      console.error('Error deleting task from local storage:', error);
      throw error;
    }
  }

  // TimeBlock operations
  async saveTimeBlock(timeBlock: TimeBlock): Promise<void> {
    try {
      await this.timeBlockStore.setItem(timeBlock.id, timeBlock);
    } catch (error) {
      console.error('Error saving time block to local storage:', error);
      throw error;
    }
  }

  async getTimeBlock(id: string): Promise<TimeBlock | null> {
    try {
      const timeBlock = await this.timeBlockStore.getItem<TimeBlock>(id);
      return timeBlock || null;
    } catch (error) {
      console.error('Error retrieving time block from local storage:', error);
      return null;
    }
  }

  async getAllTimeBlocks(): Promise<TimeBlock[]> {
    try {
      const timeBlocks: TimeBlock[] = [];
      await this.timeBlockStore.iterate((timeBlock: TimeBlock) => {
        timeBlocks.push(timeBlock);
      });
      return timeBlocks;
    } catch (error) {
      console.error('Error retrieving all time blocks from local storage:', error);
      return [];
    }
  }

  async deleteTimeBlock(id: string): Promise<void> {
    try {
      await this.timeBlockStore.removeItem(id);
    } catch (error) {
      console.error('Error deleting time block from local storage:', error);
      throw error;
    }
  }

  // Project operations
  async saveProject(project: Project): Promise<void> {
    try {
      await this.projectStore.setItem(project.id, project);
    } catch (error) {
      console.error('Error saving project to local storage:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const project = await this.projectStore.getItem<Project>(id);
      return project || null;
    } catch (error) {
      console.error('Error retrieving project from local storage:', error);
      return null;
    }
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const projects: Project[] = [];
      await this.projectStore.iterate((project: Project) => {
        projects.push(project);
      });
      return projects;
    } catch (error) {
      console.error('Error retrieving all projects from local storage:', error);
      return [];
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.projectStore.removeItem(id);
    } catch (error) {
      console.error('Error deleting project from local storage:', error);
      throw error;
    }
  }

  // Sync Queue operations
  async addToSyncQueue(item: any): Promise<void> {
    try {
      const key = `${item.type}-${item.id}-${Date.now()}`;
      await this.syncQueueStore.setItem(key, item);
    } catch (error) {
      console.error('Error adding item to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue(): Promise<any[]> {
    try {
      const items: any[] = [];
      await this.syncQueueStore.iterate((item: any) => {
        items.push(item);
      });
      return items;
    } catch (error) {
      console.error('Error retrieving sync queue:', error);
      return [];
    }
  }

  async removeFromSyncQueue(key: string): Promise<void> {
    try {
      await this.syncQueueStore.removeItem(key);
    } catch (error) {
      console.error('Error removing item from sync queue:', error);
      throw error;
    }
  }

  async clearSyncQueue(): Promise<void> {
    try {
      await this.syncQueueStore.clear();
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      throw error;
    }
  }

  // Database versioning
  async getVersion(): Promise<number> {
    try {
      const version = await localforage.getItem<number>('dbVersion');
      return version || 1;
    } catch (error) {
      console.error('Error retrieving database version:', error);
      return 1;
    }
  }

  async setVersion(version: number): Promise<void> {
    try {
      await localforage.setItem('dbVersion', version);
    } catch (error) {
      console.error('Error setting database version:', error);
      throw error;
    }
  }
}