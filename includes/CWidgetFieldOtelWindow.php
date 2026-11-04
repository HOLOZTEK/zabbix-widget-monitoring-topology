<?php declare(strict_types = 0);

namespace Modules\HoloztekMonitoringMap\Includes;

use Zabbix\Widgets\Fields\CWidgetFieldIntegerBox;

// Integer box for the OTel observation window (minutes). The stock integer box
// casts an empty input to 0, which fails its range; here an empty input means
// the default instead. Anything else but digits that reaches the server (the
// dashboard form already truncates "7.5" to 7) stays out of range and is rejected.
class CWidgetFieldOtelWindow extends CWidgetFieldIntegerBox {

	public function setValue($value): self {
		if (is_string($value)) {
			$value = trim($value);

			if ($value === '') {
				$value = $this->getDefault();
			}
			elseif (!ctype_digit($value)) {
				$value = -1;
			}
		}

		return parent::setValue($value);
	}
}
