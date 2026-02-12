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

type ClassItem = { id: string; name: string };

type TermItem = { id: string; name: string };

export function ResultsClassFilter({
  classes,
  classId,
}: {
  classes: ClassItem[];
  classId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setClassParam(nextClassId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("classId", nextClassId);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
      <Select value={classId ?? undefined} onValueChange={setClassParam}>
        <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
          <SelectValue placeholder="Select a Class" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <SelectGroup>
            {classes.map((classItem) => (
              <SelectItem
                key={classItem.id}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black"
                value={classItem.id}
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

export function ResultsTermFilter({
  terms,
  termId,
}: {
  terms: TermItem[];
  termId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setTermParam(nextTermId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("termId", nextTermId);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Term / Semester</label>
      <Select value={termId ?? undefined} onValueChange={setTermParam}>
        <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
          <SelectValue placeholder="Select a Term" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <SelectGroup>
            {terms.map((term) => (
              <SelectItem
                key={term.id}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black"
                value={term.id}
              >
                {term.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
