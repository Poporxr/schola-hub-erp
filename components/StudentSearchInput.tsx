 "use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentSearchInput({ initialValue }: { initialValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue ?? "");

  // Keep local state in sync with server-provided initial value
  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const next = value.trim();

    if (next) params.set("search", next);
    else params.delete("search");

    // Reset pagination whenever a new search is performed
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
router.refresh(); // ✅
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-3 py-1.5 bg-white"
    >
      <Search className="w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search students..."
        className="w-full bg-transparent outline-none"
        aria-label="Search students"
      />
    </form>
  );
}
