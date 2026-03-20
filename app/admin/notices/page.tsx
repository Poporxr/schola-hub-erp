import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import {
  BellRing,
  CalendarClock,
  Megaphone,
  PencilLine,
  Search,
  Trash2,
  Send,
  Sparkles,
  FileText,
  Users,
} from "lucide-react";

type SearchParams = {
  search?: string | string[];
  status?: string | string[];
  audience?: string | string[];
  priority?: string | string[];
  editId?: string | string[];
  page?: string | string[];
  error?: string | string[];
};

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

const noticeFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().max(120).optional(),
  from: z.string().trim().min(2, "From is required").max(80),
  message: z.string().trim().min(10, "Message is too short").max(2000),
  priority: priorityEnum,
  targetAudience: z.string().trim().max(80).optional(),
  publishAt: z.string().optional(),
  intent: z.enum(["save", "publish"]),
});

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const priorityValues = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const statusValues = ["DRAFT", "SCHEDULED", "PUBLISHED"] as const;

const formatDateTime = (date?: Date | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const toInputDateTime = (date?: Date | null) => {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const statusForNotice = (notice: {
  isPublished: boolean;
  publishedAt: Date | null;
}): string => {
  if (!notice.isPublished) return "DRAFT";
  if (notice.publishedAt && notice.publishedAt.getTime() > Date.now()) {
    return "SCHEDULED";
  }
  return "PUBLISHED";
};

const statusBadgeClass = (status: string) => {
  if (status === "PUBLISHED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "SCHEDULED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-200 bg-slate-100 text-slate-700";
};

const priorityBadgeClass = (
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
) => {
  if (priority === "URGENT") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (priority === "HIGH") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }
  if (priority === "MEDIUM") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }
  return "border-slate-200 bg-slate-100 text-slate-700";
};

const controlClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

async function upsertNoticeAction(formData: FormData) {
  "use server";

  const parsed = noticeFormSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    title: String(formData.get("title") ?? "").trim() || undefined,
    from: String(formData.get("from") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
    priority: String(formData.get("priority") ?? "MEDIUM"),
    targetAudience: String(formData.get("targetAudience") ?? "").trim() || undefined,
    publishAt: String(formData.get("publishAt") ?? "").trim() || undefined,
    intent: String(formData.get("intent") ?? "save"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid form data.";
    redirect(`/admin/notices?error=${encodeURIComponent(message)}`);
  }

  const data = parsed.data;
  const publishDate = data.publishAt ? new Date(data.publishAt) : null;
  const shouldPublish = data.intent === "publish";

  if (shouldPublish && publishDate && Number.isNaN(publishDate.getTime())) {
    redirect(`/admin/notices?error=${encodeURIComponent("Invalid publish date.")}`);
  }

  const payload = {
    title: data.title,
    from: data.from,
    message: data.message,
    priority: data.priority,
    targetAudience: data.targetAudience,
    isPublished: shouldPublish,
    publishedAt: shouldPublish ? publishDate ?? new Date() : null,
  } as const;

  if (data.id) {
    await prisma.notice.update({
      where: { id: data.id },
      data: payload,
    });
  } else {
    const currentSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    });

    await prisma.notice.create({
      data: {
        ...payload,
        sessionId: currentSession?.id,
      },
    });
  }

  revalidatePath("/admin/notices");
  revalidatePath("/admin/dashboard");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/parent/dashboard");
  redirect("/admin/notices");
}

async function togglePublishAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/notices?error=Missing+notice+id");

  const notice = await prisma.notice.findUnique({
    where: { id },
    select: { id: true, isPublished: true, publishedAt: true },
  });

  if (!notice) redirect("/admin/notices?error=Notice+not+found");

  const nextPublished = !notice.isPublished;

  await prisma.notice.update({
    where: { id },
    data: {
      isPublished: nextPublished,
      publishedAt: nextPublished ? notice.publishedAt ?? new Date() : null,
    },
  });

  revalidatePath("/admin/notices");
  revalidatePath("/admin/dashboard");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/parent/dashboard");
  redirect("/admin/notices");
}

async function deleteNoticeAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/notices?error=Missing+notice+id");

  await prisma.notice.delete({ where: { id } });

  revalidatePath("/admin/notices");
  revalidatePath("/admin/dashboard");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/parent/dashboard");
  redirect("/admin/notices");
}

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const search = firstParam(resolved?.search)?.trim() ?? "";
  const rawStatus = firstParam(resolved?.status)?.toUpperCase() ?? "__ALL__";
  const statusFilter =
    (statusValues as readonly string[]).includes(rawStatus) ? rawStatus : "__ALL__";

  const audienceFilter = firstParam(resolved?.audience)?.toUpperCase() ?? "__ALL__";

  const rawPriority = firstParam(resolved?.priority)?.toUpperCase() ?? "__ALL__";
  const priorityFilter =
    (priorityValues as readonly string[]).includes(rawPriority)
      ? rawPriority
      : "__ALL__";

  const editId = firstParam(resolved?.editId);
  const pageParam = firstParam(resolved?.page);
  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;
  const errorMessage = firstParam(resolved?.error);

  const whereClause = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { from: { contains: search, mode: "insensitive" as const } },
            { message: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(priorityFilter !== "__ALL__"
      ? { priority: priorityFilter as "LOW" | "MEDIUM" | "HIGH" | "URGENT" }
      : {}),
    ...(audienceFilter !== "__ALL__" ? { targetAudience: audienceFilter } : {}),
  };

  const [notices, allNotices, editNotice] = await Promise.all([
    prisma.notice.findMany({
      where: whereClause,
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        from: true,
        message: true,
        priority: true,
        targetAudience: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.notice.findMany({
      select: {
        id: true,
        isPublished: true,
        publishedAt: true,
      },
    }),
    editId
      ? prisma.notice.findUnique({
          where: { id: editId },
          select: {
            id: true,
            title: true,
            from: true,
            message: true,
            priority: true,
            targetAudience: true,
            isPublished: true,
            publishedAt: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const rows = notices
    .map((notice) => ({ ...notice, status: statusForNotice(notice) }))
    .filter((notice) => statusFilter === "__ALL__" || notice.status === statusFilter);

  const totalRows = rows.length;
  const start = (page - 1) * ITEM_PER_PAGE;
  const end = start + ITEM_PER_PAGE;
  const pagedRows = rows.slice(start, end);

  const totalNotices = allNotices.length;
  const publishedCount = allNotices.filter(
    (n) => n.isPublished && (!n.publishedAt || n.publishedAt <= new Date())
  ).length;
  const scheduledCount = allNotices.filter(
    (n) => n.isPublished && Boolean(n.publishedAt && n.publishedAt > new Date())
  ).length;
  const draftCount = allNotices.filter((n) => !n.isPublished).length;

  const formHeading = editNotice ? "Edit Notice" : "Create Notice";
  const formSubHeading = editNotice
    ? "Refine your announcement and update its publish state."
    : "Compose a polished school-wide announcement with scheduling and targeting.";

  return (
    <div className="mx-auto w-full max-w-[1700px] space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-800/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.55)] md:px-8 md:py-8">
        <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Communication Center
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Notice Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-[15px]">
              Create polished announcements, schedule releases, and manage school-wide
              communication across students, parents, teachers, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
            <HeroStat
              label="Total"
              value={totalNotices}
              icon={<FileText className="h-4 w-4" />}
            />
            <HeroStat
              label="Published"
              value={publishedCount}
              icon={<Megaphone className="h-4 w-4" />}
            />
            <HeroStat
              label="Drafts"
              value={draftCount}
              icon={<PencilLine className="h-4 w-4" />}
            />
            <HeroStat
              label="Scheduled"
              value={scheduledCount}
              icon={<CalendarClock className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {decodeURIComponent(errorMessage)}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Compose
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">{formHeading}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{formSubHeading}</p>
                </div>
                <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg">
                  <BellRing className="h-5 w-5" />
                </div>
              </div>
            </div>

            <form action={upsertNoticeAction} className="space-y-5 p-6">
              <input type="hidden" name="id" value={editNotice?.id ?? ""} />

              <Field label="Title">
                <input
                  name="title"
                  defaultValue={editNotice?.title ?? ""}
                  placeholder="Mid-term break update"
                  className={controlClassName}
                />
              </Field>

              <Field label="From">
                <input
                  name="from"
                  defaultValue={editNotice?.from ?? "Admin Office"}
                  required
                  className={controlClassName}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Audience">
                  <select
                    name="targetAudience"
                    defaultValue={editNotice?.targetAudience ?? "ALL"}
                    className={controlClassName}
                  >
                    <option value="ALL">All Users</option>
                    <option value="STUDENTS">Students</option>
                    <option value="PARENTS">Parents</option>
                    <option value="TEACHERS">Teachers</option>
                    <option value="ADMINS">Admins</option>
                  </select>
                </Field>

                <Field label="Priority">
                  <select
                    name="priority"
                    defaultValue={editNotice?.priority ?? "MEDIUM"}
                    className={controlClassName}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </Field>

                <Field label="Schedule">
                  <input
                    type="datetime-local"
                    name="publishAt"
                    defaultValue={toInputDateTime(editNotice?.publishedAt)}
                    className={controlClassName}
                  />
                </Field>
              </div>

              <Field label="Message">
                <textarea
                  name="message"
                  defaultValue={editNotice?.message ?? ""}
                  rows={8}
                  required
                  placeholder="Enter notice details..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </Field>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  name="intent"
                  value="publish"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"
                >
                  <Send className="h-4 w-4" />
                  {editNotice ? "Update & Publish" : "Publish Notice"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="submit"
                    name="intent"
                    value="save"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Save Draft
                  </button>

                  {editNotice ? (
                    <Link
                      href="/admin/notices"
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </Link>
                  ) : (
                    <a
                      href="#notices-list"
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Notices
                    </a>
                  )}
                </div>
              </div>
            </form>
          </section>
        </aside>

        <section
          id="notices-list"
          className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.22)]"
        >
          <div className="border-b border-slate-100 bg-white px-6 py-5">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Directory
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    School Notices
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search, filter, edit, and control publishing from one workspace.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{totalRows} matching notice{totalRows === 1 ? "" : "s"}</span>
                </div>
              </div>

              <form method="GET" className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="search"
                    defaultValue={search}
                    placeholder="Search title, sender, or content"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <select
                  name="status"
                  defaultValue={statusFilter}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="__ALL__">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="DRAFT">Draft</option>
                </select>

                <select
                  name="audience"
                  defaultValue={audienceFilter}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="__ALL__">All Audiences</option>
                  <option value="ALL">All Users</option>
                  <option value="STUDENTS">Students</option>
                  <option value="PARENTS">Parents</option>
                  <option value="TEACHERS">Teachers</option>
                  <option value="ADMINS">Admins</option>
                </select>

                <select
                  name="priority"
                  defaultValue={priorityFilter}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="__ALL__">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Apply Filters
                </button>

                <Link
                  href="/admin/notices"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Reset
                </Link>
              </form>
            </div>
          </div>

          <div className="space-y-4 p-4 md:p-6">
            {pagedRows.length ? (
              pagedRows.map((notice) => {
                const status = notice.status;

                return (
                  <div
                    key={notice.id}
                    className="group rounded-[24px] border border-slate-200 bg-gradient-to-b from-white to-slate-50/40 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-22px_rgba(15,23,42,0.28)]"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 md:text-lg">
                            {notice.title ?? "Untitled Notice"}
                          </h3>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${priorityBadgeClass(
                              notice.priority
                            )}`}
                          >
                            {notice.priority}
                          </span>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadgeClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 md:text-sm">
                          <span>From <span className="font-semibold text-slate-700">{notice.from}</span></span>
                          <span>Audience <span className="font-semibold text-slate-700">{notice.targetAudience ?? "ALL"}</span></span>
                          <span>Published <span className="font-semibold text-slate-700">{formatDateTime(notice.publishedAt)}</span></span>
                          <span>Updated <span className="font-semibold text-slate-700">{formatDateTime(notice.updatedAt)}</span></span>
                        </div>

                        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
                          {notice.message.length > 220
                            ? `${notice.message.slice(0, 220)}...`
                            : notice.message}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 xl:w-auto xl:flex-col xl:items-stretch">
                        <Link
                          href={`/admin/notices?editId=${notice.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </Link>

                        <form action={togglePublishAction}>
                          <input type="hidden" name="id" value={notice.id} />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {notice.isPublished ? "Unpublish" : "Publish"}
                          </button>
                        </form>

                        <form action={deleteNoticeAction}>
                          <input type="hidden" name="id" value={notice.id} />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
                <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-lg">
                  <BellRing className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No notices found
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No notices match the selected filters right now. Adjust your filters
                  or create a new announcement.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-4 md:px-6">
            <Pagination page={page} count={totalRows} />
          </div>
        </section>
      </div>
    </div>
  );
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </label>
    {children}
  </div>
);

const HeroStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
    <div className="flex items-center justify-between text-white/70">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </span>
      {icon}
    </div>
    <p className="mt-3 text-2xl font-bold text-white">{value}</p>
  </div>
);
