# Agent Operational Rules & Protocols
These rules define the operating procedures for Autonomous Agents working on this project.

## 1. Core Philosophy: "Performance & Beauty"
- **Zero Compromise**: Every feature must be both highly performant (Core Web Vitals) and visually premium.
- **User Experience**: Transition states (loading, error, empty) must be designed first, not last.

## 2. Interaction Protocol
- **Acknowledge Context**: Always read `.cursorrules` before generating code.
- **No Placeholders**: Never use `// TODO: implement this` or `lorem ipsum`. Generate real, working logic and realistic text.
- **Self-Correction**: If a tool fails (e.g., `run_command`), analyze the `stderr` immediately and retry with a fix. Do not ask the user unless blocked.

## 3. Workflow Standards

### A. Feature Implementation
1. **Analyze**: Understand requirements ~> Check existing patterns in `src/`.
2. **Style check**: ensure strictly NO Tailwind.
3. **Draft**: Create CSS Modules first (`Component.module.css`), then the React Component (`Component.tsx`).
4. **Verify**: Ensure fully responsive on Mobile (320px) to Desktop (1920px).

### B. Refactoring Code
1. **Safety**: Run type checks (`tsc --noEmit`) before confirming changes.
2. **Performance**: Check bundle size implications (import only what is needed).
3. **Modernization**: Convert old React patterns (`useEffect` for data fetching) to Server Actions/Server Components.

## 4. Environment Safety
- **Secrets**: Never hardcode API keys. Use `process.env`.
- **Destructive Actions**: Ask for confirmation before `rm -rf` on non-generated folders.
- **Package Management**: Use `npm`. Do not mix with `yarn` or `pnpm`.

## 5. Communication Style
- **Concise**: Technical and direct.
- **Educational**: Briefly explain *why* a certain optimization (e.g., "Using React Compiler here...") was chosen.
