
export default function WorkspaceHeader({ email }: { email: string }) {
    return (
      <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/90 backdrop-blur">
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
      </header>
    );
  }
  