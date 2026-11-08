# APM Monitoring / OpenTelemetry Topology Guide

[日本語](OTEL_TOPOLOGY_SETUP.ja.md)

This guide describes the conditions and operational checks required for Monitoring Topology to draw logical collection relationships from OpenTelemetry traces already collected by Zabbix 8.0 APM monitoring.

It assumes that Zabbix APM monitoring and the path that sends traces from OpenTelemetry senders to Zabbix are already configured and that traces are visible in Zabbix. It does not cover how to configure APM monitoring itself.

## Terminology

| Term | Meaning in this guide |
|---|---|
| APM monitoring | The Zabbix 8.0 feature that receives, stores, and displays OpenTelemetry traces. |
| OpenTelemetry trace | A Trace and its Spans stored by APM monitoring. Monitoring Topology uses Span Resource Attributes to determine the topology. Metrics and Logs are not used. |
| OpenTelemetry Service | A service node created from the <code>service.name</code> Resource Attribute. |
| OpenTelemetry System | An execution-environment node created from the <code>host.name</code> Resource Attribute. |
| Telemetry | The label shown in the widget's Relations filter. It means relations generated from OpenTelemetry traces. |

## Logical Display Structure and Actual Traffic Direction

Monitoring Topology uses the following logical hierarchy to make monitoring and collection relationships understandable:

<code>Zabbix Server → APM Data Store → APM-enabled Zabbix Proxy → OpenTelemetry Service → OpenTelemetry System</code>

This is not a communication-flow diagram. Traces actually travel in this direction:

<code>OpenTelemetry sender → Zabbix Proxy / APM Collector → APM Data Store</code>

OpenTelemetry senders include applications, AI agents, OpenTelemetry SDKs, and OpenTelemetry Collectors. The logical hierarchy is built from the Zabbix Proxy that received each trace and from Span Resource Attributes. It does not represent application call relationships or physical network routes.

The APM Data Store is labeled ClickHouse when the global APM data source can be read; otherwise, a generic label is used. The line between the APM Data Store and a Zabbix Proxy is a logical relation between an APM-enabled Proxy and the global APM data source. It does not guarantee the actual write destination because a Proxy may use an individually configured data source.

OpenTelemetry Service and OpenTelemetry System nodes are separate from Zabbix Host nodes. Nodes with identical names are not merged automatically.

## Drawing Prerequisites

The following conditions must be met.

| Condition | Requirement |
|---|---|
| Zabbix and Proxy environment | Zabbix Server and the relevant Zabbix Proxy must be version 8.0 or later, and an APM-capable Proxy package must be available for the operating system in use. |
| APM monitoring | OpenTelemetry traces must be received, and the relevant Spans must be visible in the Zabbix APM view. |
| Drawing target | Monitoring Topology must have at least one Zabbix Host selected through a fixed selection or received from another widget. |
| Proxy APM Collector | The APM Collector must be enabled on the relevant Zabbix Proxy. |
| Proxy-side setting | The Zabbix Proxy must add <code>holoztek.zabbix.proxyid</code> to received Spans for the Traces signal, using that Proxy's own <code>proxyid</code> as the value. |
| Span-side Proxy identity attribute | The stored Span must contain <code>holoztek.zabbix.proxyid</code>, and its value must match the <code>proxyid</code> of the Proxy that received the trace. |
| Service name | The Span must contain a non-empty <code>service.name</code>. |
| Widget setting | APM must be enabled under Backend components. |
| OTel observation window | A matching Span must be stored within the configured window. |

At least one Zabbix Host is required before OpenTelemetry nodes can be shown, but the selected Zabbix Host does not need to match the OpenTelemetry System's <code>host.name</code>. OpenTelemetry nodes are retrieved independently from APM data.

<code>host.name</code> is optional. An OpenTelemetry System node is created only when this attribute has a value. Sending only Metrics or Logs does not create topology nodes.

APM/OpenTelemetry display cannot be used on EL9 because a Zabbix 8.0 APM-capable Proxy package is not provided for that platform. This is a constraint of the APM Proxy environment; it does not mean that the Monitoring Topology widget itself does not support EL9 or Zabbix 7.0.

## Required Resource Attributes

| Attribute | Required | Purpose |
|---|---:|---|
| <code>holoztek.zabbix.proxyid</code> | Yes | Display metadata that associates the logical topology with the Zabbix Proxy that received the trace. |
| <code>service.name</code> | Yes | Names and identifies the OpenTelemetry Service node. |
| <code>host.name</code> | No | Names and identifies the OpenTelemetry System node. |

<code>service.name</code> and <code>host.name</code> can be added by an OpenTelemetry sender, an SDK Resource configuration, an OpenTelemetry Collector resource processor, or an equivalent mechanism. Choose the method that fits the OpenTelemetry deployment in use.

The same <code>service.name</code> under one Proxy is aggregated into one OpenTelemetry Service. An OpenTelemetry System is identified by the combination of Proxy, Service, and <code>host.name</code>, so an identical <code>host.name</code> under another Service creates a separate node.

<code>holoztek.zabbix.proxyid</code> is not authentication data, an authorization condition, or a security credential. In an environment where a sender can set arbitrary Resource Attributes, it may be possible to specify an existing Proxy ID. Treat this value only as display metadata for Proxy association. Behaviour when the sender itself sets this attribute has not been verified in a real environment.

## Widget Settings

1. Open Backend components in the Monitoring Topology settings.
2. Enable APM.
3. Set OTel observation window to a value from 5 to 1440 minutes.
4. Set the widget refresh interval to No refresh.

Disabling Telemetry in the Relations filter hides OpenTelemetry Service and OpenTelemetry System nodes together with their OpenTelemetry-derived relations. Disabling APM in the widget settings prevents Span retrieval itself.

## Observation Window and Retrieval Limits

The widget retrieves the newest Spans within the configured OTel observation window.

- Maximum per request: 500 Spans
- Continuation requests: up to 3
- OpenTelemetry Service nodes: up to 100
- OpenTelemetry System nodes: up to 100

When a limit is exceeded, the widget draws only the retrieved data and displays a warning. Shortening the observation window reduces the number of eligible Spans and may improve omissions. However, an environment that continuously produces many Spans can continue to reach the limit even with a shorter window, leaving some Services or Systems unavailable to the widget.

## User Permissions and Display Scope

Monitoring Topology builds the topology only from information visible to the current user through the Zabbix API and does not bypass Zabbix access controls. The displayed topology can therefore differ between users even on the same dashboard with identical widget settings.

On Zabbix 8.0, a non-Super admin user's user group must have access to a Zabbix Proxy before that user can view it. Without access, the Proxy and its OpenTelemetry Service and System nodes are not shown. Hosts monitored by that Proxy may be reconstructed from the remaining visible information and appear through a path equivalent to <code>Zabbix Server → Unknown Network → Host</code>. This is not a widget defect.

APM access controls such as <code>apm_filters</code> can also expose different traces to different users. Consequently, the number and contents of OpenTelemetry Service and System nodes can differ between users even with the same dashboard and widget settings.

## Troubleshooting Missing Nodes

Check the following in order.

1. Verify that Zabbix is version 8.0 or later and that an APM-capable Proxy environment is available for the operating system.
2. Verify that Monitoring Topology has at least one Zabbix Host as a drawing target.
3. Verify that the APM Collector is enabled on the relevant Zabbix Proxy.
4. Verify that the current user has access to the relevant Proxy.
5. Verify that the APM filter allows access to the relevant traces.
6. Verify that the Proxy adds <code>holoztek.zabbix.proxyid</code> for Traces.
7. Verify that the stored Span's <code>holoztek.zabbix.proxyid</code> matches the Proxy that actually received it.
8. Verify that the Span contains a non-empty <code>service.name</code>.
9. Verify that the Span is within the OTel observation window.
10. Verify that APM and Telemetry in the Relations filter are enabled in Monitoring Topology.
11. Check whether the widget displays a retrieval-limit warning.

If an OpenTelemetry Service appears but its OpenTelemetry System does not, check <code>host.name</code> first.

## Tested Environment and Untested Items

APM/OpenTelemetry display was verified with the Zabbix 8.0.0 final release, Rocky Linux 10, and PHP 8.4. ClickHouse 26.10 also worked in the test environment, but it is outside the ClickHouse version range officially supported by Zabbix. This result is not a statement of official support or a compatibility guarantee.

The following items have not been verified on real systems:

- A fresh Zabbix 8.0 installation
- The DEB package with Zabbix 8.0 on Ubuntu
- Proxy Groups on Zabbix 8.0
- Direct inspection of the package, process, and logs on the APM Proxy host
- Real telemetry missing <code>service.name</code> or <code>host.name</code>

Node-generation logic for missing attributes was validated with synthetic test data, not with real telemetry.

## Limitations

- Only trace data from APM monitoring is used; Metrics and Logs are ignored.
- The logical topology does not represent the actual Telemetry traffic direction.
- Parent-child Span relationships and service-to-service calls are not drawn.
- OpenTelemetry Service and OpenTelemetry System nodes are not merged automatically with Zabbix Host nodes.
- The APM Data Store and APM-enabled Proxy nodes come from Zabbix configuration data; OpenTelemetry Service and System nodes come from retrieved Spans.
- A Service or System with Spans only outside the observation window is not displayed.
- Display content is limited to the current user's visibility through the Zabbix API and APM filters.
