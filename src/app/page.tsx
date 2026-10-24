
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Folder,
  ShieldCheck,
  Zap,
  Cloud,
  Search,
  Clock,
  Files,
} from "lucide-react";

const folders = [
  { name: "Projects", count: "12 documents", color: "bg-blue-50 text-[#073eb5]" },
  { name: "Personal", count: "8 documents", color: "bg-indigo-50 text-indigo-600" },
  { name: "Work", count: "15 documents", color: "bg-amber-50 text-amber-600" },
];

const documents = [
  { name: "Project Proposal.pdf", type: "PDF document", color: "bg-rose-50 text-rose-600" },
  { name: "Meeting Notes.docx", type: "Word document", color: "bg-blue-50 text-[#073eb5]" },
  { name: "Project Overview.txt", type: "Text document", color: "bg-emerald-50 text-emerald-600" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Secure",
    description: "Keep your important documents safe and protected.",
  },
  {
    icon: Zap,
    title: "Simple and fast",
    description: "Find and manage your files without unnecessary steps.",
  },
  {
    icon: Cloud,
    title: "Access anywhere",
    description: "Keep your documents accessible when you need them.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200/80 bg-white">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#073eb5] text-lg font-bold text-white shadow-md shadow-blue-900/15">
              D
            </div>
            <span className="text-xl font-bold tracking-tight">
              DocSpace
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#073eb5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Login <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      {/* Hero section */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24">
        {/* Left content */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-[#073eb5]">
            <Files size={16} />
            Your documents, your space
          </div>

          <h1 className="max-w-xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[58px]">
            All your documents.
            <span className="mt-2 block text-[#073eb5]">
              One simple space.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-slate-500 sm:text-lg">
            Welcome to DocSpace — a simple place to organize, manage,
            and access your documents. Keep everything in one space
            and make your workflow effortless.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-xl bg-[#073eb5] px-7 py-4 font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              Get started <ArrowRight size={18} />
            </Link>

            <span className="text-sm text-slate-500">
              Simple. Organized. Accessible.
            </span>
          </div>

          {/* Features */}
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const iconColors = [
                "bg-blue-100 text-[#073eb5]",
                "bg-amber-100 text-amber-600",
                "bg-emerald-100 text-emerald-600",
              ];

              return (
                <div key={feature.title}>
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconColors[index]}`}
                  >
                    <Icon size={21} />
                  </div>

                  <h2 className="text-sm font-bold">
                    {feature.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right-side dashboard preview */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 rounded-[40px] bg-blue-100/60 blur-3xl" />

          <div className="absolute -right-3 top-8 h-20 w-20 rounded-3xl bg-blue-100/80 rotate-12" />
          <div className="absolute -bottom-4 -left-3 h-20 w-20 rounded-3xl bg-indigo-100/80 -rotate-12" />

          <div className="relative rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-30px_rgba(7,62,181,0.3)] sm:p-7">
            {/* Preview header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#073eb5] text-white">
                  <FileText size={21} />
                </div>

                <div>
                  <p className="font-bold">My Workspace</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Your files, organized
                  </p>
                </div>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-[#f8fafc] text-slate-500">
                <Search size={18} />
              </div>
            </div>

            {/* Folders */}
            <div className="mt-6 flex items-center justify-between">
              <h2 className="font-bold">Your folders</h2>
              <span className="text-xs font-medium text-[#073eb5]">
                My files
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {folders.map((folder) => (
                <div
                  key={folder.name}
                  className="rounded-2xl border border-slate-100 bg-white p-3.5 transition hover:border-blue-200 hover:shadow-md sm:p-4"
                >
                  <div
                    className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${folder.color}`}
                  >
                    <Folder size={22} />
                  </div>

                  <p className="text-sm font-semibold">{folder.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {folder.count}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent documents */}
            <div className="mt-8 flex items-center justify-between">
              <h2 className="font-bold">Recent documents</h2>
              <Clock size={17} className="text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {documents.map((document) => (
                <div
                  key={document.name}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${document.color}`}
                  >
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {document.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {document.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5">
              <ShieldCheck
                size={21}
                className="shrink-0 text-[#073eb5]"
              />
              <p className="text-xs leading-5 text-slate-600">
                Everything organized in one simple workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:px-8 lg:px-12">
          <Link href="/" className="font-bold text-slate-800">
            DocSpace
          </Link>
          <p>©  DocSpace. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
