<?php declare(strict_types = 0);

namespace Modules\HoloztekMonitoringMap;

use Zabbix\Core\CWidget;

class Widget extends CWidget {

    public function init(): void {
        require_once __DIR__ . '/includes/helpers.php';
        bindtextdomain('holoztek-monitoringmap', __DIR__ . '/locale');
        bind_textdomain_codeset('holoztek-monitoringmap', 'UTF-8');
    }

    public function getDefaultName(): string {
        return _holoztek_mm('Monitoring Topology');
    }

    public function getTranslationStrings(): array {
        return [
            'class.widget.js' => [
                'Zabbix Server'         => _holoztek_mm('Zabbix Server'),
                'Proxy Group'           => _holoztek_mm('Proxy Group'),
                'Zabbix Proxy'          => _holoztek_mm('Zabbix Proxy'),
                'Network'               => _holoztek_mm('Network'),
                'Cluster'               => _holoztek_mm('Cluster'),
                'Datacenter'            => _holoztek_mm('Datacenter'),
                'Host'                  => _holoztek_mm('Host'),
                'Severity'              => _holoztek_mm('Severity'),
                'Status'                => _holoztek_mm('Status'),
                'Not responding'        => _holoztek_mm('Not responding'),
                'Communication method'  => _holoztek_mm('Communication method'),
                'Known addresses'       => _holoztek_mm('Known addresses'),
                'Filter'                            => _holoztek_mm('Filter'),
                'Reset'                             => _holoztek_mm('Reset'),
                'Problem status'                    => _holoztek_mm('Problem status'),
                'Unacknowledged'                    => _holoztek_mm('Unacknowledged'),
                'Acknowledged'                      => _holoztek_mm('Acknowledged'),
                'No problem'                        => _holoztek_mm('No problem'),
                'Include hosts in maintenance'      => _holoztek_mm('Include hosts in maintenance'),
                'Colorize by severity'             => _holoztek_mm('Colorize by severity'),
                'Host status'                      => _holoztek_mm('Host status'),
                'Disabled hosts'                    => _holoztek_mm('Disabled hosts'),
                'Interface'                         => _holoztek_mm('Interface'),
                'Available'                         => _holoztek_mm('Available'),
                'Mixed'                             => _holoztek_mm('Mixed'),
                'Not available'                     => _holoztek_mm('Not available'),
                'Unknown'                           => _holoztek_mm('Unknown'),
                'Normal hosts'                       => _holoztek_mm('Normal hosts'),
                'No interface configured'           => _holoztek_mm('No interface configured'),
                'Local host monitoring'             => _holoztek_mm('Local host monitoring'),
                'Monitoring route'                  => _holoztek_mm('Monitoring route'),
                'Monitoring method'                 => _holoztek_mm('Monitoring method'),
                'Ping'                              => _holoztek_mm('Ping'),
                'Zabbix Agent'                      => _holoztek_mm('Zabbix Agent'),
                'SNMP'                              => _holoztek_mm('SNMP'),
                'IPMI'                              => _holoztek_mm('IPMI'),
                'JMX'                               => _holoztek_mm('JMX'),
                'Other'                             => _holoztek_mm('Other'),
                'No hosts match the current filter.' => _holoztek_mm('No hosts match the current filter.'),
                'Zabbix DB' => _holoztek_mm('Zabbix DB'),
                'Proxy DB' => _holoztek_mm('Proxy DB'),
                'APM Data Store' => _holoztek_mm('APM Data Store'),
                'APM Collector' => _holoztek_mm('APM Collector'),
                'Enabled' => _holoztek_mm('Enabled'),
                'Type' => _holoztek_mm('Type'),
                'Source' => _holoztek_mm('Source'),
                'Database' => _holoztek_mm('Database'),
                'Server runtime' => _holoztek_mm('Server runtime'),
                'Frontend configuration' => _holoztek_mm('Frontend configuration'),
                'Global APM Data Source' => _holoztek_mm('Global APM Data Source'),
                'OpenTelemetry service' => _holoztek_mm('OpenTelemetry service'),
                'OpenTelemetry system' => _holoztek_mm('OpenTelemetry system'),
                'Service' => _holoztek_mm('Service'),
                'Systems' => _holoztek_mm('Systems'),
                'Namespace' => _holoztek_mm('Namespace'),
                'Environment' => _holoztek_mm('Environment'),
                'Host' => _holoztek_mm('Host'),
                'Observed telemetry systems' => _holoztek_mm('Observed telemetry systems'),
                'Too many APM systems to display.' => _holoztek_mm('Too many APM systems to display.'),
                'Database details are not available from the Zabbix API.' => _holoztek_mm('Database details are not available from the Zabbix API.'),
                'Relations' => _holoztek_mm('Relations'),
                'Monitoring' => _holoztek_mm('Monitoring'),
                'APM storage' => _holoztek_mm('APM storage'),
                'Telemetry' => _holoztek_mm('Telemetry'),
                'Service member' => _holoztek_mm('Service member'),
                'Search nodes' => _holoztek_mm('Search nodes'),
                'No matching nodes' => _holoztek_mm('No matching nodes'),
                'More results available...' => _holoztek_mm('More results available...'),
                'Fit topology to view' => _holoztek_mm('Fit topology to view'),
                'Legend' => _holoztek_mm('Legend'),
                'Node types' => _holoztek_mm('Node types'),
                'Virtualization / Cluster' => _holoztek_mm('Virtualization / Cluster'),
                'Info' => _holoztek_mm('Info'),
                'Topology' => _holoztek_mm('Topology'),
                'Nodes' => _holoztek_mm('Nodes'),
                'Database topology' => _holoztek_mm('Database topology'),
                'Disabled' => _holoztek_mm('Disabled'),
                'APM / OpenTelemetry' => _holoztek_mm('APM / OpenTelemetry'),
                'Observation window' => _holoztek_mm('Observation window'),
                'min' => _holoztek_mm('min'),
                'Spans fetched' => _holoztek_mm('Spans fetched'),
                'Queries' => _holoztek_mm('Queries'),
                'Services' => _holoztek_mm('Services'),
                'Retrieval status' => _holoztek_mm('Retrieval status'),
                'OK' => _holoztek_mm('OK'),
                'No data available' => _holoztek_mm('No data available'),
                'No spans fetched' => _holoztek_mm('No spans fetched'),
                'Display limit reached' => _holoztek_mm('Display limit reached'),
                'Query limit reached' => _holoztek_mm('Query limit reached'),
                'Retrieval failed' => _holoztek_mm('Retrieval failed'),
                'Requires Zabbix 8.0 or later' => _holoztek_mm('Requires Zabbix 8.0 or later'),
                'Last observed' => _holoztek_mm('Last observed'),
                'Components' => _holoztek_mm('Components'),
                'APM data store' => _holoztek_mm('APM data store'),
                'OpenTelemetry' => _holoztek_mm('OpenTelemetry'),
            ]
        ];
    }
}
