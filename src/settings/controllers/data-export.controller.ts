import { Controller, Get, Post, Param, Body, UseGuards, Request, Res, HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { DataExportService } from '../services/data-export.service';
import { DataExportDto, DataExportResponseDto } from '../dto/data-export.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('settings/export')
@UseGuards(JwtAuthGuard)
export class DataExportController {
  constructor(private readonly dataExportService: DataExportService) {}

  @Post()
  async createDataExport(
    @Request() req,
    @Body() dataExportDto: DataExportDto,
  ): Promise<DataExportResponseDto> {
    const dataExport = await this.dataExportService.createDataExport(
      req.user.id,
      dataExportDto,
    );
    
    return {
      id: dataExport.id,
      format: dataExport.format,
      dataType: dataExport.dataType,
      fileName: dataExport.fileName,
      exportedAt: dataExport.exportedAt,
      status: dataExport.status,
    };
  }

  @Get(':id')
  async getDataExport(
    @Request() req,
    @Param('id') id: string,
  ): Promise<DataExportResponseDto> {
    const dataExport = await this.dataExportService.getDataExport(id, req.user.id);
    return {
      id: dataExport.id,
      format: dataExport.format,
      dataType: dataExport.dataType,
      fileName: dataExport.fileName,
      exportedAt: dataExport.exportedAt,
      status: dataExport.status,
    };
  }

  @Get(':id/download')
  async downloadDataExport(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const dataExport = await this.dataExportService.getDataExport(id, req.user.id);
      
      if (dataExport.status !== 'completed') {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Export is not yet completed',
        });
        return;
      }
      
      // Check if file exists
      if (!dataExport.fileName) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Export file not found',
        });
        return;
      }
      
      const filePath = path.join(process.cwd(), 'exports', dataExport.fileName);
      
      if (!fs.existsSync(filePath)) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Export file not found',
        });
        return;
      }
      
      // Set appropriate headers for file download
      const fileExtension = path.extname(dataExport.fileName).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (fileExtension) {
        case '.json':
          contentType = 'application/json';
          break;
        case '.csv':
          contentType = 'text/csv';
          break;
        case '.pdf':
          contentType = 'application/pdf';
          break;
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${dataExport.fileName}"`);
      res.status(HttpStatus.OK).sendFile(filePath);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Data export not found',
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error downloading data export',
        });
      }
    }
  }
}