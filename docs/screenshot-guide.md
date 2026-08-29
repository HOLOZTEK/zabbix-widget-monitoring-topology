# Screenshot Guide

Use a sanitized demo Zabbix environment. Never capture production dashboards or real infrastructure data.

## Required Images

| File | Purpose | Suggested size |
| --- | --- | --- |
| `screenshots/monitoring-topology-overview.png` | Main Server / Proxy / Network / Host topology | 1600 x 980 |
| `screenshots/monitoring-topology-virtualization.png` | VMware Datacenter / Cluster / ESXi / VM hierarchy | 1600 x 980 |
| `screenshots/monitoring-topology-kubernetes.png` | Two distinct Kubernetes clusters | 1600 x 980 |
| `screenshots/monitoring-topology-filters.png` | Expanded display filter panel | 1200 x 800 |
| `screenshots/monitoring-topology-settings.png` | English settings form | 900 x 720 |
| `screenshots/monitoring-topology-settings-ja.png` | Japanese settings form | 900 x 720 |
| `screenshots/monitoring-topology-dashboard-example.png` | Tree Navigator driving Monitoring Topology | 1600 x 980 |

## Sanitizing Checklist

- Use demo labels such as `Zabbix Server`, `Proxy A`, `10.0.10.0/24`, `web-01`, `ESXi Demo`, and `K8s Demo A`.
- Remove browser address bars, usernames, internal URLs, public or private IPs from real environments, alerts, customer names, and production metrics.
- Do not show credentials, macros containing secrets, inventory values, or organization-specific names.
- Demonstrate multiple Kubernetes clusters with clearly fictional names.
- Keep crops and scale consistent, and verify readability at README display width.
- Capture both English and Japanese settings forms.

## README Integration

The README files use the dashboard example as the main preview, place topology reference images in the model table, place the filter image below its explanation table, and use the locale-specific settings image. Recheck all images against the sanitizing checklist whenever they are replaced.
