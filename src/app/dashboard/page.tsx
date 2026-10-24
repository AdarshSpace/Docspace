
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DocumentItem = {
  id: string;
  title: string;
  updatedAt: string;
};

type Owner = {
  name: string;
  email: string;
};

type SharedDocument = DocumentItem & {
  owner: Owner;
};

type DashboardData = {
  myDocuments: DocumentItem[];
  sharedDocuments: SharedDocument[];
};

async function requestDashboardDocuments(
  router: ReturnType<typeof useRouter>
): Promise<DashboardData | null> {
  const response = await fetch("/api/documents/dashboard", {
    method: "GET",
    cache: "no-store",
  });

  if (response.status === 401) {
    router.push("/login");
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Could not load documents.");
  }

  return {
    myDocuments: result.myDocuments ?? [],
    sharedDocuments: result.sharedDocuments ?? [],
  };
}

function formatDate(date: string) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function DocumentIcon({ shared = false }: { shared?: boolean }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf3ff] text-[#073eb5]">
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v6h6M8 13h8M8 17h5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        {shared && (
          <path
            d="M17 12v5m-2.5-2.5h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}

function EmptyState({
  shared = false,
  onCreate,
}: {
  shared?: boolean;
  onCreate?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-12 text-center">
      <div className="mb-4 rounded-2xl bg-[#edf3ff] p-2">
        <DocumentIcon shared={shared} />
      </div>

      <p className="text-sm font-semibold text-slate-800">
        {shared ? "Nothing shared with you yet" : "Your workspace is empty"}
      </p>

      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {shared
          ? "When someone shares a document with you, it will appear here."
          : "Create your first document and it will appear here."}
      </p>

      {!shared && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 rounded-lg bg-[#073eb5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#052f8b]"
        >
          Create a document
        </button>
      )}
    </div>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    myDocuments: [],
    sharedDocuments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadDocuments = useCallback(async () => {
    try {
      const documents = await requestDashboardDocuments(router);

      if (!documents) return;

      setError("");
      setData(documents);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDocuments() {
      try {
        const documents = await requestDashboardDocuments(router);

        if (cancelled || !documents) return;

        setError("");
        setData(documents);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchDocuments();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function openCreateModal() {
    setDocumentTitle("");
    setCreateError("");
    setNotice("");
    setIsCreateModalOpen(true);
  }

  async function createDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const title = documentTitle.trim();

    if (!title) {
      setCreateError("Please enter a document title.");
      return;
    }

    if (title.length > 200) {
      setCreateError("The title cannot exceed 200 characters.");
      return;
    }

    setIsCreating(true);
    setCreateError("");
    setNotice("");

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Failed to create document.");
      }

      setIsCreateModalOpen(false);
      setDocumentTitle("");

      await loadDocuments();

      setNotice("Document created successfully.");
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create document."
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteDocument(doc: DocumentItem, shared: boolean) {
    const message = shared
      ? "Remove this document from your shared list? The owner's document will not be deleted."
      : "Permanently delete this document? This action cannot be undone.";

    if (!window.confirm(message)) return;

    setDeletingId(doc.id);
    setError("");
    setNotice("");

    try {
      const endpoint = shared
        ? `/api/documents/${doc.id}/share`
        : `/api/documents/${doc.id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "The action failed.");
      }

      setData((current) => ({
        myDocuments: shared
          ? current.myDocuments
          : current.myDocuments.filter((item) => item.id !== doc.id),
        sharedDocuments: shared
          ? current.sharedDocuments.filter((item) => item.id !== doc.id)
          : current.sharedDocuments,
      }));

      setNotice(
        shared
          ? "Shared document removed from your list."
          : "Document deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setDeletingId("");
    }
  }

  const totalDocuments =
    data.myDocuments.length + data.sharedDocuments.length;

  return (
    <main className="min-h-screen bg-[#f5f8ff] text-slate-900">
      {/* Header */}
      {/* <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#073eb5] text-lg font-bold text-white shadow-sm shadow-blue-200">
              D
            </span>

            <span>
              <span className="block text-base font-bold tracking-tight text-slate-900">
                Docs<span className="text-[#073eb5]">pace</span>
              </span>
              <span className="block text-[11px] font-medium tracking-wide text-slate-500">
                ADARSH WORKSPACE
              </span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-medium text-slate-700">
                {email}
              </p>
              <p className="text-xs text-slate-400">Your workspace</p>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#073eb5]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header> */}

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-9 sm:px-8 sm:pt-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#073eb5] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[36px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 right-48 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                Your workspace
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything in one place.
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">
                Create, organize, and collaborate on your documents.
                Your work stays easy to find.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 text-sm font-bold text-[#073eb5] shadow-sm transition hover:bg-blue-50 sm:self-center"
            >
              <span className="text-lg leading-none">+</span>
              New document
            </button>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold">{data.myDocuments.length}</p>
              <p className="mt-0.5 text-xs text-blue-100">My documents</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold">{data.sharedDocuments.length}</p>
              <p className="mt-0.5 text-xs text-blue-100">Shared with me</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold">{totalDocuments}</p>
              <p className="mt-0.5 text-xs text-blue-100">Total accessible</p>
            </div>
          </div>
        </section>

        {notice && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadDocuments();
              }}
              className="font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* My documents */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-[#073eb5]" />
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  My documents
                </h2>
              </div>

              <p className="mt-1.5 pl-3 text-sm text-slate-500">
                Documents you created and own.
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#073eb5]">
              {data.myDocuments.length} files
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-900/[0.025]">
            <div className="hidden grid-cols-[minmax(0,1fr)_150px_180px] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
              <span>Document</span>
              <span>Last edited</span>
              <span className="text-right">Actions</span>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[66px] animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : data.myDocuments.length === 0 ? (
              <EmptyState onCreate={openCreateModal} />
            ) : (
              data.myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex flex-col gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 transition hover:bg-blue-50/40 sm:grid sm:grid-cols-[minmax(0,1fr)_150px_180px] sm:items-center sm:gap-4 sm:px-5"
                >
                  <a
                    href={`/dashboard/${doc.id}/editor`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <DocumentIcon />

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800 transition group-hover:text-[#073eb5]">
                        {doc.title || "Untitled document"}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        Private document
                      </span>
                    </span>
                  </a>

                  <span className="pl-14 text-xs text-slate-500 sm:pl-0">
                    {formatDate(doc.updatedAt)}
                  </span>

                  <div className="flex items-center gap-2 pl-14 sm:justify-end sm:pl-0">
                    <a
                      href={`/dashboard/${doc.id}/editor`}
                      className="rounded-lg border border-blue-100 px-3 py-2 text-xs font-semibold text-[#073eb5] transition hover:bg-blue-50"
                    >
                      Open
                    </a>

                    <button
                      type="button"
                      disabled={deletingId === doc.id}
                      onClick={() => void deleteDocument(doc, false)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === doc.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Shared documents */}
        <section className="mt-11">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-sky-400" />
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Shared with me
                </h2>
              </div>

              <p className="mt-1.5 pl-3 text-sm text-slate-500">
                Documents other people have shared with you.
              </p>
            </div>

            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
              {data.sharedDocuments.length} files
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm shadow-blue-900/[0.025]">
            <div className="hidden grid-cols-[minmax(0,1fr)_minmax(160px,0.7fr)_130px_100px] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
              <span>Document</span>
              <span>Owner</span>
              <span>Last edited</span>
              <span className="text-right">Actions</span>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-[66px] animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : data.sharedDocuments.length === 0 ? (
              <EmptyState shared />
            ) : (
              data.sharedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex flex-col gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 transition hover:bg-sky-50/40 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(160px,0.7fr)_130px_100px] sm:items-center sm:gap-4 sm:px-5"
                >
                  <a
                    href={`/dashboard/${doc.id}/editor`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <DocumentIcon shared />

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800 transition group-hover:text-[#073eb5]">
                        {doc.title || "Untitled document"}
                      </span>
                      <span className="mt-1 block text-xs text-sky-700">
                        Shared with you · Editor access
                      </span>
                    </span>
                  </a>

                  <div className="flex min-w-0 items-center gap-2 pl-14 sm:pl-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold uppercase text-sky-700">
                      {(doc.owner.name || doc.owner.email || "?").slice(0, 1)}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-slate-700">
                        {doc.owner.name || "Document owner"}
                      </span>
                      <span className="block truncate text-[11px] text-slate-400">
                        {doc.owner.email}
                      </span>
                    </span>
                  </div>

                  <span className="pl-14 text-xs text-slate-500 sm:pl-0">
                    {formatDate(doc.updatedAt)}
                  </span>

                  <div className="flex items-center gap-2 pl-14 sm:justify-end sm:pl-0">
                    <a
                      href={`/dashboard/${doc.id}/editor`}
                      className="rounded-lg border border-blue-100 px-3 py-2 text-xs font-semibold text-[#073eb5] transition hover:bg-blue-50"
                    >
                      Open
                    </a>

                    <button
                      type="button"
                      disabled={deletingId === doc.id}
                      onClick={() => void deleteDocument(doc, true)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === doc.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-slate-400">
          Your workspace · Simple, organized, collaborative.
        </p>
      </div>

      {/* Create document modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isCreating) {
              setIsCreateModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-document-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-blue-950/20"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ff] text-[#073eb5]">
                  <DocumentIcon />
                </div>

                <h2
                  id="create-document-title"
                  className="text-lg font-bold tracking-tight text-slate-900"
                >
                  Create a document
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Give your new document a name to get started.
                </p>
              </div>

              <button
                type="button"
                disabled={isCreating}
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={createDocument} className="space-y-5 px-6 py-6">
              <div>
                <label
                  htmlFor="document-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Document title
                </label>

                <input
                  id="document-title"
                  autoFocus
                  autoComplete="off"
                  maxLength={200}
                  required
                  value={documentTitle}
                  onChange={(e) => {
                    setDocumentTitle(e.target.value);
                    setCreateError("");
                  }}
                  placeholder="e.g. Project notes"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#073eb5] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                {createError && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {createError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating || !documentTitle.trim()}
                  className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-[#073eb5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#052f8b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    "Create document"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
