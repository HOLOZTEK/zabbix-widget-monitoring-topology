<?php declare(strict_types = 0);

/**
 * Monitoring Map widget configuration form.
 *
 * @var CView  $this
 * @var array  $data
 */

use Modules\HoloztekMonitoringMap\Includes\WidgetForm;

// 'hostid' uses preventDefault() in WidgetForm.php, so it renders only the
// "receive from widget" connector control (Tree Navigator etc.). 'hostgroupid'
// accepts several fixed host groups as well as a widget reference.

$form = new CWidgetFormView($data);

// Monitoring: what the Topology is built from. Data acquisition: what is
// fetched. Filter: where the dashboard filter starts. Appearance: how it is drawn.
$tabs = [
	'monitoring' => [
		// 'Monitoring targets' in the source: 'Monitoring' is the relation, translated as such.
		'label'  => _holoztek_mm('Monitoring targets'),
		'fields' => [
			new CWidgetFieldMultiSelectHostView($data['fields']['hostid']),
			new CWidgetFieldMultiSelectGroupView($data['fields']['hostgroupid']),
			new CWidgetFieldIntegerBoxView($data['fields']['subnet_prefix_length']),
			new CWidgetFieldTextBoxView($data['fields']['server_label'])
		]
	],
	'acquisition' => [
		'label'  => _holoztek_mm('Data acquisition'),
		'fields' => [
			(new CWidgetFieldCheckBoxListView($data['fields']['backend_components']))
				->setFieldHint(makeHelpIcon([
					_holoztek_mm('Decides what is fetched. Database adds the Zabbix and Proxy databases; APM queries APM trace data.'), BR(),
					_holoztek_mm('The filter on the dashboard only shows or hides what was fetched.')
				])),
			(new CWidgetFieldIntegerBoxView($data['fields']['otel_observation_window']))
				->setFieldHint(makeHelpIcon([
					_holoztek_mm('Displays OpenTelemetry services and systems observed within this period.'), BR(),
					_holoztek_mm('A longer period keeps low-frequency telemetry sources visible.')
				]))
		]
	],
	// Filled in below from WidgetForm::FILTER_SECTIONS.
	'filter' => [
		'label'  => _holoztek_mm('Filter'),
		'fields' => []
	],
	'appearance' => [
		'label'  => _holoztek_mm('Appearance'),
		'fields' => [
			new CWidgetFieldIntegerBoxView($data['fields']['node_font_size']),
			new CWidgetFieldSelectView($data['fields']['node_font_style']),
			new CWidgetFieldColorView($data['fields']['node_font_color']),
			new CWidgetFieldColorView($data['fields']['edge_color']),
			new CWidgetFieldIntegerBoxView($data['fields']['edge_width']),
			new CWidgetFieldIntegerBoxView($data['fields']['drag_follow_hops']),
			(new CWidgetFieldIntegerBoxView($data['fields']['layout_iterations']))
				->setFieldHint(makeHelpIcon([
					_holoztek_mm('0: the topology is shown once its layout is done.'), BR(),
					_holoztek_mm('1 or more: the topology is shown after this many layout iterations and spreads out on screen until it settles. The smaller the value, the more it moves.'), BR(),
					_holoztek_mm('Applies when the topology is laid out anew: on first display, when the selection changes, or when the topology changes substantially.')
				])),
			new CWidgetFieldRadioButtonListView($data['fields']['filter_position'])
		]
	]
];

// Section hints, on the label as the filter panel shows no hints.
$filter_hints = [
	'Problem status' => [
		_holoztek_mm('The filter on the dashboard starts here each time the dashboard is opened, and its Reset returns here.'), BR(),
		_holoztek_mm('Changes made in the filter are kept on refresh, not saved.')
	],
	'Components' => [
		_holoztek_mm('Components and relations not fetched (see Data acquisition) cannot be chosen.'), BR(),
		_holoztek_mm('Hiding them does not stop them being fetched.')
	]
];

$form_tabs = (new CTabView(['id' => 'mm_config_tabs']))->addClass('mm-config-tabs');

foreach ($tabs as $tab_id => $tab) {
	$form_grid = new CFormGrid();

	foreach ($tab['fields'] as $field_view) {
		$form->registerField($field_view);

		foreach ($field_view->getViewCollection() as ['label' => $label, 'view' => $view, 'class' => $class]) {
			$form_grid->addItem([$label, (new CFormField($view))->addClass($class)]);
		}
	}

	// One row per filter section, its checkboxes in a column as in the filter panel.
	if ($tab_id === 'filter') {
		foreach (WidgetForm::FILTER_SECTIONS as $section => $keys) {
			$checkboxes = (new CDiv())->addClass('mm-filter-defaults');

			foreach (array_keys($keys) as $key) {
				$field_view = new CWidgetFieldCheckBoxView($data['fields'][WidgetForm::filterFieldName($key)]);
				$form->registerField($field_view);
				$checkboxes->addItem(new CDiv($field_view->getView()));
			}

			$form_grid->addItem([
				new CLabel([
					_holoztek_mm($section),
					array_key_exists($section, $filter_hints) ? makeHelpIcon($filter_hints[$section]) : null
				]),
				new CFormField($checkboxes)
			]);
		}
	}

	$form_tabs->addTab('mm_tab_'.$tab_id, $tab['label'], $form_grid);
}

$form_tabs->setSelected(0);

$form
	->addItem($form_tabs)
	->addJavaScript($form_tabs->makeJavascript())
	->includeJsFile('widget.edit.js.php')
	->addJavaScript('holoztek_monitoringmap_form.init('.json_encode([
		'form_tabs_id'      => $form_tabs->getId(),
		'filter_backends'    => array_combine(
			array_map([WidgetForm::class, 'filterFieldName'], array_keys(WidgetForm::FILTER_BACKENDS)),
			WidgetForm::FILTER_BACKENDS
		),
		// APM is listed on 7.0 too, but fetched only on 8.0 and later.
		'available_backends' => holoztek_mm_apm_supported()
			? [WidgetForm::BACKEND_DATABASE, WidgetForm::BACKEND_APM]
			: [WidgetForm::BACKEND_DATABASE]
	]).');')
	->show();
