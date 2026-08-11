<?php declare(strict_types = 0); ?>
window.holoztek_monitoringmap_form = new class {

	init() {
		this._form = document.getElementById('widget-dialogue-form');

		for (const colorpicker of this._form.querySelectorAll('.<?= ZBX_STYLE_COLOR_PICKER ?> input')) {
			$(colorpicker).colorpicker({
				appendTo: '.overlay-dialogue-body',
				use_default: true
			});
		}
	}
};
