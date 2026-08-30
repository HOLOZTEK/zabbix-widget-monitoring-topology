# Changelog

## v1.1.0 - 2026-08-30

- Added the v1.0.7-v1.0.10 VMware and Kubernetes topology improvements as the v1.1 release line.
- Routed VMware VMs through Network nodes below their ESXi Host and scoped same-named ESXi hosts by vCenter.
- Reorganized Kubernetes as Network / aggregate host / Cluster / component-host branches with role-specific icons.
- Reworked display filters to include problem-free and maintenance states while preserving ancestor paths for matching descendants.


All notable public-facing changes are documented here.

## v1.0.6 - 2026-08-24

- Fixed VMware VM identification for official template-generated group names ending in ` (vm)`.
- Kept distinct Kubernetes clusters separate when they share the same Zabbix Server or Proxy path.
- Used the aggregate cluster host name as the Kubernetes cluster label when available.

## v1.0.5 - 2026-08-24

- Corrected VMware connection-host classification and nested Datacenter / Cluster branches below the proper connection host.
- Improved Proxmox network labeling using `{$PVE.URL.HOST}` for interface-less monitoring hosts.
- Replaced the deprecated `selectGroups` API parameter with `selectHostGroups`.

## v1.0.4 - 2026-08-22

- Added dedicated Kubernetes cluster nodes.
- Added VMware Datacenter / Cluster / ESXi / VM hierarchy based on official template discovery data.

## v1.0.3 - 2026-08-11

- Migrated saved filter state from the pre-v1.0.1 storage key.
- Corrected public package naming in documentation and Debian metadata.

## v1.0.2 - 2026-08-11

- Renamed the displayed widget from Monitoring Map to Monitoring Topology.

## v1.0.1 - 2026-08-11

- Prefixed module, namespace, action, JavaScript, CSS, gettext, and helper identifiers with HOLOZTEK-specific names.
- Changed the installed module directory to `holoztek_monitoringmap` with guarded cleanup of the legacy directory.
- Added LICENSE to RPM and DEB package contents.

## v1.0.0 - 2026-08-10

- First public-release line under the MIT License.
- Added Debian packaging and standardized the RPM as a single `noarch` package.
- Renamed the distribution package to `zabbix-widget-monitoring-topology`.

## Previous Releases

Earlier development history is available from Git tags `v0.1.0` through `v0.2.1`.
