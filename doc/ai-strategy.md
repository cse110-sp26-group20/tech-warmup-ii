# AI Strategy

Make sure to add to ai\-use\-log:

- Changes
- Time
- Prompt

**Important:** Reduce context ambiguity and maximize token information density\.

Markdown is the top tier for AI to understand since it is extremely lightweight and plain\-text driven\. Titles using `\#` and lists using `\-` offer a perfect semantic hierarchy and seamlessly fit into code repository management practices\. This is ideal for knowledge bases, project requirement documents, architectural design plans, and API documentation\.

### Document Content Structuring Strategies

- **Clear Hierarchical Relationships:** Strictly use H1 \(`\#`\) to H3 \(`\#\#\#`\)\. AI will utilize these headings to build an internal content tree to understand the primary and secondary relationships within the context\.
- **Decouple Information Modules:** Break the document down into &quot;Background Information,&quot; &quot;Core Rules,&quot; &quot;Data Structures,&quot; and &quot;Output Requirements\.&quot; Do not mix instructions and background stories in the same paragraph\.
- **Use Delimiters to Protect Context:** When the document contains code, logs, or external references, be sure to use clear delimiters \(such as triple backticks `\`\`\``or XML tags`&lt;context&gt;\.\.\.&lt;&#x2F;context&gt;`\) to isolate them from the main text\. This prevents the AI from having the illusion of &quot;prompt injection\.&quot;

### Prompting Strategy

- **System Context:** Directly assign a professional role to the AI and define its operational boundaries\. Example: _&quot;You are a senior Linux kernel R&amp;D expert\. Your task is to help me analyze the logic of memory scheduling\. Please maintain hardcore technical depth in your response and omit unnecessary pleasantries\.&quot;_
- **Task Instruction:** Use precise verbs\. Do not say &quot;look at this code,&quot; but rather say _&quot;refactor the following code, extract common functions, and optimize the time complexity\.&quot;_
- **Few\-Shot Prompting:** For specific output formats, a single example is worth a thousand words\.
- **Chain of Thought:** When facing complex engineering problems or algorithm designs, require the AI to demonstrate its reasoning process\. For example: _&quot;Before providing the final solution, let&#39;s think step by step,&quot;_ or _&quot;Please list your analysis outline first, and then fill in the specific code\.&quot;_
- **Negative Constraints:** Explicitly tell the AI what _not_ to do\.
