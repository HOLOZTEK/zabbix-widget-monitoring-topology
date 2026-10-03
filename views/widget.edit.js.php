<?php declare(strict_types = 0); ?>
window.holoztek_monitoringmap_form = new class {

	init() {
		// フォームIDは Zabbix 7.0 では 'widget-dialogue-form'、8.0以降では 'widget-form'。
		this._form = document.getElementById('widget-dialogue-form') ?? document.getElementById('widget-form');

		// Zabbix 7.0: CColor（.color-picker 内の input）は jQuery colorpicker による初期化が必要。
		// Zabbix 8.0以降: <z-color-picker> が自己初期化し、jQuery colorpicker は存在しない。
		// PHP定数 ZBX_STYLE_COLOR_PICKER は8.0で廃止されたため使わない（クラス名 'color-picker' は両バージョン共通）。
		if (typeof jQuery.fn.colorpicker === 'function') {
			for (const colorpicker of this._form.querySelectorAll('.color-picker input')) {
				$(colorpicker).colorpicker({
					appendTo: '.overlay-dialogue-body',
					use_default: true
				});
			}
		}
	}
};
