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
- AI image analysis runs only in a server function (src/lib/analyze.functions.ts) calling Gemini with GEMINI_API_KEY and a fallback list of free-tier models; why: key stays server-side and single models are often overloaded.
- Validate structured AI responses through the shared analysis-result module before rendering; why: unclear, non-waste, uncertain and mixed images must not produce forced classifications.
