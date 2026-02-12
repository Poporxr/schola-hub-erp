"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClassOption = { id: string; name: string };

type Props = {
  classes: ClassOption[];
  initialSearch?: string;
  initialClassId?: string;
  initialStatus?: string;
};

const statusOptions = [
  { value: "paid", label: "Paid" },
  { value: "owing", label: "Owing" },
  { value: "partial", label: "Partial" },
] as const;

export default function ParentsFilters({
  classes,
  initialSearch,
  initialClassId,
  initialStatus,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(initialSearch ?? "");

  const classItems = useMemo(
    () => [{ id: "all", name: "All Classes" }, ...classes],
    [classes]
  );

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete("page");
    router.push(`?${next.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search name, phone, email..."
          value={search}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSearch(nextValue);
            updateParam("search", nextValue.trim());
          }}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      <Select
        defaultValue={initialClassId ?? "all"}
        onValueChange={(value) => updateParam("classId", value)}
      >
        <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
          <SelectValue placeholder="Select a Class" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <SelectGroup>
            {classItems.map((classItem) => (
              <SelectItem
                key={classItem.id}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black"
                value={classItem.id}
              >
                {classItem.id === "all" ? "All Classes" : `Class ${classItem.name}`}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        defaultValue={initialStatus ?? "all"}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <SelectGroup>
            <SelectItem
              className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black"
              value="all"
            >
              All Statuses
            </SelectItem>
            {statusOptions.map((option) => (
              <SelectItem
                key={option.value}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black"
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
