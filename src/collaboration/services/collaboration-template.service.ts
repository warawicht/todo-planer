import { Injectable } from '@nestjs/common';

@Injectable()
export class CollaborationTemplateService {
  getTaskSharedTemplate(
    sharedByUserName: string,
    taskTitle: string,
    permissionLevel: string,
  ): { subject: string; body: string } {
    const subject = `Task Shared: ${taskTitle}`;
    const body = `
      <p>Hello,</p>
      <p>${sharedByUserName} has shared the task "<strong>${taskTitle}</strong>" with you.</p>
      <p>You have been granted <strong>${permissionLevel}</strong> permissions on this task.</p>
      <p>You can view this task in your shared tasks list.</p>
      <p>Best regards,<br>The Todo Planner Team</p>
    `;

    return { subject, body };
  }

  getTaskAssignedTemplate(
    assignedByUserName: string,
    taskTitle: string,
  ): { subject: string; body: string } {
    const subject = `Task Assigned: ${taskTitle}`;
    const body = `
      <p>Hello,</p>
      <p>${assignedByUserName} has assigned you the task "<strong>${taskTitle}</strong>".</p>
      <p>Please review and accept the assignment in your task list.</p>
      <p>Best regards,<br>The Todo Planner Team</p>
    `;

    return { subject, body };
  }

  getTaskCommentTemplate(
    commentedByUserName: string,
    taskTitle: string,
    commentContent: string,
  ): { subject: string; body: string } {
    const subject = `New Comment on Task: ${taskTitle}`;
    const body = `
      <p>Hello,</p>
      <p>${commentedByUserName} has added a comment to the task "<strong>${taskTitle}</strong>":</p>
      <blockquote>${commentContent}</blockquote>
      <p>You can view this comment and respond in the task details.</p>
      <p>Best regards,<br>The Todo Planner Team</p>
    `;

    return { subject, body };
  }

  getAvailabilityUpdatedTemplate(
    userName: string,
    timeRange: string,
  ): { subject: string; body: string } {
    const subject = `${userName} Updated Their Availability`;
    const body = `
      <p>Hello,</p>
      <p>${userName} has updated their availability to: <strong>${timeRange}</strong>.</p>
      <p>This update may affect your scheduling and collaboration with them.</p>
      <p>Best regards,<br>The Todo Planner Team</p>
    `;

    return { subject, body };
  }
}