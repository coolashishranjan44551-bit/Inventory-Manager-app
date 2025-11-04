import { clsx } from 'clsx';

type ClassValue = string | undefined | null | false;

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs.filter(Boolean));
}
