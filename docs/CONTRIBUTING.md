# Contributing

Thank you for your interest in improving zabbix-widget-monitoring-topology.

## Scope

Keep changes compatible with the Zabbix and PHP versions listed in the README. Changes to topology classification should document which Zabbix template, discovery relationship, item key, macro, or interface property provides the evidence.

## Development Notes

- Do not commit generated packages, credentials, production data, or environment-specific files.
- Keep `assets/js/vis-network.min.js` available because it is a required runtime dependency.
- Update both README files and `docs/CHANGELOG.md` for user-visible changes.
- Keep `manifest.json`, RPM, and Debian versions consistent.
- Preserve receive-only behavior for Host and Host group inputs unless a new interaction model is explicitly designed.
- Test light and dark themes when changing graph colors or labels.

## Reporting Issues

Include the Zabbix, PHP, widget, and browser versions; the relevant template name; reproduction steps; expected and actual topology; and sanitized screenshots or sample data when useful.

## Pull Requests

Describe the purpose, affected topology branch, compatibility impact, and verification performed. Follow `SECURITY.md` for security-sensitive reports.
