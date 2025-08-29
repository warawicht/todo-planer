import { Injectable } from '@nestjs/common';
import { TimeBlock } from '../entities/time-block.entity';
import { CalendarTimeBlockDto } from '../dto/calendar-time-block.dto';

@Injectable()
export class VirtualScrollingService {
  /**
   * Apply virtual scrolling to limit the number of time blocks returned
   * @param timeBlocks The array of time blocks to paginate
   * @param page The page number (1-based)
   * @param limit The number of items per page
   * @returns Object containing paginated time blocks and pagination metadata
   */
  applyVirtualScrolling(
    timeBlocks: TimeBlock[],
    page: number = 1,
    limit: number = 50
  ): { 
    timeBlocks: CalendarTimeBlockDto[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number 
  } {
    const total = timeBlocks.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    
    // Ensure page is within valid range
    const validPage = totalPages > 0 ? Math.max(1, Math.min(page, totalPages)) : 1;
    
    // Calculate start and end indices
    const startIndex = (validPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    
    // Slice the array to get the paginated results
    const paginatedTimeBlocks = timeBlocks.slice(startIndex, endIndex);
    
    // Convert to CalendarTimeBlockDto
    const calendarTimeBlocks = paginatedTimeBlocks.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
    
    return {
      timeBlocks: calendarTimeBlocks,
      total,
      page: validPage,
      limit,
      totalPages
    };
  }

  /**
   * Apply virtual scrolling with filtering for large datasets
   * @param timeBlocks The array of time blocks to paginate
   * @param options Pagination and filtering options
   * @returns Object containing paginated time blocks and pagination metadata
   */
  applyAdvancedVirtualScrolling(
    timeBlocks: TimeBlock[],
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): { 
    timeBlocks: CalendarTimeBlockDto[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number 
  } {
    let filteredTimeBlocks = [...timeBlocks];
    const page = options.page || 1;
    const limit = options.limit || 50;
    
    // Apply search filter if provided
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filteredTimeBlocks = filteredTimeBlocks.filter(tb => 
        tb.title.toLowerCase().includes(searchLower) ||
        (tb.description && tb.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting if provided
    if (options.sortBy) {
      filteredTimeBlocks.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'startTime':
            comparison = a.startTime.getTime() - b.startTime.getTime();
            break;
          case 'endTime':
            comparison = a.endTime.getTime() - b.endTime.getTime();
            break;
          default:
            comparison = a.startTime.getTime() - b.startTime.getTime();
        }
        
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply pagination
    const total = filteredTimeBlocks.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    
    // Ensure page is within valid range
    const validPage = totalPages > 0 ? Math.max(1, Math.min(page, totalPages)) : 1;
    
    // Calculate start and end indices
    const startIndex = (validPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    
    // Slice the array to get the paginated results
    const paginatedTimeBlocks = filteredTimeBlocks.slice(startIndex, endIndex);
    
    // Convert to CalendarTimeBlockDto
    const calendarTimeBlocks = paginatedTimeBlocks.map(tb => CalendarTimeBlockDto.fromTimeBlock(tb));
    
    return {
      timeBlocks: calendarTimeBlocks,
      total,
      page: validPage,
      limit,
      totalPages
    };
  }
}