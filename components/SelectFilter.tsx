"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type ClassItem = { id: string; name: string };

export default function FilterSelect({
  classes,
  classId,
}: {
  classes: ClassItem[];
  classId?: string; // from URL searchParams.classId
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

function setClassParam(nextClassId: string) {
  const params = new URLSearchParams(searchParams.toString());

  if (nextClassId === "all") params.delete("classId");
  else params.set("classId", nextClassId);

  params.delete("page");

  const query = params.toString();
  router.push(query ? `${pathname}?${query}` : pathname);

  router.refresh(); // ✅ force the server page to re-run
}

  return (
    <div className="flex items-center gap-2">
      <Select
        value={classId ?? "all"}           // controlled by URL
        onValueChange={setClassParam}      // updates URL
      >
        <SelectTrigger  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="All Classes" />
        </SelectTrigger>

        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <SelectGroup>
            <SelectItem
              value="all"
              className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black"
            >
              All Classes
            </SelectItem>

            {classes.map((classItem) => (
              <SelectItem
                key={classItem.id}
                value={classItem.id}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black"
              >
                {`${classItem.name}`}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

    </div>
  );
}
