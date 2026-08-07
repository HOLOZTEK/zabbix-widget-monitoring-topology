<?php declare(strict_types = 0);

namespace Modules\MonitoringMap;

use Zabbix\Core\CWidget;

class Widget extends CWidget {

    public function getDefaultName(): string {
        return '監視経路マップ';
    }
}
