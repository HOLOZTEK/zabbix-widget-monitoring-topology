# Screenshot Guide

Use a sanitized, publicly shareable lab or demo Zabbix environment. Never capture production or customer environments.

## Required Images

| File | Purpose | Suggested size |
| --- | --- | --- |
| `screenshots/monitoring-topology-zabbix-server.png` | Zabbix Server / Network / Host topology | 1600 x 980 |
| `screenshots/monitoring-topology-zabbix-proxy.png` | Zabbix Server / Proxy / Network / Host topology | 1600 x 980 |
| `screenshots/monitoring-topology-proxy-group.png` | Zabbix Server / Proxy Group / Proxy / Network / Host topology | 1600 x 980 |
| `screenshots/monitoring-topology-vmware.png` | VMware Datacenter / Cluster / ESXi Host / VM hierarchy | 1600 x 980 |
| `screenshots/monitoring-topology-kubernetes.png` | Two distinct Kubernetes clusters | 1600 x 980 |
| `screenshots/monitoring-topology-backend-database.png` | Zabbix Server / Proxy database backend topology | 1500 x 1060 |
| `screenshots/monitoring-topology-apm-opentelemetry.png` | Logical APM / OpenTelemetry display hierarchy | 1480 x 1190 |
| `screenshots/monitoring-topology-filters.png` | Expanded display filter panel including Components and Relations | 1200 x 1000 |
| `screenshots/monitoring-topology-settings.png` | English tabbed settings form with Data acquisition selected | 1200 x 900 |
| `screenshots/monitoring-topology-settings-ja.png` | Japanese tabbed settings form with Data acquisition selected | 1200 x 900 |
| `screenshots/monitoring-topology-dashboard-example.png` | Tree Navigator driving Monitoring Topology | 1600 x 980 |

## Sanitizing Checklist

- Prefer fictional labels such as `Zabbix Server`, `Proxy A`, `10.0.10.0/24`, `web-01`, `ESXi Demo`, and `K8s Demo A`.
- Private IP addresses and hostnames from a lab or demo environment are allowed only when that environment and every visible identifier are explicitly approved for public disclosure.
- Remove browser address bars, usernames, internal URLs, alerts, customer names, production metrics, and every identifier from production or customer environments.
- Do not show credentials, macros containing secrets, sensitive inventory values, or organization-specific names that are not approved for publication.
- Demonstrate multiple Kubernetes clusters with fictional or explicitly publication-approved names.
- Keep crops and scale consistent, and verify readability at README display width.
- Capture both English and Japanese settings forms.
- Keep all four settings-tab labels visible and select the Data acquisition tab for the README image.

## README Integration

The README files use the dashboard example as the main preview, place topology reference images in the model table, place the backend and APM images in their respective sections, place the filter image below its explanation table, and use the locale-specific settings image. Recheck all images against the sanitizing checklist whenever they are replaced.
