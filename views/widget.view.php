<?php declare(strict_types = 0);

/**
 * Monitoring Map widget view.
 *
 * @var CView  $this
 * @var array  $data
 */

$s   = $data['settings'];
$sfx = $data['dom_id_suffix'] ?? '';

$error_messages = [
	'nothing_selected' => _mm('Please select a host or host group.'),
	'no_hosts'          => _mm('No matching hosts found.')
];

$content = (new CDiv())->addClass('mm-widget');

if ($data['error'] !== null) {
	$content->addItem(
		(new CDiv($error_messages[$data['error']] ?? $data['error']))->addClass('mm-empty')
	);
}
else {
	$content->addItem(
		(new CDiv())
			->addClass('mm-container js-mm-container')
			->setAttribute('data-elements',         json_encode($data['elements'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE))
			->setAttribute('data-node-font-size',    (string) $s['node_font_size'])
			->setAttribute('data-node-font-style',   (string) $s['node_font_style'])
			->setAttribute('data-node-font-color',   $s['node_font_color'])
			->setAttribute('data-edge-width',        (string) $s['edge_width'])
			->setAttribute('data-edge-color',        $s['edge_color'])
			->setAttribute('data-filter-position',   (string) $s['filter_position'])
			->setAttribute('data-severity-colors',   json_encode($s['severity_colors'], JSON_THROW_ON_ERROR))
			->setAttribute('data-severity-labels',   json_encode($s['severity_labels'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE))
	);
}

(new CWidgetView($data))
	->setVar('dom_id_suffix', $sfx)
	->addItem($content)
	->show();
