<?php declare(strict_types = 0); ?>
window.holoztek_monitoringmap_form = new class {

	init({form_tabs_id, relation_backends, available_backends}) {
		// フォームIDは Zabbix 7.0 では 'widget-dialogue-form'、8.0以降では 'widget-form'。
		this._form = document.getElementById('widget-dialogue-form') ?? document.getElementById('widget-form');

		// タブ切替時に開いたままの Color Picker（7.0の jQuery colorpicker）を閉じる（Zabbix標準の円グラフと同じ）。
		jQuery(document.getElementById(form_tabs_id)).on('tabsactivate', () => {
			if (typeof jQuery.colorpicker === 'function') {
				jQuery.colorpicker('hide');
			}
		});

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

		this._initRelationDefaults(relation_backends, available_backends);
	}

	/**
	 * 取得しない関係（バックエンド構成でOFF、7.0のAPM）の「関係の初期表示」は選べないよう無効にする。
	 * 無効なチェックボックスは送信されず、直前の隠し入力（'0'）が保存されてしまうため、無効の間は
	 * 隠し入力に現在の値を写して保存値を保つ（取得をONに戻すと元の選択が復活する）。
	 */
	_initRelationDefaults(relation_backends, available_backends) {
		const backend = value => this._form.querySelector(
			`input[type="checkbox"][name="backend_components[]"][value="${value}"]`
		);

		const sync = () => {
			for (const [name, value] of Object.entries(relation_backends)) {
				const checkbox = this._form.querySelector(`input[type="checkbox"][name="${name}"]`);
				const hidden = this._form.querySelector(`input[type="hidden"][name="${name}"]`);
				const source = backend(value);

				if (checkbox === null || hidden === null) {
					continue;
				}

				const fetched = source !== null && source.checked && available_backends.includes(value);

				checkbox.disabled = !fetched;
				hidden.value = fetched ? '0' : (checkbox.checked ? '1' : '0');
			}
		};

		for (const value of new Set(Object.values(relation_backends))) {
			const source = backend(value);

			if (source !== null) {
				source.addEventListener('change', sync);
			}
		}

		sync();
	}
};
