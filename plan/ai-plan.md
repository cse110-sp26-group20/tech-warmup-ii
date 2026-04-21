# AI-Driven Development Plan: Slot Machine Project

## 1. Initial Strategy (Knowledge Ingestion & Skill Building)
* **Core Goal**: To ensure the AI operates within the specific domain constraints of this project, we utilize the native Gemini CLI Agent Skills framework. This prevents "hallucinations" by forcing the AI to reference our pre-defined research and engineering standards before generating code.
* **Storage Protocol**: All specialized expertise is stored in the workspace-level skills directory: `gemini/skills/`
* **Naming Convention**: Each skill is contained in its own subdirectory with a mandatory SKILL.md file. Every SKILL.md must include YAML frontmatter (name and description) to enable autonomous discovery by the Gemini CLI.
* `.gemini/skills/[skill-name]/SKILL.md`
* **Knowledge Internalization Steps (Batch Processing)**:
    1. **Slot Machine Basics**: Generate `ai-skill-slot-basics.md` (Understanding core mechanics, reels, symbols, etc.).
    2. **Odds & Mathematical Models**: Generate `ai-skill-odds-math.md` (Calculating RTP, setting probability weights).
    3. **Online Security**: Generate `ai-skill-online-security.md` (Anti-tampering for RNG, preventing concurrent request exploits).

* **Skill Activation Workflow:**
* Discovery: At the start of each session, the CLI scans the .gemini/skills/ folder.
* Activation: When a prompt (e.g., "Design the symbol weights") matches a skill description, the AI will trigger the activate_skill tool.
* Human Approval: The user must approve the skill activation before the AI gains access to the detailed instructions.
* Implementation: Once activated, the AI must prioritize the procedural guidance found in the SKILL.md file over its general training data.



## 2. Execution Roadmap (Small Increments)
* **Golden Rule**: For every increment, the AI **MUST** output a specific plan first, and wait for my approval before generating any actual code.

### Increment
- [x] Generate basics skill files for the first few steps.
- [x] Generate the frontend architecture design documentation. Adopt a three-tier architectural style to facilitate future debugging efforts.
- [x] Generate the first init code to see what happen. 
- [ ] Ask AI to focus on UI, and build an runable HTML and CSS file.
- [ ] Add more document to help the frontend.
- [ ] Add any skill if needed.
- [ ] ...
- [ ] ...
- [ ] ...
