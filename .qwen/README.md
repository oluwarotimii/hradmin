# Global AI Context Files

These files define how your AI coding tools (Gemini CLI, Qwen Coder, etc.) should behave across all projects.

## Files

| File | Purpose |
|------|---------|
| `code-quality.md` | Naming, function design, comments, structure |
| `architecture.md` | System design principles, modularity, failure design |
| `security.md` | Input validation, secrets, auth, common vulnerabilities |
| `backend.md` | API design, error handling, database access, performance |
| `frontend.md` | Component design, state, performance, accessibility |
| `testing.md` | What to test, test structure, mindset |
| `devops.md` | Git habits, env vars, logging, CI/CD, dependencies |
| `ai-interaction.md` | How the AI should communicate and work with you |
| `personal-stack.md` | Language philosophy, preferences, defaults |

## Setup

### Gemini CLI
Copy all `.md` files into `~/.gemini/` or reference them in your `GEMINI.md`:
```
~/.gemini/code-quality.md
~/.gemini/architecture.md
... etc
```

### Qwen Coder
Copy all `.md` files into `~/.qwen/` or whichever config directory your version uses.

## Usage Tips
- These are **global** rules — they apply to every project.
- For project-specific rules (your design system, specific libraries, DB schema), create a separate context file inside the project folder.
- Update these files as your preferences evolve — they should reflect how you actually work.
- The `ai-interaction.md` file is the most important one — it shapes every response.
