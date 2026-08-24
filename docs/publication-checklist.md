# Publication Checklist

Use this checklist before publishing `zabbix-widget-monitoring-topology` from staging to GitHub.

## Source

- Confirm staging is based on the approved release revision.
- Confirm `manifest.json`, RPM, Debian changelog, README links, filenames, and install commands use the approved version.
- Run `scripts/check-version-consistency.sh`.
- Run `scripts/check-release-version.sh <approved-version>`.
- Confirm `manifest.json` contains public author, description, and URL metadata.
- Confirm `assets/js/vis-network.min.js` is tracked and its version/license header is intact.
- Confirm no private URLs, credentials, internal hostnames, or environment-specific files are present.

## Repository

- Confirm owner is exactly `HOLOZTEK` and repository is exactly `zabbix-widget-monitoring-topology`.
- Confirm GitHub visibility is public.
- Set topics: `zabbix`, `zabbix-widget`, `monitoring`, `topology`, `dashboard`, and `php`.
- Confirm the approval record contains the exact owner, repository, version, full staging commit SHA, target GitHub, and public visibility.

## Documentation

- Confirm English `README.md` and Japanese `README.ja.md` link to each other.
- Confirm CHANGELOG, CONTRIBUTING, SECURITY, screenshot guide, and this checklist are under `docs/`.
- Confirm README feature, configuration, integration, installation, and migration guidance matches the implementation.
- Confirm RPM and DEB metadata use public maintainer and source values.
- Confirm LICENSE contains the standard MIT text and copyright holder `ttake-55`.
- Confirm all required screenshots exist and contain no real infrastructure identifiers, internal URLs, credentials, alerts, or production data.
- Confirm README image links are added only for reviewed screenshots that exist.

## Verification

- Validate JSON and shell scripts.
- Validate PHP syntax for all PHP files.
- Build or inspect RPM and DEB package contents where the required build tools are available.
- Confirm runtime assets listed in `manifest.json`, RPM, and Debian install metadata exist.
- Compare staged content and intended GitHub output.

## Release

- Do not publish without the required control-plane approval.
- Push only the approved branch and tag whose commit matches the approved full staging SHA.
- Create the GitHub release only from the approved tag and version.
