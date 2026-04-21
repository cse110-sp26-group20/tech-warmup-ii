# Online Security for Slot Machines

This document outlines the foundational domain knowledge and security principles required for developing a robust, secure online slot machine.

## 1. RNG Integrity & Anti-Tampering
The Random Number Generator (RNG) is the absolute core of any slot machine. In an online environment, the RNG must be securely isolated on the server.
* **Server-Side Exclusivity:** Client-side RNG is fundamentally insecure because any client environment can be decompiled, manipulated, or bypassed. The outcome of a spin must always be calculated by a secure random number generator on the server.
* **Decoupled Architecture & Instantaneous Resolution:** As observed in physical machines, modern slots use a decoupled architecture. The moment the player clicks "Spin," the server instantly computes the final outcome. All client-side animations (reels spinning, anticipatory pauses, near misses) are purely visual "playbacks" of an already locked server result.
* **Anti-Tampering:** Because outcomes are determined before the visual spin begins, clients cannot tamper with the result midway through an animation. State must be preserved securely (similar to physical NVRAM) to recover gracefully from network interruptions.

## 2. Preventing Concurrent Request Exploits
A common attack vector in online gambling is exploiting race conditions—submitting multiple requests simultaneously to duplicate an action (e.g., spinning multiple times on a single bet balance).
* **Race Conditions:** If a server deducts a bet and calculates a win without properly locking the player's session state, an attacker might fire 50 rapid-fire spin requests. Without locks, the server might process all 50 spins while only deducting the cost of one bet from the initial balance.
* **State-Validation & Locking:** To prevent this, every spin request must employ server-side locking (e.g., database row locks or atomic operations). The server must:
    1. Lock the player's wallet/session.
    2. Verify sufficient funds exist.
    3. Deduct the bet amount (atomic transaction).
    4. Generate the spin result.
    5. Unlock the state.
* **Idempotency:** Assigning a unique Spin ID to every transaction ensures that if a network timeout occurs, a retried request won't result in a double charge or a duplicate spin.

## 3. Input Validation & Trust Boundaries
In a secure client-server model, the client is inherently untrusted. The trust boundary strictly ends at the server's API endpoints.
* **Never Trust Client Data:** The server must never accept the spin outcome, the resulting win amount, or the current wallet balance from the client.
* **Validating the Bet:** Even the bet amount submitted by the client must be validated against a strict, predefined list of allowed bet tiers. The server must cross-reference this bet amount against the player's actual server-side balance.
* **Action Authorization:** Ensure that the user initiating the action is fully authenticated and authorized, verifying session tokens rather than relying on basic user IDs passed in the payload.

## 4. Developer's Security Checklist
When implementing the spin logic and API, developers must adhere to the following security considerations:
* **[ ] Server-Side RNG:** Ensure outcomes are strictly generated on the server using a secure RNG library.
* **[ ] Atomic Transactions & Locking:** Implement strict concurrency controls to prevent race conditions and double-spends.
* **[ ] Session Management & Authentication:** Validate all API requests using secure, short-lived session tokens.
* **[ ] Request Integrity:** Consider request signing or payload hashing to prevent tampering.
* **[ ] Input Validation:** Reject any client requests with arbitrary bet amounts, spoofed balances, or malformed parameters.
* **[ ] Audit Logging:** Maintain immutable, time-stamped logs of all wagers, outcomes, and balance changes for compliance and fraud investigation.
* **[ ] Rate Limiting:** Implement rate limiters on spin endpoints to mitigate automated bot attacks or brute-force API exploitation.
* **[ ] State Recovery:** Ensure the client can resync with the server seamlessly if a connection drops mid-spin, resuming from the exact final state without losing funds.