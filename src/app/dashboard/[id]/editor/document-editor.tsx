
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";


type DocumentData = {
  id: string;
  title: string;
  content: string;
  updatedAt?: string;
};

export default function DocumentEditor({ id }: { id: string }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("Loading document...");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef("");
  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const latestContentRef = useRef("");
  const loadedRef = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[480px] px-5 py-6 text-[15px] leading-7 text-slate-700 outline-none sm:px-8",
      },
    },
    onUpdate: ({ editor }) => {
      if (!loadedRef.current) return;

      latestContentRef.current = editor.getHTML();
      setStatus("Unsaved changes");

      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(() => {
        void saveDocument();
      }, 1000);
    },
  });

  const saveDocument = useCallback(async () => {
    if (!loadedRef.current || !editor) return;

    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }

    savingRef.current = true;
    pendingRef.current = false;
    setStatus("Saving...");

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleRef.current,
          content: latestContentRef.current,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Save failed");
      }

      setStatus("All changes saved");
    } catch {
      setStatus("Couldn't save. Please try again.");
    } finally {
      savingRef.current = false;

      if (pendingRef.current) {
        pendingRef.current = false;

        if (timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => {
          void saveDocument();
        }, 1000);
      }
    }
  }, [editor, id, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadDocument() {
      if (!id) {
        setLoadError("Invalid document.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load document.");
        }

        const document = result as DocumentData;

        if (cancelled) return;

        setTitle(document.title ?? "");
        titleRef.current = document.title ?? "";
        latestContentRef.current = document.content ?? "";

        if (editor) {
          editor.commands.setContent(document.content ?? "", {
            emitUpdate: false,
          });
        }

        loadedRef.current = true;
        setStatus("All changes saved");
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load document."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDocument();

    return () => {
      cancelled = true;
    };
  }, [id, editor, router]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function changeTitle(value: string) {
    setTitle(value);
    titleRef.current = value;

    if (!loadedRef.current) return;

    setStatus("Unsaved changes");

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      void saveDocument();
    }, 1000);
  }

  async function shareDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const recipientEmail = shareEmail.trim();

    if (!recipientEmail) {
      setShareMessage("Enter an email address.");
      return;
    }

    setSharing(true);
    setShareMessage("");

    try {
      const response = await fetch(`/api/documents/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recipientEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        setShareMessage(result.message || "Couldn't share document.");
        return;
      }

      setShareMessage("Document shared successfully.");
      setShareEmail("");
    } catch {
      setShareMessage("Unable to connect. Please try again.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f8ff] text-slate-800">
      {/* Header is provided by the dashboard layout. */}

      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-8 sm:py-10">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#073eb5] hover:underline"
        >
          ← Back to documents
        </Link>

        {loading ? (
          <div className="mt-8 space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded-lg bg-blue-100" />
            <div className="h-96 animate-pulse rounded-2xl border border-blue-100 bg-white" />
          </div>
        ) : loadError ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-white p-6"
          >
            <h1 className="font-semibold text-slate-900">
              Could not open this document
            </h1>
            <p className="mt-2 text-sm text-red-600">{loadError}</p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-4 rounded-lg bg-[#073eb5] px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <input
                  aria-label="Document title"
                  value={title}
                  maxLength={200}
                  onChange={(e) => changeTitle(e.target.value)}
                  className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-2xl font-bold tracking-tight outline-none focus:border-blue-200 focus:bg-white sm:text-3xl"
                  placeholder="Untitled document"
                />

                <p className="mt-1 px-2 text-xs text-slate-500">
                  Changes save automatically
                </p>
              </div>
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-900/5">
              <div className="flex flex-col gap-3 border-b border-blue-100 bg-[#f8faff] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  <ToolbarButton
                    label="B"
                    active={editor?.isActive("bold") ?? false}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  />
                  <ToolbarButton
                    label="I"
                    active={editor?.isActive("italic") ?? false}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  />
                  <ToolbarButton
                    label="U"
                    active={editor?.isActive("underline") ?? false}
                    onClick={() =>
                      editor?.chain().focus().toggleUnderline().run()
                    }
                  />
                  <ToolbarButton
                    label="H1"
                    active={
                      editor?.isActive("heading", { level: 1 }) ?? false
                    }
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                  />
                  <ToolbarButton
                    label="H2"
                    active={
                      editor?.isActive("heading", { level: 2 }) ?? false
                    }
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                  />
                  <ToolbarButton
                    label="• List"
                    active={editor?.isActive("bulletList") ?? false}
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  />
                  <ToolbarButton
                    label="1. List"
                    active={editor?.isActive("orderedList") ?? false}
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    aria-live="polite"
                    className="text-xs text-slate-500 sm:text-sm"
                  >
                    {status}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setShareMessage("");
                      setShareOpen(true);
                    }}
                    className="rounded-lg bg-[#073eb5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#06349a]"
                  >
                    Share
                  </button>
                </div>
              </div>

              <EditorContent editor={editor} />
            </section>
          </>
        )}
      </div>

      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !sharing) {
              setShareOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-document-title"
            className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-950/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="share-document-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Share document
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the email address of a registered user.
                </p>
              </div>

              <button
                type="button"
                disabled={sharing}
                onClick={() => setShareOpen(false)}
                aria-label="Close share dialog"
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={shareDocument}>
              <label
                htmlFor="share-email"
                className="mt-5 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="share-email"
                type="email"
                required
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="person@example.com"
                className="mt-2 h-11 w-full rounded-xl border border-blue-100 bg-[#f5f8ff] px-3 text-sm outline-none focus:border-[#073eb5] focus:ring-2 focus:ring-blue-100"
              />

              {shareMessage && (
                <p
                  aria-live="polite"
                  className={`mt-3 text-sm ${
                    shareMessage.includes("successfully")
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {shareMessage}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={sharing}
                  onClick={() => setShareOpen(false)}
                  className="rounded-xl border border-blue-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sharing || !shareEmail.trim()}
                  className="rounded-xl bg-[#073eb5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#06349a] disabled:opacity-50"
                >
                  {sharing ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-9 rounded-lg border px-2.5 py-2 text-sm font-semibold transition ${
        active
          ? "border-blue-200 bg-blue-100 text-[#073eb5]"
          : "border-transparent text-slate-600 hover:border-blue-100 hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}
