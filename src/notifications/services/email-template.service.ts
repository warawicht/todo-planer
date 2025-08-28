import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailTemplateService {
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();

  async renderTemplate(templateName: string, context: any): Promise<string> {
    // Load template if not already loaded
    if (!this.templates.has(templateName)) {
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        `${templateName}.template.html`,
      );
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${templateName} not found`);
      }
      
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateContent);
      this.templates.set(templateName, compiledTemplate);
    }
    
    const template = this.templates.get(templateName);
    return template(context);
  }
}