# Increment 6 Prompt

Task: Implement Increment 6 for this slot machine project.

Objective:
Implement reel spin animations (CSS/JS) that simulate a slot machine spin while strictly playing back the already-determined result from `GameManager`. The animation must not alter outcome logic or introduce new randomness, and the existing spin loop must remain correct end-to-end.

Requirements:

1. Add reel spin animation behavior that visually runs before the final result is revealed.

2. Preserve the controller contract:
   - The result must be computed first by `GameManager`
   - The animation must only display that result
   - No outcome logic may exist in the view

3. Ensure result integrity:
   - The final rendered grid must exactly match the result provided by the controller
   - Intermediate animation frames must not affect the final outcome
   - The math module must not be called during animation playback

4. Preserve spin flow sequencing:
   - bet deduction occurs first
   - spin begins
   - animation plays
   - final result is revealed
   - winnings are applied (if applicable)
   - spin state resets

5. Maintain controller/view separation:
   - `GameManager` remains DOM-free
   - animation logic exists only in `view.js`
   - no DOM manipulation in the controller

6. Handle spin-state edge cases:
   - animation must respect the `isSpinning` guard
   - duplicate spin attempts must not trigger overlapping animations
   - animation must cleanly stop and reset for the next spin

7. Ensure compatibility with future increments:
   - animation must allow win/loss feedback to trigger after completion
   - do not hardcode assumptions that block feedback timing

8. Preserve existing UI structure:
   - keep the 3×3 grid unless a minimal structural adjustment is required
   - do not redesign layout

9. Keep changes minimal and maintainable:
   - avoid over-engineering animation systems
   - use simple, understandable CSS/JS patterns

10. Do not break existing tests or linting.

Expected deliverables:

1. Reel animation implemented in the UI layer
2. Any minimal controller/view wiring needed for animation timing
3. Existing app still runs correctly end-to-end
4. A short summary stating:
   - how animation works
   - how result integrity is enforced
   - how spin state is handled
   - which files were modified

Constraints:

- Do not change payout logic
- Do not change slot math or RNG
- Do not introduce randomness into the view
- Do not move logic into the DOM layer
- Do not add sound or new features
- Do not introduce unrelated refactors

Success condition:
The reels animate before stopping and reveal the correct precomputed result, with proper spin-state handling and no changes to game logic or architecture.
