import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Función de shadcn para combinar clases
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
