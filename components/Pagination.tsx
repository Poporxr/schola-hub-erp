"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
  page: number;
  count: number;
  perPage: number;
};

export default function Pagination({ page, count, perPage }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(count / perPage));
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(page, 1), totalPages);

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`${pathname}?${params.toString()}`);
    router.refresh(); // ✅
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={current <= 1}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => changePage(current - 1)}
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={`px-2 rounded-sm cursor-pointer hover:bg-[#b3cacd] ${pageNum === current ? "bg-[#b3cacd]" : ""}`}
            onClick={() => changePage(pageNum)}
          >
            {pageNum}
          </button>
        ))}
      </div>
      <button
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => changePage(current + 1)}
        disabled={current >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
