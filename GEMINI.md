# GEMINI.md

## Meeting Basic Software Engineering Standards

All code generated or contributed must meet the following standards:

### 1. Linting &amp; Code Quality

-  Ensure all source code is linted and free of warnings/errors.
-  Follow best practices for:
    -  HTML validation and semantic structure
    -  CSS organization and proper usage
    -  JavaScript style, syntax, and consistency
-  Use established linters and formatters (e.g., ESLint, Prettier).

### 2. Documentation

-  All source code must be clearly documented.
-  JavaScript must use **JSDoc** comments with type annotations.
-  Document:
    -  Function purpose
    -  Parameters and return values
    -  Any non-obvious logic or decisions

### 3. Testing

- **Unit tests are required at minimum.**
-  Write tests incrementally alongside development (not at the end).
-  Prefer test-driven or test-assisted workflows when possible.
-  End-to-end tests (e.g., using Playwright) are strongly encouraged.
-  Code should not be considered complete without passing tests.

### 4. Clean Code Principles

Follow clean code practices to ensure readability and maintainability:

- **Meaningful names**<br> Use clear, descriptive variable, function, and class names.
- **Small, focused functions/classes**<br> Each unit should have a single responsibility.
- **DRY (Don’t Repeat Yourself)**<br> Avoid duplication—extract reusable logic where appropriate.
- **Error handling**<br> Anticipate and properly handle failures and edge cases.
- **Abstraction &amp; modularity**<br> Organize code into logical, reusable components.
- **Maintainability**<br> Code should be easy to understand, modify, and extend.

