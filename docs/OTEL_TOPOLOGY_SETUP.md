# APM Monitoring / OpenTelemetry Topology Guide

[日本語](OTEL_TOPOLOGY_SETUP.ja.md)

This guide describes the conditions and operational checks required for Monitoring Topology to draw collection paths from OpenTelemetry traces already collected by Zabbix 8.0 APM monitoring.

It assumes that Zabbix APM monitoring and the sending path, such as an OpenTelemetry Collector, are already configured and that traces are visible in Zabbix. It does not cover how to configure APM monitoring itself.

## Terminology

| Term | Meaning in this guide |
|---|---|
| APM monitoring | The Zabbix 8.0 feature that receives, stores, and displays OpenTelemetry traces. |
| OpenTelemetry trace | A Trace and its Spans stored by APM monitoring. Monitoring Topology uses Span Resource Attributes to determine the topology. |
| OTel Service | A service node created from the <code>service.name</code> Resource Attribute. |
| OTel System | An execution-environment node created from the <code>host.name</code> Resource Attribute. |
| Telemetry | The label shown in the widget's Relations filter. It means relations generated from OpenTelemetry traces. |

## Meaning of Backend Nodes

Enabling Backend components adds these logical relations to Monitoring Topology:

- Database: <code>Zabbix Server → Zabbix DB</code> and <code>Zabbix Proxy → Proxy DB</code>
- APM monitoring: <code>Zabbix Server → APM Data Store → APM-enabled Zabbix Proxy</code>

The APM Data Store is labeled ClickHouse when the global APM data source can be read; otherwise, a generic label is used. The line between the APM Data Store and a Proxy represents an APM-enabled Proxy and the global APM data source. It does not guarantee the actual write destination because a Proxy may use an individually configured data source.

## Topology Model

The APM monitoring collection path is displayed with this model:

<code>Zabbix Server → APM Data Store → APM-enabled Zabbix Proxy → OTel Service → OTel System</code>

This model is a logical collection path inferred from the Zabbix Proxy that received each trace and from Span Resource Attributes. It does not represent application call relationships or physical network routes.

OTel Service and OTel System are separate from Zabbix Host nodes. Nodes with identical names are not merged automatically.

## Drawing Prerequisites

All of the following conditions must be met.

| Condition | Requirement |
|---|---|
| Zabbix version | Zabbix Server and the relevant Zabbix Proxy must be version 8.0 or later. |
| APM monitoring | OpenTelemetry traces must be received, and the relevant Spans must be visible in the Zabbix APM view. |
| Proxy APM Collector | The APM Collector must be enabled on the relevant Zabbix Proxy. |
| Proxy identity configuration | The trace additional Resource Attributes on the relevant Zabbix Proxy must contain <code>holoztek.zabbix.proxyid</code> with that Proxy's own <code>proxyid</code> as its value. |
| Proxy identity attribute | The Span Resource Attributes must contain <code>holoztek.zabbix.proxyid</code>, and its value must match the <code>proxyid</code> of the Zabbix Proxy that received the trace. |
| Service name | The Span Resource Attributes must contain a non-empty <code>service.name</code>. |
| Target selection | The widget must have a fixed host group or a host/host group received from another widget. |
| Widget setting | APM must be enabled under Backend components. |
| Observation window | A matching Span must be stored within the configured OTel observation window. |

<code>host.name</code> is optional. An OTel System node is created only when this attribute has a value.

Monitoring Topology reads trace Spans. Sending only Metrics or Logs does not create topology nodes.

## Required Resource Attributes

| Attribute | Required | Purpose |
|---|---:|---|
| <code>holoztek.zabbix.proxyid</code> | Yes | Associates the collection path with the Zabbix Proxy that received the Span. The value must match the Proxy ID in the Zabbix API. |
| <code>service.name</code> | Yes | Names and identifies the OTel Service node. |
| <code>host.name</code> | No | Names and identifies the OTel System node. |

These attributes can be added by an OpenTelemetry Collector resource processor, an SDK Resource configuration, or an equivalent mechanism. Choose the method that fits the OpenTelemetry deployment in use.

The same <code>service.name</code> under one Proxy is aggregated into one OTel Service. An OTel System is identified by the combination of Proxy, Service, and <code>host.name</code>, so an identical <code>host.name</code> under another Service creates a separate node. Use distinguishable values when environments or roles must appear as separate nodes.

## Widget Settings

1. Open Backend components in the Monitoring Topology settings.
2. Enable APM.
3. Set OTel observation window to a value from 5 to 1440 minutes.
4. Set the widget refresh interval to No refresh.

Disabling Telemetry in the Relations filter hides OTel Service and OTel System nodes together with the OpenTelemetry-derived relations connected to them.

## Observation Window and Retrieval Limits

The widget retrieves the newest Spans within the configured observation window.

- Maximum per request: 500 Spans
- Continuation requests: up to 3
- OTel Service nodes: up to 100
- OTel System nodes: up to 100

When a limit is exceeded, the widget draws only the retrieved data and displays a warning. In environments that produce many Spans in a short time, shorten the observation window or reconsider the granularity of Resource Attribute values.

## Troubleshooting Missing Nodes

Check the following in order.

1. Verify that the relevant Span is visible in the Zabbix APM view within the observation window.
2. Verify that the APM Collector is enabled on the relevant Proxy.
3. Verify that the Proxy's trace additional Resource Attributes add <code>holoztek.zabbix.proxyid</code> with its own <code>proxyid</code>.
4. Verify that the Span has <code>service.name</code>.
5. Verify that the Span has <code>holoztek.zabbix.proxyid</code> and that it matches the receiving Proxy's <code>proxyid</code>.
6. Verify that APM is enabled in Monitoring Topology.
7. Verify that Telemetry is enabled in the Relations filter.
8. Verify that a fixed or received target is selected.
9. Check whether the widget displays a retrieval-limit warning.

If an OTel Service appears but its OTel System does not, verify that the Span has <code>host.name</code>.

## Limitations

- Only trace data from APM monitoring is used; Metrics and Logs are ignored.
- Parent-child Span relationships and service-to-service calls are not drawn.
- OTel Service and OTel System nodes are not merged automatically with Zabbix Host nodes.
- The APM Data Store and APM-enabled Proxy nodes come from Zabbix configuration data; OTel Service and OTel System nodes come from retrieved Spans.
- A Service or System with Spans only outside the observation window is not displayed.
