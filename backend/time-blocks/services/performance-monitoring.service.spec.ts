import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceMonitoringService } from './performance-monitoring.service';

describe('PerformanceMonitoringService', () => {
  let service: PerformanceMonitoringService;

  beforeEach(async () => {
    jest.useFakeTimers();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformanceMonitoringService],
    }).compile();

    service = module.get<PerformanceMonitoringService>(PerformanceMonitoringService);
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startMeasurement and endMeasurement', () => {
    it('should measure duration correctly', () => {
      const operationName = 'test-operation';
      const startTime = service.startMeasurement(operationName);
      
      // Simulate some work
      jest.advanceTimersByTime(100);
      
      const duration = service.endMeasurement(operationName, startTime);
      
      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should store measurements', () => {
      const operationName = 'test-operation-storage';
      const startTime = service.startMeasurement(operationName);
      service.endMeasurement(operationName, startTime);
      
      const metrics = service.getPerformanceMetrics(operationName);
      
      expect(metrics).toBeDefined();
      expect(metrics.count).toBe(1);
      expect(metrics.average).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return null for non-existent operations', () => {
      const metrics = service.getPerformanceMetrics('non-existent-operation');
      expect(metrics).toBeNull();
    });

    it('should calculate correct metrics for multiple measurements', () => {
      const operationName = 'multi-test-operation';
      
      // Add multiple measurements
      const startTime1 = service.startMeasurement(operationName);
      jest.advanceTimersByTime(50);
      service.endMeasurement(operationName, startTime1);
      
      const startTime2 = service.startMeasurement(operationName);
      jest.advanceTimersByTime(100);
      service.endMeasurement(operationName, startTime2);
      
      const startTime3 = service.startMeasurement(operationName);
      jest.advanceTimersByTime(150);
      service.endMeasurement(operationName, startTime3);
      
      const metrics = service.getPerformanceMetrics(operationName);
      
      expect(metrics).toBeDefined();
      expect(metrics.count).toBe(3);
      expect(metrics.min).toBeGreaterThanOrEqual(50);
      expect(metrics.max).toBeGreaterThanOrEqual(150);
      expect(metrics.average).toBeGreaterThanOrEqual(100);
    });
  });

  describe('getMemoryUsage', () => {
    it('should return memory usage information', () => {
      const memory = service.getMemoryUsage();
      
      expect(memory).toBeDefined();
      expect(memory.heapUsed).toBeGreaterThanOrEqual(0);
      expect(memory.heapTotal).toBeGreaterThanOrEqual(0);
      expect(memory.rss).toBeGreaterThanOrEqual(0);
      expect(memory.external).toBeGreaterThanOrEqual(0);
    });
  });

  describe('optimizeMemory', () => {
    it('should not throw errors when optimizing memory', () => {
      expect(() => service.optimizeMemory()).not.toThrow();
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      const operationName = 'clear-test-operation';
      const startTime = service.startMeasurement(operationName);
      service.endMeasurement(operationName, startTime);
      
      expect(service.getPerformanceMetrics(operationName)).not.toBeNull();
      
      service.clearMetrics();
      
      expect(service.getPerformanceMetrics(operationName)).toBeNull();
    });
  });
});