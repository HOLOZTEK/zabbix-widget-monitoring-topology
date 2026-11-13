# zabbix-widget-monitoring-topology

English | [日本語](README.ja.md)

## Overview

Monitoring Topology is a dashboard widget that visualizes the monitoring paths to hosts monitored by Zabbix as a topology.

It draws one or more fixed host groups, or a host or host group received from Navigator or another compatible widget. The topology visualizes Zabbix Server, Zabbix Proxy, and Proxy Group monitoring routes together with VMware virtualization and Kubernetes cluster hierarchies. On Zabbix 8.0, it can also show the collection paths of OpenTelemetry traces stored by APM monitoring.

Vis Network renders the graph in Canvas2D; WebGL is not required.

<a href="screenshots/monitoring-topology-dashboard-example.png" target="_blank"><img src="screenshots/monitoring-topology-dashboard-example.png" width="750" alt="Tree Navigator driving a Monitoring Topology dashboard" /></a>

[Latest release](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/tag/v1.2.7) | [RPM](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.7/zabbix-widget-monitoring-topology-1.2.7.noarch.rpm) | [DEB](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.7/zabbix-widget-monitoring-topology_1.2.7_all.deb) | [Source (.tar.gz)](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.7/zabbix-widget-monitoring-topology-1.2.7.tar.gz) | [Source (.zip)](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.7/zabbix-widget-monitoring-topology-1.2.7.zip)

## Why Monitoring Topology?

A standard dashboard can show host status, but it is not easy to see at a glance which Zabbix Server or Proxy monitors each host. Monitoring Topology draws monitoring routes from Zabbix configuration, item, and discovery relationships, making the monitoring network visible while clarifying its parent-child relationships.

It is suited to environments with many monitored hosts or advanced distributed monitoring where operators need an overview of Server/Proxy-to-host assignments, subnet placement, and VMware or Kubernetes parent-child relationships.

## Features

<table>
  <tr><th align="left" nowrap>Function</th><th align="left">Description</th></tr>
  <tr><td nowrap>Monitoring-path graph</td><td>Connects and displays Zabbix Server, Zabbix Proxy, Proxy Group, Network, and Host nodes.</td></tr>
  <tr><td nowrap>Network display</td><td>Calculates Network nodes from host interface IP addresses and a configurable IPv4 prefix length. Because monitoring-route clarity takes priority, the same network segment can appear in multiple places when it is reached through different routes.</td></tr>
  <tr><td nowrap>VMware monitoring</td><td>Uses official VMware template discovery and item data to build the Datacenter → Cluster → ESXi Host hierarchy and displays VMs through Network nodes below their ESXi Host.</td></tr>
  <tr><td nowrap>Kubernetes monitoring</td><td>Uses official Kubernetes template keys and discovery relationships to display the Network → aggregate host → Kubernetes Cluster → component host hierarchy.</td></tr>
  <tr><td nowrap>Hosts without interfaces</td><td>For monitored hosts without interfaces, derives a network or label from the connection-target macro.</td></tr>
  <tr><td nowrap>Device and monitoring-method display</td><td>Shows monitoring-method badges such as Ping, SNMP, Agent, IPMI, VMware, ODBC, JMX, and Kubernetes on host-type icons.</td></tr>
  <tr><td nowrap>Problem status display</td><td>Colors each host icon background by the highest severity among problems detected on that host.</td></tr>
  <tr><td nowrap>Display filters</td><td>Filters hosts, backend components, and relation lines. The Filter settings tab defines the initial state.</td></tr>
  <tr><td nowrap>Target selection</td><td>Displays multiple fixed host groups, or receives a host or host group from Navigator and updates the topology dynamically.</td></tr>
  <tr><td nowrap>Backend components</td><td>Optionally displays Zabbix DB and Proxy DB nodes.</td></tr>
  <tr><td nowrap>APM monitoring</td><td>Optionally displays the collection paths of OpenTelemetry traces stored by APM monitoring.</td></tr>
  <tr><td nowrap>View continuity and tools</td><td>Preserves positions during refreshes and provides search, fit-to-view, an information panel, configurable drag-follow hops, and optional visible layout animation.</td></tr>
  <tr><td nowrap>Interactive operation</td><td>Supports moving nodes, adjusting the layout, and opening host menus.</td></tr>
</table>

## Topology Models

Monitoring Topology builds the topology from direct Zabbix Server monitoring, distributed monitoring through Zabbix Proxy, interface data, discovery relationships, host macros, and monitoring items. The actual structure depends on the data available from Zabbix.

Problem severity is displayed only for hosts. It is not displayed for groups such as Server, Proxy, Proxy Group, Network, or Cluster.

The main supported model patterns are as follows.

<table>
  <tr><th align="left" nowrap>Pattern</th><th align="left">Detection method and typical path</th><th align="left">Reference image</th></tr>
  <tr><td nowrap>Zabbix Server route</td><td><strong>Typical path:</strong> <code>Zabbix Server -&gt; Network -&gt; Host</code><br>The host is monitored directly by Zabbix Server. Its primary interface and configured subnet prefix determine the Network node.</td><td><a href="screenshots/monitoring-topology-zabbix-server.png" target="_blank"><img src="screenshots/monitoring-topology-zabbix-server.png" width="150" alt="Zabbix Server monitoring route"></a></td></tr>
  <tr><td nowrap>Zabbix Proxy route</td><td><strong>Typical path:</strong> <code>Zabbix Server -&gt; Zabbix Proxy -&gt; Network -&gt; Host</code><br>A host assigned to a standalone Zabbix Proxy is placed below that Proxy and its derived Network node.</td><td><a href="screenshots/monitoring-topology-zabbix-proxy.png" target="_blank"><img src="screenshots/monitoring-topology-zabbix-proxy.png" width="150" alt="Zabbix Proxy monitoring route"></a></td></tr>
  <tr><td nowrap>Proxy Group route</td><td><strong>Typical path:</strong> <code>Zabbix Server -&gt; Proxy Group -&gt; Zabbix Proxy -&gt; Network -&gt; Host</code><br>A host monitored through a Proxy Group is placed below the group and the member Proxy used for its route.</td><td><a href="screenshots/monitoring-topology-proxy-group.png" target="_blank"><img src="screenshots/monitoring-topology-proxy-group.png" width="150" alt="Proxy Group monitoring route"></a></td></tr>
  <tr><td nowrap>VMware monitoring</td><td><strong>Typical path:</strong> <code>Server/Proxy -&gt; Network -&gt; VMware monitoring host (Zabbix Host) -&gt; Datacenter -&gt; Cluster -&gt; ESXi Host -&gt; Network -&gt; VM</code><br>Official VMware template discovery and <code>vmware.hv.*</code> item data provide the VMware monitoring host and inventory hierarchy. Each VM is matched to its vCenter and ESXi Host, then placed below a Network node derived from the guest IP address.</td><td><a href="screenshots/monitoring-topology-vmware.png" target="_blank"><img src="screenshots/monitoring-topology-vmware.png" width="150" alt="VMware monitoring overview"></a></td></tr>
  <tr><td nowrap>Kubernetes monitoring</td><td><strong>Typical path:</strong> <code>Server/Proxy -&gt; Network -&gt; aggregate host (Zabbix Host) -&gt; Kubernetes Cluster -&gt; Kubernetes component host (Zabbix Host)</code><br>Official Kubernetes template item keys and discovery parents identify each cluster. The aggregate host is obtained automatically as the cluster parent, and component hosts such as API Server, Scheduler, Controller Manager, and Kubelet are placed by role. Multiple clusters on the same route remain separate.</td><td><a href="screenshots/monitoring-topology-kubernetes.png" target="_blank"><img src="screenshots/monitoring-topology-kubernetes.png" width="150" alt="Kubernetes monitoring route"></a></td></tr>
</table>

### Drag Follow Hops

This setting controls how many connection hops from a dragged node can participate in layout adjustment, from 0 to 10; the default is 6. Only nodes within the configured number of hops are temporarily released into the physics layout. Nodes outside that range keep their positions.

A value of 0 moves only the dragged node. Nodes placed manually in an earlier drag are excluded from the follow range and retain their positions. After the drag ends and the nearby layout settles, physics is disabled and the adjusted positions are preserved.

Regular refreshes preserve the zoom, pan, node positions, and Proxy highlight. When a Navigator or another broadcasting widget changes the selected hosts or host groups, Monitoring Topology treats the result as a new topology, lays it out again, and fits it to the view. Re-broadcasting the same selection in a different order does not trigger a new layout.

### Layout Iterations Before Display

This setting controls how a newly calculated layout is shown, from 0 to 1000; the default is 0. A value of 0 waits for layout calculation to settle before showing the topology. A value of 1 or more shows the topology after the specified number of iterations and lets the nodes visibly spread until the layout settles or 20 seconds elapse. It applies to the first display, selection changes, and substantially changed topologies; regular refreshes keep the existing layout.

## Backend Components

Backend components are optional and disabled by default. They represent the databases used by Zabbix Server and Zabbix Proxy as logical backend components.

- `Zabbix Server → Zabbix DB`
- `Zabbix Proxy → Proxy DB`

The Zabbix Server database type is determined first from the Server's runtime database-version information. When MySQL, MariaDB, or PostgreSQL is identified, that type is displayed as confirmed information. If runtime information does not identify the type, the Zabbix frontend connection configuration is used as a fallback to infer MySQL or PostgreSQL. When neither source identifies the type, the node is displayed as “Zabbix DB” without a type.

The Zabbix API does not expose the database type used by a Zabbix Proxy, so Monitoring Topology does not guess it and displays the node as “Proxy DB” without a type. When a type is available, the database-node tooltip also shows the source used for the determination.

<a href="screenshots/monitoring-topology-backend-database.png" target="_blank"><img src="screenshots/monitoring-topology-backend-database.png" width="750" alt="Database topology for Zabbix Server and Zabbix Proxy"></a>

## APM Monitoring

APM topology is optional and disabled by default. On Zabbix 8.0 and later, Monitoring Topology builds this logical display structure from OpenTelemetry traces stored by APM monitoring:

`Zabbix Server → APM Data Store → APM-enabled Zabbix Proxy → OpenTelemetry Service (service.name) → OpenTelemetry System (host.name)`

This does not show the Telemetry traffic direction. Traces actually travel from an OpenTelemetry sender through a Zabbix Proxy / APM Collector to the APM Data Store.

The APM Data Store is labeled ClickHouse when the global APM data source can be read; otherwise, a generic label is used. The relation between the APM Data Store and a Proxy indicates an APM-enabled Proxy and the global APM data source. It does not guarantee the Proxy's actual write destination.

OpenTelemetry nodes require at least one Zabbix Host as a Monitoring Topology drawing target and an APM-capable Proxy environment for the operating system in use. The selected Zabbix Host does not need to match the OpenTelemetry System's <code>host.name</code>. A Zabbix 8.0 APM-capable Proxy package is not provided for EL9, so APM/OpenTelemetry display is unavailable there; this does not restrict the operating-system support of the Monitoring Topology widget itself.

<a href="screenshots/monitoring-topology-apm-opentelemetry.png" target="_blank"><img src="screenshots/monitoring-topology-apm-opentelemetry.png" width="750" alt="Logical APM monitoring and OpenTelemetry display structure"></a>

See the [APM Monitoring / OpenTelemetry Topology Guide](docs/OTEL_TOPOLOGY_SETUP.md) for detailed settings, access controls, retrieval limits, constraints, and troubleshooting.

## Display Filters

The filter panel limits visible Host nodes, backend components, and relation lines. Within one host category, selected values are combined with OR; the five host categories are combined with AND. Ancestor nodes and edges leading to matching descendant hosts remain visible so that paths are not disconnected.

<table>
        <tr><th align="left" nowrap>Category</th><th align="left">Choices</th><th align="left">Purpose and default</th></tr>
        <tr><td nowrap>Problem status</td><td>Unacknowledged, Acknowledged, No problem, Include hosts in maintenance, Colorize by severity</td><td>Filters non-maintenance hosts by problem state. Unacknowledged, Acknowledged, and No problem are enabled by default. Include hosts in maintenance is an independent visibility condition and is disabled by default. Colorize by severity affects color only and is enabled by default.</td></tr>
        <tr><td nowrap>Host status</td><td>Normal hosts, No interface configured, Local host monitoring, Disabled hosts</td><td>Partitions hosts by configuration and operational state. Only Normal hosts is enabled by default.</td></tr>
        <tr><td nowrap>Interface</td><td>Available, Mixed, Not available, Unknown</td><td>Includes hosts by interface availability. All choices are enabled by default.</td></tr>
        <tr><td nowrap>Monitoring route</td><td>Zabbix Server, Zabbix Proxy, Proxy Group</td><td>Includes hosts by their upstream monitoring route. All choices are enabled by default.</td></tr>
        <tr><td nowrap>Monitoring method</td><td>Ping, Zabbix Agent, SNMP, IPMI, JMX, Other</td><td>Includes hosts by detected monitoring method. All choices are enabled by default. Other includes VMware, ODBC, Kubernetes, and methods that cannot be classified separately.</td></tr>
        <tr><td nowrap>Components</td><td>Database, APM data store, OpenTelemetry</td><td>Shows or hides loaded component nodes together with their connected lines. Hiding a component does not stop data acquisition.</td></tr>
        <tr><td nowrap>Relations</td><td>Monitoring, Database, APM storage, Telemetry</td><td>Shows or hides only the loaded relation lines; nodes remain visible. Telemetry covers Proxy—Service and Service—System lines.</td></tr>
</table>

<a href="screenshots/monitoring-topology-filters.png" target="_blank"><img src="screenshots/monitoring-topology-filters.png" height="395" alt="Monitoring Topology display filter panel"></a>

Clearing every visibility choice in a host category hides every host. Colorize by severity does not affect visibility. The Filter settings tab defines the initial state. Dashboard filter changes are kept during regular refreshes but are not saved in the browser; reloading the page or selecting Reset restores the Filter-tab values. Filter changes do not refetch data or move nodes. Components and relations that are not acquired are disabled in both filter locations.

## Information Panel

The toolbar's Info panel shows the fetched topology's node and relation counts, database-topology state, APM/OpenTelemetry observation window and retrieval statistics, retrieval status, and legend. It updates during regular refreshes without issuing additional queries. OpenTelemetry Service and System tooltips show Last observed from the newest Span retrieved by the widget, in the user's Zabbix time zone.

## Settings

The settings form is organized into four tabs.

<table>
  <tr><th align="left" nowrap>Tab</th><th align="left" nowrap>Setting</th><th align="left">Description</th></tr>
  <tr><td nowrap>Monitoring</td><td nowrap>Host</td><td>Receive-only connector used to link Navigator or another compatible widget.</td></tr>
  <tr><td nowrap>Monitoring</td><td nowrap>Host groups</td><td>Selects multiple fixed host groups, including their subgroups, or receives a host group from another widget.</td></tr>
  <tr><td nowrap>Monitoring</td><td nowrap>Subnet prefix length</td><td>IPv4 prefix used to derive network nodes; default is 24.</td></tr>
  <tr><td nowrap>Monitoring</td><td nowrap>Zabbix Server label</td><td>Label displayed for the root server node.</td></tr>
  <tr><td nowrap>Data acquisition</td><td nowrap>Backend components</td><td>Acquires database topology and APM monitoring data. APM topology requires Zabbix 8.0 or later.</td></tr>
  <tr><td nowrap>Data acquisition</td><td nowrap>OTel observation window</td><td>Minutes in which OpenTelemetry Spans are considered; 5 to 1440, default 15.</td></tr>
  <tr><td nowrap>Filter</td><td nowrap>Initial filter state</td><td>Defines the initial values for Problem status, Host status, Interface, Monitoring route, Monitoring method, Components, and Relations.</td></tr>
  <tr><td nowrap>Appearance</td><td nowrap>Font, style, and edge settings</td><td>Controls node-label font, edge color, and edge width.</td></tr>
  <tr><td nowrap>Appearance</td><td nowrap>Drag follow hops</td><td>Connected range that follows a dragged node, from 0 to 10; default is 6.</td></tr>
  <tr><td nowrap>Appearance</td><td nowrap>Layout iterations before display</td><td>Iterations completed before a new layout becomes visible, from 0 to 1000; default is 0.</td></tr>
  <tr><td nowrap>Appearance</td><td nowrap>Filter icon position</td><td>Top-left, top-right, bottom-left, or bottom-right.</td></tr>
</table>

<a href="screenshots/monitoring-topology-settings.png" target="_blank"><img src="screenshots/monitoring-topology-settings.png" width="620" alt="Monitoring Topology widget settings"></a>

## Target Selection and Dashboard Integration

Select one or more fixed host groups in the widget settings to use Monitoring Topology on its own. Hosts in their subgroups are included.

For dynamic selection, connect Host or Host groups to Navigator or another compatible widget. Host is receive-only; the Host groups field supports either fixed selections or a widget connection. If fixed host groups and a received host are both specified, the widget displays their union. With no fixed target and no received target, it shows an empty state.

1. Add Tree Navigator or another widget that broadcasts `_hostid` or `_hostgroupid`.
2. Add Monitoring Topology to the same dashboard page.
3. Set the refresh interval as needed. When APM is enabled, APM trace data is retrieved during refresh.
4. In Monitoring Topology settings, connect Host and/or Host group to the source widget.
5. Select a host to show its route, or a host group to show routes for hosts in that group.

## Requirements

- Zabbix 7.0 or 8.0
- PHP 8.1 or later
- RPM package: RHEL-compatible 9 / 10
- A browser supported by the Zabbix frontend

## Installation

### Install from RPM

```bash
dnf install ./zabbix-widget-monitoring-topology-1.2.7.noarch.rpm
```

### Install from DEB

```bash
apt install ./zabbix-widget-monitoring-topology_1.2.7_all.deb
```

The packages install the runtime files into the active Zabbix frontend module directory. Then scan and enable the module from Administration -> Modules and add the widget to a dashboard.

### Install from Source

RPM or DEB installation is recommended. For a manual installation, use the official Source package attached to the Release. It contains every runtime file, including `assets/js/vis-network.min.js`. Do not use the automatically generated “Source code” archive.

The destination depends on the Zabbix version:

| Zabbix | Module directory |
|---|---|
| 8.0 | `/usr/share/zabbix/ui/modules/holoztek_monitoringmap/` |
| 7.0 | `/usr/share/zabbix/modules/holoztek_monitoringmap/` |

Example for Zabbix 8.0:

```bash
curl -L -o zabbix-widget-monitoring-topology-1.2.7.tar.gz https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.7/zabbix-widget-monitoring-topology-1.2.7.tar.gz
tar -xzf zabbix-widget-monitoring-topology-1.2.7.tar.gz
sudo mkdir -p /usr/share/zabbix/ui/modules/holoztek_monitoringmap
sudo cp -a zabbix-widget-monitoring-topology-1.2.7/. /usr/share/zabbix/ui/modules/holoztek_monitoringmap/
sudo systemctl reload php-fpm
```

For Zabbix 7.0, use `/usr/share/zabbix/modules/holoztek_monitoringmap/` instead. Reload the applicable web server when required, scan modules in the Zabbix frontend, and enable Monitoring Topology. Do not overlay a manual installation on an RPM- or DEB-managed installation.

## Documentation

- [CHANGELOG](docs/CHANGELOG.md)
- [CONTRIBUTING](docs/CONTRIBUTING.md)
- [SECURITY](docs/SECURITY.md)
- [Screenshot Guide](docs/screenshot-guide.md)
- [APM Monitoring / OpenTelemetry Topology Guide](docs/OTEL_TOPOLOGY_SETUP.md)
- [LICENSE](LICENSE)

## Repository Layout

Runtime module files remain in the repository root and under `actions/`, `assets/`, `includes/`, `locale/`, and `views/`. Packaging is under `packaging/rpm/` and `debian/`; publication and maintenance documents are under `docs/`.

## Bundled Dependency

`assets/js/vis-network.min.js` is Vis Network 10.1.0, distributed under the MIT or Apache-2.0 license as stated in its source header.

## Maintainer

Developed and maintained by [HOLOZTEK](https://github.com/HOLOZTEK).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
