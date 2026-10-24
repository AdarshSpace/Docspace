import { Suspense } from "react";

import DocumentEditor from "./document-editor";

function EditorFallback() {
  return (
    <main className="min-h-screen bg-[#f5f8ff] text-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-8 sm:py-10">
        <div className="h-5 w-40 animate-pulse rounded bg-blue-100" />
        <div className="mt-8 h-10 w-2/3 animate-pulse rounded-lg bg-blue-100" />
        <div className="mt-6 h-96 animate-pulse rounded-2xl border border-blue-100 bg-white" />
      </div>
    </main>
  );
}

async function EditorPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DocumentEditor id={id} />;
}

export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EditorFallback />}>
      <EditorPageContent params={params} />
    </Suspense>
  );
}
