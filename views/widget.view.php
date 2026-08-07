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
	'nothing_selected' => 'ホストまたはホストグループを選択してください。',
	'no_hosts'          => '該当するホストが見つかりませんでした。'
];

$content = (new CDiv())->addClass('mm-widget');

if ($data['error'] !== null) {
	$content->addItem(
		(new CDiv($error_messages[$data['error']] ?? $data['error']))->addClass('mm-empty')
	);
}
else {
	$mode_toggle = (new CDiv([
		(new CTag('button', true, 'オブジェクト'))
			->setAttribute('type', 'button')
			->addClass('mm-mode-btn js-mm-mode-object'),
		(new CTag('button', true, 'アイコン'))
			->setAttribute('type', 'button')
			->addClass('mm-mode-btn js-mm-mode-icon'),
	]))->addClass('mm-mode-toggle');

	$content
		->addItem(
			(new CDiv([$mode_toggle]))->addClass('mm-control-row')
		)
		->addItem(
			(new CDiv())
				->addClass('mm-container js-mm-container')
				->setAttribute('data-elements',         json_encode($data['elements'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE))
				->setAttribute('data-server-color',      $s['server_color'])
				->setAttribute('data-proxy-color',       $s['proxy_color'])
				->setAttribute('data-network-color',     $s['network_color'])
				->setAttribute('data-host-color',        $s['host_color'])
				->setAttribute('data-node-font-size',    (string) $s['node_font_size'])
				->setAttribute('data-node-font-style',   (string) $s['node_font_style'])
				->setAttribute('data-edge-width',        (string) $s['edge_width'])
				->setAttribute('data-edge-color',        $s['edge_color'])
		);
}

(new CWidgetView($data))
	->setVar('dom_id_suffix', $sfx)
	->addItem($content)
	->show();
