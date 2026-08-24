#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <version>" >&2
    echo "Example: $0 1.0.6" >&2
    exit 2
fi

version="$1"
tag="v${version}"
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
fail() { echo "ERROR: $*" >&2; exit 1; }

manifest_version=$(jq -r '.version' "$repo_root/manifest.json")
[ "$manifest_version" = "$version" ] || fail "manifest version is $manifest_version, expected $version"
rpm_version=$(awk '/^Version:/ {print $2; exit}' "$repo_root/packaging/rpm/zabbix-widget-monitoring-topology.spec")
[ "$rpm_version" = "$version" ] || fail "RPM version is $rpm_version, expected $version"
deb_version=$(dpkg-parsechangelog -l "$repo_root/debian/changelog" -S Version 2>/dev/null || true)
[ "$deb_version" = "$version" ] || fail "Debian version is $deb_version, expected $version"

for readme in README.md README.ja.md; do
    path="$repo_root/$readme"
    grep -q "releases/tag/${tag}" "$path" || fail "$readme release link does not match $tag"
    grep -q "releases/download/${tag}/zabbix-widget-monitoring-topology-${version}.noarch.rpm" "$path" || fail "$readme RPM link mismatch"
    grep -q "releases/download/${tag}/zabbix-widget-monitoring-topology_${version}_all.deb" "$path" || fail "$readme DEB link mismatch"
    grep -q "releases/download/${tag}/zabbix-widget-monitoring-topology-${version}.tar.gz" "$path" || fail "$readme source link mismatch"
done

test -s "$repo_root/assets/js/vis-network.min.js" || fail "bundled Vis Network file is missing"
grep -q '@version 10.1.0' "$repo_root/assets/js/vis-network.min.js" || fail "unexpected Vis Network version"
echo "Release version check passed: $version"
