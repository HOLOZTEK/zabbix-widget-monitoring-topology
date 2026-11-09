# OpenTelemetry Topology Setup Guide

English | [日本語](OTEL_TOPOLOGY_SETUP.ja.md)

This guide explains how to set up the Monitoring Topology widget to show OpenTelemetry (OTel) telemetry, and how to read what it shows. For an overview, see the [README](../README.md).

Applies to: Monitoring Topology v1.2.3 or later, Zabbix 8.0 or later.

## Contents

1. [What this topology shows](#1-what-this-topology-shows)
2. [OpenTelemetry topology model](#2-opentelemetry-topology-model)
3. [Requirements](#3-requirements)
4. [Required resource attributes](#4-required-resource-attributes)
5. [Zabbix Proxy configuration](#5-zabbix-proxy-configuration)
6. [AI Agent / OTel sender configuration](#6-ai-agent--otel-sender-configuration)
7. [Sender behaviour observed in a lab](#7-sender-behaviour-observed-in-a-lab)
8. [Widget settings](#8-widget-settings)
9. [OTel observation window](#9-otel-observation-window)
10. [Fetch limits and missed telemetry](#10-fetch-limits-and-missed-telemetry)
11. [Examples](#11-examples)
12. [Using the view](#12-using-the-view)
13. [Troubleshooting](#13-troubleshooting)
14. [Known limitations](#14-known-limitations)

## 1. What this topology shows

Monitoring Topology is not a network topology. It shows **monitoring and telemetry collection paths as seen from Zabbix**.

Because of this, the same machine can appear as two nodes at the same time. This is expected.

```text
Zabbix Host: claude-node01           (a Host monitored by Zabbix)
OpenTelemetry System: claude-node01  (a System that sent telemetry through a Proxy)
```

The widget never merges the two or links them, even when their names match.

## 2. OpenTelemetry topology model

OpenTelemetry telemetry is shown in this fixed hierarchy:

```text
Zabbix Server
    |
APM Data Store (ClickHouse)
    |
Zabbix Proxy
    |
OpenTelemetry Service (service.name)
    |
OpenTelemetry System (host.name)
```

The APM data store is labelled "ClickHouse" when a Super admin views the widget and a global APM data source is configured. Otherwise it is labelled "APM Data Store".

Example:

```text
Zabbix Proxy
 ├─ codex-app-server
 │    ├─ codex-node01
 │    ├─ codex-node02
 │    └─ codex-node03
 │
 └─ claude-code
      ├─ claude-node01
      └─ claude-node02
```

This guide sometimes abbreviates OpenTelemetry Service as "OTel Service" and OpenTelemetry System as "OTel System".

## 3. Requirements

All of the following are needed to show OTel nodes.

| Item | Requirement |
|---|---|
| Zabbix | 8.0 or later (APM settings are ignored on 7.0) |
| APM storage | Zabbix APM is set up and spans (traces) are being stored |
| Zabbix Proxy | APM "Data collection enabled" is on and the `holoztek.zabbix.proxyid` attribute is set ([section 5](#5-zabbix-proxy-configuration)) |
| Sender | Sends traces to the Proxy with `service.name` (required) and `host.name` (recommended) ([section 6](#6-ai-agent--otel-sender-configuration)) |
| Widget | APM is on under "Backend components", a target (host group or broadcast source) is set, and at least one host is shown ([section 8](#8-widget-settings)) |

Notes:

- **Only traces (spans)** are used. A sender that sends only metrics or logs is not shown.
- OTel nodes are shown under every qualifying Proxy, whether or not the target hosts are monitored through it.

## 4. Required resource attributes

| Attribute | Set on | Purpose |
|---|---|---|
| `holoztek.zabbix.proxyid` | Zabbix Proxy (APM resource attributes) | Identifies the Proxy that received the telemetry |
| `service.name` | OTel sender | Builds the OpenTelemetry Service level |
| `host.name` | OTel sender | Builds the OpenTelemetry System nodes |

Value handling:

- Values are case-sensitive (`Codex-node01` and `codex-node01` are different nodes).
- Leading and trailing spaces are removed. A value of only spaces counts as unset.
- Only the first 128 characters are used for display.
- `service.namespace` and `deployment.environment` are supplementary. They are shown in the tooltip and matched by search, but never used to tell nodes apart.
- No other resource attributes are sent to the browser.

## 5. Zabbix Proxy configuration

### 5.1 Finding the Proxy ID

Set `holoztek.zabbix.proxyid` to the Proxy's **own** `proxyid`. You can find the `proxyid` in either of these ways.

**Web UI**

1. Open **Administration → Proxies**.
2. Check the `proxyid` value in the URL of the Proxy name link (`zabbix.php?action=popup&popup=proxy.edit&proxyid=<number>`).

**Zabbix API**

```json
{
  "jsonrpc": "2.0",
  "method": "proxy.get",
  "params": {
    "output": ["proxyid", "name"],
    "filter": {"name": ["proxy01"]}
  },
  "id": 1
}
```

Use the `proxyid` in the result. You do not need to query the database directly.

### 5.2 APM settings

In **Administration → Proxies**, open the Proxy and set the following on the **APM** tab.

| Field | Value |
|---|---|
| Data collection enabled | On |
| Resource attributes (Process) | Key: `holoztek.zabbix.proxyid`, Value: that Proxy's `proxyid`, Category: `Traces` |

Example (for `proxyid` 1; use your own Proxy's value):

```text
holoztek.zabbix.proxyid=1   (Category: Traces)
```

To receive OpenTelemetry data, the Proxy configuration file must also be set up, separately from this form (the form's help says so too). Follow the official Zabbix 8.0 documentation for the configuration file.

With several Proxies, set each Proxy's own `proxyid` on that Proxy.

Telemetry is not shown for a Proxy in any of these cases:

- The attribute is missing.
- Its Category is not `Traces`.
- Its value does not match the Proxy's own `proxyid`.

The APM-enabled Proxy node itself is still shown.

### 5.3 Why the Proxy attribute is required

Monitoring Topology never infers the receiving Proxy from `host.name`, `service.name`, an IP address or anything else. It links telemetry to a Proxy only when:

```text
the span's holoztek.zabbix.proxyid == the proxyid of the Zabbix Proxy that set the attribute
```

Inferring a link can draw a wrong path, for example because of matching names or NAT.

### 5.4 Security note

`holoztek.zabbix.proxyid` is not a credential. If a sender sets an existing `proxyid` itself, the topology cannot tell the difference. Set this attribute only on the Proxy, never on the sender.

## 6. AI Agent / OTel sender configuration

AI agents and other senders do not necessarily set the resource attributes the widget needs. Check and set them for each sender.

### 6.1 General rule

For each sender, set at least these two explicitly:

```text
service.name = codex-app-server
host.name    = codex-node01
```

### 6.2 service.name

`service.name` is a fixed logical name that forms the OpenTelemetry Service level.

```text
service.name = codex-app-server
service.name = claude-code
service.name = gemini-cli
```

Several Systems can send telemetry for the same Service.

### 6.3 host.name

`host.name` identifies the System that sends the telemetry. Use the OS hostname, or an agent node name that is unique within your organization.

```text
host.name = codex-node01
host.name = claude-node01
host.name = gemini-node01
```

### 6.4 Roles of service.name and host.name

```text
service.name → "which Service"
host.name    → "which System it came from"
```

```text
service.name = codex-app-server
host.name    = codex-node01 / codex-node02 / codex-node03

codex-app-server
 ├─ codex-node01
 ├─ codex-node02
 └─ codex-node03
```

### 6.5 Missing attributes

| service.name | host.name | Shown as |
|---|---|---|
| Present | Present | Proxy → Service → System |
| Present | Absent | Proxy → Service (no System node is created) |
| Absent | Present | Not shown (`host.name` is never linked directly to the Proxy) |
| Absent | Absent | Not shown |

### 6.6 Environment variables

Senders that use an OpenTelemetry SDK may accept the standard OpenTelemetry environment variables for resource attributes:

```bash
export OTEL_SERVICE_NAME="codex-app-server"
export OTEL_RESOURCE_ATTRIBUTES="host.name=codex-node01"
```

Which methods are supported depends on the sender. Some senders ignore these variables and some have their own settings. **Check your sender's documentation for the methods it supports.** After setting them, use **APM → Traces** in Zabbix to confirm that the spans' resource attributes include `service.name` and `host.name`.

## 7. Sender behaviour observed in a lab

This section describes cases observed in a lab environment (Zabbix 8.0.0rc3, November 2026). The widget does not depend on any particular product; it works with OpenTelemetry senders in general. The behaviour below can change with the sender's version, configuration and telemetry implementation.

### 7.1 Codex (codex-app-server)

Example settings:

```text
service.name = codex-app-server
host.name    = codex-node01
```

Codex app-server can keep sending spans for internal work, such as `auth`, `fs.read_file`, `fs.get_metadata` and `list_models`, even when nobody is using it. In the lab, the longest gap between spans of each of the three Systems was about 4.5 minutes over an hour.

As a result, **Codex can stay visible for as long as the OTel observation window (15 minutes by default) even when nobody is using it.** This is not a fault.

### 7.2 Claude Code

In the lab, Claude Code spans were mainly ones that come with use, such as `claude_code.interaction`, `claude_code.llm_request` and `claude_code.tool`. While it was idle, there were no continuous spans like Codex's, and one System had a gap of about 51 minutes within an hour.

In that case the System disappears like this:

```text
last telemetry
   ↓
OTel observation window passes
   ↓
removed from the topology
```

Claude Code does not always behave this way. It can vary with version, configuration and telemetry implementation.

### 7.3 What the widget actually checks

The widget does not check whether someone used the agent recently. It only checks **whether there is telemetry (a span) within the configured observation window**. Whether a node is shown does not directly indicate a login state, whether the process is running, or when a user last acted.

## 8. Widget settings

| Setting | Meaning |
|---|---|
| Host groups / Hosts | The display target. While no host is shown, OTel nodes are not shown either |
| Backend components → APM | When on, fetches and shows the APM data store, APM-enabled Proxies and OTel nodes (Zabbix 8.0+) |
| OTel observation window (minutes) | The period to show. Default 15, range 5-1440 ([section 9](#9-otel-observation-window)) |
| Default component visibility → OpenTelemetry (Display tab) | Where the Components filter starts when the dashboard is opened (on by default). With it off, spans are still fetched while APM is on |

Backend components and the OTel observation window are on the Data acquisition tab of the settings form. Data acquisition decides whether data is fetched; the Components and Relations filters only show or hide data that was already fetched.

## 9. OTel observation window

Setting: "OTel observation window (minutes)" (Japanese UI: 「OTel観測期間（分）」)

| Item | Value |
|---|---|
| Default | 15 |
| Range | 5-1440 |
| Empty | Saved as 15 |

### 9.1 Meaning

```text
now − OTel observation window
        ↓
a span within this period
        ↓
shown in the topology
```

The window is independent of the widget's refresh interval and is not used while APM is off. When the window changes, nodes already shown keep their positions; nodes now inside the window are added and nodes outside it are removed.

### 9.2 Guidelines

No single value suits every environment. Choose one based on how often your senders send telemetry.

| Window | Suited to |
|---|---|
| 5-15 minutes | Senders that send telemetry frequently |
| 30-60 minutes | Senders that send telemetry only periodically |
| Several hours (up to 1440 minutes) | Infrequent processing or batch-style telemetry |

### 9.3 Long windows

A longer window means:

- Old Systems stay visible longer.
- More spans fall within the window.
- Telemetry is more likely to be missed because of the fetch limits ([section 10](#10-fetch-limits-and-missed-telemetry)).

## 10. Fetch limits and missed telemetry

### 10.1 Current limits

| Item | Limit |
|---|---|
| Span fetch | 500 rows × up to 3 queries |
| OpenTelemetry Services | Up to 100 |
| OpenTelemetry Systems | Up to 100 |

Spans are fetched newest first, in up to three queries. Every query has the same base conditions: within the observation window, `holoztek.zabbix.proxyid` belongs to a target Proxy, and `service.name` is present and not empty.

1. The base conditions only (nothing already seen is excluded). If this returns fewer than 500 rows, fetching stops here
2. Services not seen in the first query
3. `host.name` values not seen so far (only spans that have `host.name`)

Spans without `service.name` are excluded by the base conditions, so they never use up the limit.

### 10.2 How telemetry gets missed

With a long window or many senders, a Service that sends many spans can fill the fetch limit. Fetching may then never reach less frequent Services or Systems, and they can be missing from the topology even though they sent telemetry within the window.

For example, the first 500 rows may all be spans of busy Services. Another combination of a Service and a `host.name` already seen (such as Service A × System Y) can then remain unread.

### 10.3 Warning

In the following cases, the APM data store tooltip shows the warning below:

- Some telemetry may have been missed because of the fetch limits.
- There are more than 100 Services or Systems.

> Too many APM systems to display.
> (Japanese UI: 「APM システムが多すぎるため、一部を表示していません。」)

The widget omits the warning only when it could confirm every combination within the limits.

The Info panel's Retrieval status tells the two apart: Display limit reached when there are more than 100, Query limit reached when a missed combination cannot be ruled out. It also shows the spans fetched and the queries run (such as 3 / 3).

### 10.4 What to do about the warning

1. **First, shorten the OTel observation window.** Fewer spans fall within it, so they are more likely to fit within the limits.
2. If the warning persists, the environment sends enough spans to fill the first query (500 rows) even within a short window, and the warning shows nearly all the time. If a Service or System you expect is missing, filter **APM → Traces** in Zabbix by its `service.name` or `host.name` to check whether it has spans within the window.

## 11. Examples

### 11.1 Basic

```text
service.name            = codex-app-server
host.name               = codex-node01
holoztek.zabbix.proxyid = 1   (set by the Proxy; 1 is an example value)
```

```text
proxy01 (proxyid 1)
   |
codex-app-server
   |
 codex-node01
```

### 11.2 Several Systems in one Service

```text
Proxy
  |
codex-app-server
 ├─ codex-node01
 ├─ codex-node02
 └─ codex-node03
```

### 11.3 Several Services

```text
Proxy
 ├─ codex-app-server
 │   ├─ codex-node01
 │   └─ codex-node02
 │
 └─ claude-code
     ├─ claude-node01
     └─ claude-node02
```

### 11.4 Same host.name under different Services

The same `host.name` under a different Service is shown as a separate path. This is expected.

```text
service-a          service-b
   |                  |
 host01             host01
```

### 11.5 Same host.name through different Proxies

A System observed through several Proxies is also shown as separate paths. Monitoring Topology gives the monitoring path priority over whether the underlying machine is the same.

### 11.6 A Zabbix Host and an OpenTelemetry System together

As explained in [section 1](#1-what-this-topology-shows), `Zabbix Host: claude-node01` and `OpenTelemetry System: claude-node01` shown together is expected.

## 12. Using the view

| Control | Effect |
|---|---|
| APM (widget setting) | Controls data fetching and building the topology itself. When off, no spans are fetched |
| Components filter → OpenTelemetry | Controls **only the display** of the topology already fetched. When off, hides OpenTelemetry Services and Systems and their lines |
| Relations filter → Telemetry | Controls **only the display of lines** already fetched. When off, hides the Proxy—Service and Service—System lines; the nodes stay |
| OTel observation window | The period to show ([section 9](#9-otel-observation-window)) |
| Search | Finds shown nodes by substring. OpenTelemetry Services match by `service.name` and Systems by `host.name`. Both also match their namespace and environment, and a System also matches its Service name. Nodes hidden by the filters are not offered |
| Info | Shows the nodes and relations fetched, the APM / OpenTelemetry retrieval (observation window, spans fetched, queries / maximum, Services and Systems, retrieval status) and the legend, where telemetry is dash-dot and service membership dash-dot-dot. The node and relation counts and the retrieval show here even while the filters hide them |
| Fit | Fits every node the filters leave visible into the view |

Tooltips show:

| Node | Shows |
|---|---|
| OpenTelemetry Service | Type, Service name, number of Systems, Last observed |
| OpenTelemetry System | Type, Host (`host.name`), Service name, Last observed |
| APM-enabled Proxy | Number of observed telemetry systems |

**Last observed** is the latest span time among the spans this widget fetched: a System's own spans, and for a Service, all its Systems plus its spans without `host.name`. It is not when a user last used the agent, nor process uptime; an agent that sends background traces updates it without anyone using it ([13.4](#134-an-agent-nobody-is-using-stays-visible)). If the fetch hit its limits, it is still the latest time within what was fetched ([section 10](#10-fetch-limits-and-missed-telemetry)). It is shown in the user's Zabbix time zone and language, and adds no queries.

## 13. Troubleshooting

### 13.1 A Service is not shown

Check, in this order:

1. Is it Zabbix 8.0 or later?
2. Is APM on under the widget's "Backend components"?
3. Is a display target set, with at least one host shown?
4. Is Zabbix APM set up and storing spans? (Check **APM → Traces**.)
5. Is "Data collection enabled" on for the Proxy?
6. Does the Proxy have `holoztek.zabbix.proxyid` with Category `Traces`, set to its own `proxyid`?
7. Do the spans have `service.name`?
8. Are there spans within the OTel observation window?
9. Is OpenTelemetry turned off in the Components filter?
10. Is the sender sending traces? (Metrics and logs are not used.)

### 13.2 A Service is shown but no System

First check that `host.name` is among the spans' resource attributes. `service.name` alone does not create a System node.

### 13.3 A System suddenly disappeared

The most common cause is that the OTel observation window has passed. In **APM → Traces**, check the time of the last span for that `service.name` and `host.name`. If the sender sends infrequently, lengthen the window ([9.2](#92-guidelines)).

### 13.4 An agent nobody is using stays visible

This is not necessarily a fault. If Last observed in the tooltip keeps advancing, check whether the agent itself keeps sending background traces, such as periodic work, authentication checks or other internal operations. This behaviour has actually been observed with Codex app-server ([7.1](#71-codex-codex-app-server)).

### 13.5 The same host appears twice

`Zabbix Host: claude-node01` and `OpenTelemetry System: claude-node01` shown together is expected ([section 1](#1-what-this-topology-shows)).

### 13.6 Shown under an unexpected Proxy

Check the value of `holoztek.zabbix.proxyid`. The widget never infers the Proxy from `host.name` or an IP address, so if this value is wrong the telemetry will not connect to the right path. Also check that the sender does not set this attribute itself ([5.4](#54-security-note)).

### 13.7 "Too many APM systems to display." is shown

See [10.4](#104-what-to-do-about-the-warning).

## 14. Known limitations

- `holoztek.zabbix.proxyid` is not a credential. A sender that sets the same attribute cannot be told apart.
- A node being shown only means a span was observed within the window. It does not mean telemetry is arriving now or that the agent is running.
- The widget does not show when the last span arrived. Check **APM → Traces**.
- In environments with many spans, the warning about missed telemetry can show nearly all the time because of the fetch limits ([section 10](#10-fetch-limits-and-missed-telemetry)).
- A longer OTel observation window includes more spans, so telemetry is more likely to be missed.
- Senders differ widely in how often they send telemetry. With the same observation window, some senders stay visible while others soon disappear ([section 7](#7-sender-behaviour-observed-in-a-lab)).
- OTel nodes need at least one target host to be shown, but they do not follow which hosts are selected. Telemetry under every qualifying Proxy is shown.
- For users other than Super admins, the APM data store is shown as a generic "APM Data Store" without naming its type.
