import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const mergeClassNames = (...classNames: ClassValue[]) =>
  twMerge(clsx(...classNames))
