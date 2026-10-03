# Domain documentation

This project has one domain context. Use a root `GLOSSARY.md` and `docs/adr/` when concrete terminology or architectural decisions need to be recorded.

Before exploring a domain feature, read the glossary if it exists and any ADRs relevant to the work. If they do not exist, proceed; create them only when resolved concepts or decisions justify them.

Use glossary vocabulary consistently in code, tests, issues, and reviews. Flag an ADR conflict explicitly before implementing a contrary decision.

The product requirements live in `docs/product.md`. Current progress and unresolved proposals live in `docs/current-status.md`. Keep those roles separate from accepted architecture decisions.
