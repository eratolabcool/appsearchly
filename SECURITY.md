# Security Policy

## Reporting a vulnerability

Do not open a public GitHub issue for vulnerabilities involving authentication, private submissions, administrative access, secrets, payment data, personal information, or remote code execution.

Report the issue privately to the repository owner with:

- the affected route, component, or commit;
- clear reproduction steps;
- expected and actual behavior;
- potential impact;
- any suggested mitigation;
- whether the issue has been disclosed elsewhere.

Avoid accessing, modifying, or downloading data that is not yours. Use the smallest proof necessary to demonstrate the problem.

## Sensitive areas

The following areas require additional review:

- tool submission and owner-claim workflows;
- URL fetching and crawler protections against SSRF;
- redirect and affiliate-link handling;
- admin authentication and authorization;
- uploaded logos and screenshots;
- payment and sponsorship webhooks;
- analytics events containing identifiers;
- environment variables and deployment secrets.

## Supported versions

Until the first stable release, only the current `main` branch is supported.