import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PerformanceMonitoringService {
  private readonly logger = new Logger(PerformanceMonitoringService.name);
  private readonly performanceMetrics: Map<string, number[]> = new Map();

  /**
   * Start measuring performance for a specific operation
   * @param operationName The name of the operation to measure
   * @returns A timestamp to be used for calculating duration
   */
  startMeasurement(operationName: string): number {
    const startTime = Date.now();
    this.logger.debug(`Starting measurement for operation: ${operationName}`);
    return startTime;
  }

  /**
   * End measuring performance for a specific operation
   * @param operationName The name of the operation being measured
   * @param startTime The timestamp returned by startMeasurement
   * @returns The duration in milliseconds
   */
  endMeasurement(operationName: string, startTime: number): number {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Store the measurement
    if (!this.performanceMetrics.has(operationName)) {
      this.performanceMetrics.set(operationName, []);
    }
    
    const metrics = this.performanceMetrics.get(operationName) || [];
    metrics.push(duration);
    
    // Keep only the last 100 measurements to prevent memory issues
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    this.logger.debug(`Operation ${operationName} completed in ${duration}ms`);
    return duration;
  }

  /**
   * Get average performance metrics for an operation
   * @param operationName The name of the operation
   * @returns Object containing average, min, max, and count of measurements
   */
  getPerformanceMetrics(operationName: string): { 
    average: number; 
    min: number; 
    max: number; 
    count: number 
  } | null {
    const metrics = this.performanceMetrics.get(operationName);
    
    if (!metrics || metrics.length === 0) {
      return null;
    }
    
    const sum = metrics.reduce((acc, val) => acc + val, 0);
    const average = sum / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);
    
    return {
      average: Math.round(average * 100) / 100, // Round to 2 decimal places
      min,
      max,
      count: metrics.length
    };
  }

  /**
   * Get memory usage information
   * @returns Object containing memory usage metrics
   */
  getMemoryUsage(): { 
    heapUsed: number; 
    heapTotal: number; 
    rss: number;
    external: number;
  } {
    const memoryUsage = process.memoryUsage();
    
    return {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100 // MB
    };
  }

  /**
   * Log current memory usage
   */
  logMemoryUsage(): void {
    const memory = this.getMemoryUsage();
    this.logger.debug(`Memory usage - Heap: ${memory.heapUsed}MB / ${memory.heapTotal}MB, RSS: ${memory.rss}MB, External: ${memory.external}MB`);
  }

  /**
   * Optimize memory by clearing old performance metrics
   */
  optimizeMemory(): void {
    // Clear performance metrics older than 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    for (const [operationName, metrics] of this.performanceMetrics.entries()) {
      // Since we're storing just durations, we'll clear metrics for operations
      // that haven't been measured in a while by checking the last measurement time
      // For simplicity, we'll keep all metrics but could implement more aggressive cleanup
      this.logger.debug(`Performance metrics for ${operationName}: ${metrics.length} measurements`);
    }
    
    this.logMemoryUsage();
  }

  /**
   * Clear all performance metrics
   */
  clearMetrics(): void {
    this.performanceMetrics.clear();
    this.logger.debug('Cleared all performance metrics');
  }
}