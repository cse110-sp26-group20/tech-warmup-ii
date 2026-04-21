# Team Demo: AI-Driven Workflow Guidelines

To ensure smooth collaboration and prevent redundant work, all team members must follow these core rules when utilizing AI for this project.

## Core Rules

1. **Review Project Context**
   Before starting any task, you must read the latest `ai-plan.md` (for the current strategy) and `ai-use-log.md` (for the most recent progress). 
2. **Task Declaration (Slack)**
   Always announce what you are currently working on in the team Slack channel *before* you start prompting the AI. 
   * *Purpose*: This acts as a task lock to notify others and prevent duplicate efforts.
3. **Strict Adherence to AI-Strategy**
   Your prompts must strictly follow the rules outlined in our AI Strategy. 
   * *Key Rule*: Always discuss the plan and continuously optimize the prompt first. Do not ask for code generation until the plan is approved.
4. **Prompt Archiving**
   Every prompt you submit to the AI must be documented and saved into the `plan/prompts/` directory.
   * *Naming Convention*: `[Time].md` (e.g., `2026-04-20_13-42-03.md`).

```bash
date "+%Y-%m-%d_%H-%M-%S"
// output: 2026-04-20_13-42-03
```
---

## Demo: How to Log Your Session 

Please review the following format for your first `ai-use-log.md` entry. This represents exactly what your log should look like after completing an AI session.

### `ai-use-log.md` (Format Example)

**[2026-04-20 14:00] - Setup & Knowledge Ingestion**

* **Pre-Check**: 
  * Read current `ai-plan.md`.
  * Announced on Slack: *"Hey team, I'm taking Increment 1. Feeding the research to AI to generate the slot-basics skill file now."*
* **Archived Prompt**: Saved the exact prompt used as `plan/prompts/2026-04-20-1405.md`.
* **Action Taken**: Uploaded the Research Summary to the AI. Instructed the AI to generate `ai-skill-slot-basics.md` following the Initial Strategy.
* **AI Output/Discovery**: The AI successfully generated the Markdown file. It highlighted that our research was missing details on "Volatility" (how often vs. how big the machine pays out).
* **Next Steps**: Will upload the generated file to the `AI-Skills/` folder and initiate a Slack discussion regarding the missing Volatility metrics before moving to the Odds & Math skill file.