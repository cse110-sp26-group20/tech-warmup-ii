### AI Strategy

- **Document Format:** Markdown is the top tier for AI to understand — lightweight, plain-text, with `#` titles and `-` lists providing a perfect semantic hierarchy. Ideal for knowledge bases, project requirement documents, architectural design plans, and API documentation.
- **Content Structuring:** Use strict H1–H3 hierarchy so AI builds an internal content tree. Decouple into "Background Information," "Core Rules," "Data Structures," and "Output Requirements" — do not mix instructions and background stories in the same paragraph. Use delimiters (triple backticks or XML tags) to isolate code/logs and prevent "prompt injection."
- **Prompting Strategy:** Assign a professional role in the system context and define operational boundaries. Use precise verbs in task instructions. Apply Few-Shot Prompting for specific output formats. Use Chain of Thought for complex engineering or algorithm design. Explicitly state **negative constraints** (what _not_ to do).
- **Logging Requirement:** Add to ai-use-log: Changes, Time, Prompt.

---

- **AI prompting for this project** should use Markdown with strict H1–H3 hierarchy, decoupled information modules, precise task verbs, negative constraints, and chain-of-thought instructions. All AI interactions must be logged with changes, time, and prompt.
