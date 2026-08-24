#!/bin/sh
# manifest.json / RPM spec / debian/changelog のバージョン一致を検査する。
# 不一致があれば非0で終了する。GitHub/Gitea へ公開する前にリリース担当者が
# 手動実行する想定（過去にREADMEのバージョン表記修正漏れが発生した実績があるため）。
set -e

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

MANIFEST_VERSION=$(grep -Eo '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "${ROOT}/manifest.json" \
    | sed -E 's/.*:[[:space:]]*"([^"]*)"/\1/')

SPEC_VERSION=$(grep -Em1 '^Version:' "${ROOT}/packaging/rpm/"*.spec \
    | sed -E 's/^([^:]*:)?Version:[[:space:]]*//')

CHANGELOG_VERSION=$(grep -Em1 '^[a-zA-Z0-9.-]+ \(' "${ROOT}/debian/changelog" \
    | sed -E 's/^[^(]*\(([^)]*)\).*/\1/')

echo "manifest.json:      ${MANIFEST_VERSION}"
echo "RPM spec Version:    ${SPEC_VERSION}"
echo "debian/changelog:    ${CHANGELOG_VERSION}"

if [ -z "${MANIFEST_VERSION}" ] || [ -z "${SPEC_VERSION}" ] || [ -z "${CHANGELOG_VERSION}" ]; then
    echo "Error: could not extract one or more version strings." >&2
    exit 1
fi

if [ "${MANIFEST_VERSION}" != "${SPEC_VERSION}" ] || [ "${MANIFEST_VERSION}" != "${CHANGELOG_VERSION}" ]; then
    echo "Error: version mismatch across files." >&2
    exit 1
fi

echo "OK: all versions match (${MANIFEST_VERSION})."
