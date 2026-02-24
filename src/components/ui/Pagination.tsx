"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium">{start}</span>–
        <span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <PagBtn onClick={() => onPageChange(1)} disabled={page <= 1}><ChevronsLeft className="h-4 w-4" /></PagBtn>
        <PagBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></PagBtn>
        <span className="px-3 text-sm font-medium text-gray-700">
          {page} / {totalPages}
        </span>
        <PagBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}><ChevronRight className="h-4 w-4" /></PagBtn>
        <PagBtn onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}><ChevronsRight className="h-4 w-4" /></PagBtn>
      </div>
    </div>
  );
}

function PagBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}
