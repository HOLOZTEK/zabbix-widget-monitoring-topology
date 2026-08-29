# zabbix-widget-monitoring-topology

English | [日本語](README.ja.md)

## Overview

Monitoring Topology is a Zabbix dashboard widget that visualizes the monitoring path from Zabbix Server through proxy, network, virtualization, cluster, and host layers as an interactive topology graph.

It receives host or host-group selections from another dashboard widget, such as [Tree Navigator](https://github.com/HOLOZTEK/zabbix-widget-tree-navigator), and redraws the topology for the selected scope. Vis Network renders the graph in Canvas2D; WebGL is not required.

<a href="screenshots/monitoring-topology-dashboard-example.png" target="_blank"><img src="screenshots/monitoring-topology-dashboard-example.png" width="750" alt="Tree Navigator driving a Monitoring Topology dashboard" /></a>

[Latest release](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/tag/v1.0.6) | [RPM](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.0.6/zabbix-widget-monitoring-topology-1.0.6.noarch.rpm) | [DEB](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.0.6/zabbix-widget-monitoring-topology_1.0.6_all.deb) | [Source](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.0.6/zabbix-widget-monitoring-topology-1.0.6.tar.gz)

## Why Monitoring Topology?

Zabbix dashboards usually show host status, but the monitoring route behind each host can be difficult to understand at a glance. Monitoring Topology exposes that route and groups infrastructure by the relationships detected from Zabbix configuration and item data.

Use it when operators need to see which server or proxy monitors a host, how hosts map to subnets, or how VMware and Kubernetes resources relate to their parent infrastructure.

## Features

<table>
  <tr><th align="left" nowrap>Function</th><th align="left">What it does</th></tr>
  <tr><td nowrap>Monitoring-path graph</td><td>Shows Zabbix Server, Proxy Group, Proxy, Network, Cluster, Datacenter, Host, and VM nodes with connecting edges.</td></tr>
  <tr><td nowrap>Network derivation</td><td>Calculates network nodes from host and proxy interface addresses using a configurable IPv4 prefix length.</td></tr>
  <tr><td nowrap>VMware hierarchy</td><td>Builds Datacenter / Cluster / ESXi / VM branches from official VMware template discovery and item data.</td></tr>
  <tr><td nowrap>Kubernetes grouping</td><td>Detects official Kubernetes template item keys and separates multiple clusters under the same monitoring path.</td></tr>
  <tr><td nowrap>Proxmox handling</td><td>Uses the Proxmox endpoint macro to label or derive a network when the monitored host has no Zabbix interface.</td></tr>
  <tr><td nowrap>Device and method indicators</td><td>Uses host-type icons and badges for Ping, SNMP, Agent, IPMI, VMware, ODBC, JMX, Kubernetes, and other methods.</td></tr>
  <tr><td nowrap>Operational status</td><td>Marks non-responding proxies and applies problem-severity colors to host nodes only.</td></tr>
  <tr><td nowrap>Interactive graph</td><td>Supports physics-based layout, node dragging, hover tooltips, and host-detail navigation.</td></tr>
  <tr><td nowrap>Display filters</td><td>Filters by problem acknowledgement, host state, host configuration, interface, monitoring route, and monitoring method.</td></tr>
  <tr><td nowrap>Widget integration</td><td>Receives host and host-group dynamic parameters from Tree Navigator or another compatible widget.</td></tr>
  <tr><td nowrap>Theme controls</td><td>Configures node font, edge appearance, server label, subnet prefix, and filter-button position.</td></tr>
</table>

## Topology Models

Monitoring Topology derives the graph from proxy assignments, interfaces, discovery relationships, macros, and monitoring items. The main model patterns are:

<table>
  <tr><th align="left" nowrap>Pattern</th><th align="left">Detection method and typical path</th><th align="left">Reference image</th></tr>
  <tr><td nowrap>Zabbix Server route</td><td><strong>Typical path:</strong> <code>Zabbix Server -&gt; Network -&gt; Host</code><br>The host is monitored directly by Zabbix Server. Its primary interface and configured subnet prefix determine the Network node.</td><td><a href="screenshots/monitoring-topology-overview.png" target="_blank"><img src="screenshots/monitoring-topology-overview.png" width="150" alt="Zabbix Server monitoring route"></a></td></tr>
  <tr><td nowrap>Zabbix Proxy route</td><td><strong>Typical path:</strong> <code>Zabbix Server -&gt; Zabbix Proxy -&gt; Network -&gt; Host</code><br>A host assigned to a standalone Zabbix Proxy is placed below that Proxy and its derived Network node.</td><td><a href="screenshots/monitoring-topology-overview.png" target="_blank"><img src="screenshots/monitoring-topology-overview.png" width="150" alt="Zabbix Proxy monitoring route"></a></td></tr>
  <tr><td nowrap>Proxy Group route</td><td><strong>Typical path:</strong> <code>Zabbix Server -&gt; Proxy Group -&gt; Zabbix Proxy -&gt; Network -&gt; Host</code><br>A host monitored through a Proxy Group is placed below the group and the member Proxy used for its route.</td><td><a href="screenshots/monitoring-topology-overview.png" target="_blank"><img src="screenshots/monitoring-topology-overview.png" width="150" alt="Proxy Group monitoring route"></a></td></tr>
  <tr><td nowrap>VMware monitoring</td><td><strong>Typical path:</strong> <code>Server/Proxy -&gt; Network -&gt; VMware connection host -&gt; Datacenter -&gt; Cluster -&gt; ESXi -&gt; VM</code><br>Official VMware template discovery and <code>vmware.hv.*</code> item data provide the connection host, inventory hierarchy, and VM-to-ESXi relationship.</td><td><a href="screenshots/monitoring-topology-virtualization.png" target="_blank"><img src="screenshots/monitoring-topology-virtualization.png" width="150" alt="VMware monitoring overview"></a></td></tr>
  <tr><td nowrap>Kubernetes monitoring</td><td><strong>Typical path:</strong> <code>Server/Proxy -&gt; Kubernetes Cluster -&gt; Kubernetes hosts</code><br>Official Kubernetes template item keys and discovery parents identify each cluster and keep multiple clusters on the same route separate.</td><td><a href="screenshots/monitoring-topology-kubernetes.png" target="_blank"><img src="screenshots/monitoring-topology-kubernetes.png" width="150" alt="Kubernetes monitoring route"></a></td></tr>
</table>

The exact structure depends on the data available in Zabbix. Only Host nodes carry problem-severity coloring; Server, Proxy Group, Proxy, Network, Datacenter, and Cluster nodes do not represent aggregated health.

## Display Filters

The filter panel limits which Host nodes remain visible. Within one category, selected values are combined with OR; the six categories are combined with AND. Parent infrastructure nodes and edges disappear automatically when none of their descendant hosts remain visible.

<table>
        <tr><th align="left" nowrap>Category</th><th align="left">Choices</th><th align="left">Purpose and default</th></tr>
        <tr><td nowrap>Problem events</td><td>Unacknowledged, Acknowledged</td><td>Controls which problem severities contribute to host coloring rather than host visibility. Both are enabled by default; clearing both removes problem coloring.</td></tr>
        <tr><td nowrap>Host status</td><td>Enabled hosts, In maintenance, Disabled hosts</td><td>Includes hosts by operational state. Only Enabled hosts is selected by default.</td></tr>
        <tr><td nowrap>Host configuration</td><td>Normal hosts, No interface configured, Local host monitoring</td><td>Includes ordinary interface-based hosts, interface-less hosts, or locally monitored hosts. Only Normal hosts is selected by default.</td></tr>
        <tr><td nowrap>Interface</td><td>Available, Mixed, Not available, Unknown</td><td>Includes hosts by interface availability. All choices are enabled by default.</td></tr>
        <tr><td nowrap>Monitoring route</td><td>Zabbix Server, Zabbix Proxy, Proxy Group</td><td>Includes hosts by their upstream monitoring route. All choices are enabled by default.</td></tr>
        <tr><td nowrap>Monitoring method</td><td>Ping, Zabbix Agent, SNMP, IPMI, JMX, Other</td><td>Includes hosts by detected monitoring method. All choices are enabled by default. Other includes VMware, ODBC, Kubernetes, and methods that cannot be classified separately.</td></tr>
</table>

<a href="screenshots/monitoring-topology-filters.png" target="_blank"><img src="screenshots/monitoring-topology-filters.png" width="180" alt="Monitoring Topology display filter panel"></a>

Except for Problem events, clearing every choice in a category hides every host. Filter state is saved per widget in the browser, and Reset restores the defaults above.

## Settings

<table>
  <tr><th align="left" nowrap>Setting</th><th align="left">Description</th></tr>
  <tr><td nowrap>Host / Host group</td><td>Receive-only connectors used to link another dashboard widget.</td></tr>
  <tr><td nowrap>Subnet prefix length</td><td>IPv4 prefix used to derive network nodes; default is 24.</td></tr>
  <tr><td nowrap>Zabbix Server label</td><td>Label displayed for the root server node.</td></tr>
  <tr><td nowrap>Font size</td><td>Node-label size from 8 to 24 pixels.</td></tr>
  <tr><td nowrap>Style</td><td>Normal, bold, or italic node labels.</td></tr>
  <tr><td nowrap>Font color</td><td>Explicit node-label color; empty uses automatic light/dark theme detection.</td></tr>
  <tr><td nowrap>Edge color</td><td>Color of graph edges.</td></tr>
  <tr><td nowrap>Edge width</td><td>Edge width from 1 to 8 pixels.</td></tr>
  <tr><td nowrap>Filter icon position</td><td>Top-left, top-right, bottom-left, or bottom-right.</td></tr>
</table>

<a href="screenshots/monitoring-topology-settings.png" target="_blank"><img src="screenshots/monitoring-topology-settings.png" width="620" alt="Monitoring Topology widget settings"></a>

## Dashboard Integration

This widget is receive-only and intentionally shows an empty state until a host or host group is received.

1. Add Tree Navigator or another widget that broadcasts `_hostid` or `_hostgroupid`.
2. Add Monitoring Topology to the same dashboard page.
3. In Monitoring Topology settings, connect Host and/or Host group to the source widget.
4. Select a host to show its route, or a host group to show routes for hosts in that group.

## Requirements

- Zabbix 7.0 or later
- PHP 8.3 or later for packaged installation
- Browser with Canvas2D support

## Installation

### Install from RPM

```bash
rpm -Uvh zabbix-widget-monitoring-topology-1.0.6.noarch.rpm
```

### Install from DEB

```bash
apt install ./zabbix-widget-monitoring-topology_1.0.6_all.deb
```

The packages install the runtime files into the active Zabbix frontend module directory. Then scan and enable the module from Administration -> Modules and add the widget to a dashboard.

### Install from Source

RPM or DEB installation is recommended. For a source installation:

```bash
curl -L -o zabbix-widget-monitoring-topology-1.0.6.tar.gz https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.0.6/zabbix-widget-monitoring-topology-1.0.6.tar.gz
tar -xzf zabbix-widget-monitoring-topology-1.0.6.tar.gz
install -d /usr/share/zabbix/ui/modules/holoztek_monitoringmap
cd zabbix-widget-monitoring-topology-1.0.6
cp -a manifest.json Module.php Widget.php actions assets includes locale views /usr/share/zabbix/ui/modules/holoztek_monitoringmap/
```

Use `/usr/share/zabbix/modules/holoztek_monitoringmap` if the installation uses the legacy frontend module path. Set readable ownership and permissions, scan modules, and enable Monitoring Topology.

## Documentation

- [CHANGELOG](docs/CHANGELOG.md)
- [CONTRIBUTING](docs/CONTRIBUTING.md)
- [SECURITY](docs/SECURITY.md)
- [Screenshot Guide](docs/screenshot-guide.md)
- [LICENSE](LICENSE)

## Repository Layout

Runtime module files remain in the repository root and under `actions/`, `assets/`, `includes/`, `locale/`, and `views/`. Packaging is under `packaging/rpm/` and `debian/`; publication and maintenance documents are under `docs/`.

## Bundled Dependency

`assets/js/vis-network.min.js` is Vis Network 10.1.0, distributed under the MIT or Apache-2.0 license as stated in its source header.

## Maintainer

Developed and maintained by [HOLOZTEK](https://github.com/HOLOZTEK).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
