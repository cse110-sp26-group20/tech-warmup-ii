### 1. The Engineering Process

* **Research & Ideation:** We began by gathering domain knowledge on both physical and online slot machines, focusing on UI/UX design and legal restrictions. We utilized Miro to share our research findings and facilitate team discussions.
* **AI Workflow Investigation:** We divided our efforts to understand how to best integrate AI into our workflow:
    * One subgroup researched how AI models apply specific "Skills."
    * Another subgroup explored effective prompt engineering strategies.
    * A third subgroup utilized AI to generate rough project Increments.
* **Initial Prototyping:** We developed a preliminary demo to thoroughly understand the rules and technical constraints of the assignment.
* **Architectural Design:** We adopted a virtual MVC (Model-View-Controller) architecture. This design choice increased our code robustness and ensured scalability, laying a solid foundation for future database and module integrations.
* **Parallel Implementation & Delegation:** Based on our established architecture, existing documentation, and AI tools, we divided the development into four specialized groups:
    * **Group 1 (Core & Testing):** Implemented the foundational algorithm and MVC modules, ensuring that all JavaScript logic and algorithms were rigorously unit-tested.
    * **Group 2 (Integration):** Focused on integrating the UI with the JavaScript backend, ensuring all HTML and CSS components were correctly linked and responsive.
    * **Group 3 (Feature & UI Optimization):** Tasked with the most critical components, this group optimized the UI and integrated advanced features such as sound effects, animations, and an Auto-Spin module.
    * **Group 4 (QA & Optimization):** Handled overall project optimization and logic verification. They conducted extensive stress testing, including running 500,000 simulated spins to verify the mathematical accuracy of the win rates.
* **Objective & Goals:** The primary objective of this project was to build a scalable application with a sound architectural design. We prioritized reliability and scalability above all else. This rationale drove our decision to implement the MVC pattern; by strictly separating logic from data, we ensured the system could easily support future feature expansions. To validate this approach, we introduced an experimental "social" feature during the final stages to observe how seamlessly the existing structure could integrate new modules.
* **Scope & Strategic Focus:** Ultimately, we constrained the project scope to around 20 increments. Because of this limitation, we focused our primary efforts on core functionality and ensuring the absolute reliability of our algorithmic logic rather than over-complicating the feature set and UI.