<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The migrated Quran reader lives in `src/legacy/` and renders client-only from `/` (it uses localStorage/audio at render time); public data/AI endpoints are server routes under `src/routes/api/` backed by `src/server/*.server.ts`, keeping the original `/api/*` paths the UI calls.
