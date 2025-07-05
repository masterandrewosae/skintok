import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-accent';
    case 'failed':
      return 'text-error';
    case 'processing':
      return 'text-warning';
    default:
      return 'text-muted-foreground';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'completed':
      return 'fas fa-check-circle';
    case 'failed':
      return 'fas fa-times-circle';
    case 'processing':
      return 'fas fa-spinner fa-spin';
    default:
      return 'fas fa-circle';
  }
}
