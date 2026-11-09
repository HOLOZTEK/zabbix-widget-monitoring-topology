'use strict';

class CWidgetHoloztekMonitoringMap extends CWidget {

	// Device-type icons, keyed by host device_type and used for host nodes
	// only. 'network' is a switch/router glyph (same design as the Tree
	// Navigator widget's device-type icon for network equipment hosts) - it
	// must stay visually distinct from #DEVICE_ICON.subnet below, which is the
	// cloud used for the topology's synthetic Network (subnet) waypoint nodes.
	// Conflating the two previously made network-equipment hosts render with
	// the subnet cloud icon.
	static #DEVICE_ICON = {
		server:  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMScgeT0nMi41JyB3aWR0aD0nMTgnIGhlaWdodD0nNScgcng9JzEnIGZpbGw9JyNkZGUzZTgnIHN0cm9rZT0nIzQ0NScgc3Ryb2tlLXdpZHRoPScxLjQnLz48cmVjdCB4PScxJyB5PSc5LjUnIHdpZHRoPScxOCcgaGVpZ2h0PSc1JyByeD0nMScgZmlsbD0nI2RkZTNlOCcgc3Ryb2tlPScjNDQ1JyBzdHJva2Utd2lkdGg9JzEuNCcvPjxjaXJjbGUgY3g9JzE2LjUnIGN5PSc1JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PScxNi41JyBjeT0nMTInIHI9JzEuMScgZmlsbD0nIzI3YTA0MCcvPjxyZWN0IHg9JzMnIHk9JzQuMycgd2lkdGg9JzEwJyBoZWlnaHQ9JzEuNCcgcng9Jy43JyBmaWxsPScjYWFiJy8+PHJlY3QgeD0nMycgeT0nMTEuMycgd2lkdGg9JzEwJyBoZWlnaHQ9JzEuNCcgcng9Jy43JyBmaWxsPScjYWFiJy8+PC9zdmc+",
		linux:   "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PGVsbGlwc2UgY3g9JzEwJyBjeT0nMTMuNScgcng9JzUnIHJ5PSc2JyBmaWxsPScjMjIzMDNhJy8+PGVsbGlwc2UgY3g9JzEwJyBjeT0nMTQuNScgcng9JzIuOCcgcnk9JzQnIGZpbGw9JyNkOGRmZTMnLz48Y2lyY2xlIGN4PScxMCcgY3k9JzYnIHI9JzQuNScgZmlsbD0nIzIyMzAzYScvPjxjaXJjbGUgY3g9JzguMycgY3k9JzUuNScgcj0nMS4zJyBmaWxsPScjZjljNDAwJy8+PGNpcmNsZSBjeD0nMTEuNycgY3k9JzUuNScgcj0nMS4zJyBmaWxsPScjZjljNDAwJy8+PGNpcmNsZSBjeD0nOC4zJyBjeT0nNS41JyByPScuNicgZmlsbD0nIzExMScvPjxjaXJjbGUgY3g9JzExLjcnIGN5PSc1LjUnIHI9Jy42JyBmaWxsPScjMTExJy8+PHBvbHlnb24gcG9pbnRzPSc5LjIsNy4zIDEwLjgsNy4zIDEwLDguNycgZmlsbD0nI2UwNjAwMCcvPjwvc3ZnPg==",
		windows: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMS41JyB5PScxLjUnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxMC43JyB5PScxLjUnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxLjUnIHk9JzEwLjcnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxMC43JyB5PScxMC43JyB3aWR0aD0nNy44JyBoZWlnaHQ9JzcuOCcgcng9Jy44JyBmaWxsPScjMDA5MGNjJy8+PC9zdmc+",
		network: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMScgeT0nNicgd2lkdGg9JzE4JyBoZWlnaHQ9JzcnIHJ4PScxJyBmaWxsPScjY2RkNmRiJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS40Jy8+PGNpcmNsZSBjeD0nNC41JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PSc4JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PScxMS41JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyM3NzgnLz48Y2lyY2xlIGN4PScxNScgY3k9JzkuNScgcj0nMS4xJyBmaWxsPScjNzc4Jy8+PGxpbmUgeDE9JzQuNScgeTE9JzEzJyB4Mj0nNC41JyB5Mj0nMTcnIHN0cm9rZT0nIzMzNCcgc3Ryb2tlLXdpZHRoPScxLjQnLz48bGluZSB4MT0nOCcgeTE9JzEzJyB4Mj0nOCcgeTI9JzE3JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS40Jy8+PGxpbmUgeDE9JzExLjUnIHkxPScxMycgeDI9JzExLjUnIHkyPScxNycgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuNCcvPjxsaW5lIHgxPScxNScgeTE9JzEzJyB4Mj0nMTUnIHkyPScxNycgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuNCcvPjwvc3ZnPg==",
		virtual: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nNCcgeT0nMicgd2lkdGg9JzE0JyBoZWlnaHQ9JzEwJyByeD0nMScgZmlsbD0nI2M1Y2FlOCcgc3Ryb2tlPScjNWM2YmMwJyBzdHJva2Utd2lkdGg9JzEuMicvPjxyZWN0IHg9JzInIHk9JzUnIHdpZHRoPScxNCcgaGVpZ2h0PScxMCcgcng9JzEnIGZpbGw9JyNlZWYnIHN0cm9rZT0nIzMzNCcgc3Ryb2tlLXdpZHRoPScxLjQnLz48bGluZSB4MT0nNCcgeTE9JzEwJyB4Mj0nMTQnIHkyPScxMCcgc3Ryb2tlPScjODg5JyBzdHJva2Utd2lkdGg9Jy45Jy8+PGxpbmUgeDE9JzknIHkxPSc1LjUnIHgyPSc5JyB5Mj0nMTQuNScgc3Ryb2tlPScjODg5JyBzdHJva2Utd2lkdGg9Jy45Jy8+PC9zdmc+",
		// VMware-tree role glyphs (see WidgetView::addHostNode()'s
		// $device_type_override): the same 3D cube outline for all three, tinted
		// a pastel hue and stamped with a 2-letter tag so they read at a glance -
		// pastel yellow "vC" for the vCenter connection host, pastel green "HV"
		// for an ESXi Hypervisor, pastel blue "VM" for a guest.
		vcenter: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPSczLDUgNiwyIDE5LDIgMTYsNScgZmlsbD0nI2Y4ZThiZCcgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuMScgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcvPjxwb2x5Z29uIHBvaW50cz0nMTYsNSAxOSwyIDE5LDE1IDE2LDE4JyBmaWxsPScjZTZjODdlJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4xJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PHJlY3QgeD0nMycgeT0nNScgd2lkdGg9JzEzJyBoZWlnaHQ9JzEzJyByeD0nMS40JyBmaWxsPScjZjNkY2EwJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4yJy8+PHRleHQgeD0nOS42JyB5PScxNC40JyBmb250LWZhbWlseT0nQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nNycgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyMyYjNhNGEnPnZDPC90ZXh0Pjwvc3ZnPg==",
		esxi:    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPSczLDUgNiwyIDE5LDIgMTYsNScgZmlsbD0nI2M4ZTZjMicgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuMScgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcvPjxwb2x5Z29uIHBvaW50cz0nMTYsNSAxOSwyIDE5LDE1IDE2LDE4JyBmaWxsPScjOGZjNTg2JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4xJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PHJlY3QgeD0nMycgeT0nNScgd2lkdGg9JzEzJyBoZWlnaHQ9JzEzJyByeD0nMS40JyBmaWxsPScjYWVkOWE2JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4yJy8+PHRleHQgeD0nOS42JyB5PScxNC40JyBmb250LWZhbWlseT0nQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nNycgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyMyYjNhNGEnPkhWPC90ZXh0Pjwvc3ZnPg==",
		vm:      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPSczLDUgNiwyIDE5LDIgMTYsNScgZmlsbD0nI2MzZGNmMCcgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuMScgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcvPjxwb2x5Z29uIHBvaW50cz0nMTYsNSAxOSwyIDE5LDE1IDE2LDE4JyBmaWxsPScjODNiMGQ2JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4xJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PHJlY3QgeD0nMycgeT0nNScgd2lkdGg9JzEzJyBoZWlnaHQ9JzEzJyByeD0nMS40JyBmaWxsPScjYTZjOGU2JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4yJy8+PHRleHQgeD0nOS42JyB5PScxNC40JyBmb250LWZhbWlseT0nQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nNycgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyMyYjNhNGEnPlZNPC90ZXh0Pjwvc3ZnPg==",
		// Kubernetes-tree role glyphs (see WidgetView::addHostNode()'s
		// $device_type_override, set in the k8s aggregate/component passes): the
		// same 7-sided Kubernetes helm outline for all of them, filled from a
		// saturated Kubernetes-blue scale (brand blue is #326ce5) and set apart
		// by a hue step plus a short tag so the roles read at icon size - brand
		// blue "K8S" for the aggregate "cluster state" host, blue "API" for an
		// API server, cyan-blue "CTL" for a controller manager, indigo-blue
		// "SCH" for a scheduler, blue-teal "KBL" for a kubelet, muted blue-grey
		// "K8S" for anything else.
		k8s_cluster: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPScxMCwxLjggMTYuNDEsNC44OSAxNy45OSwxMS44MiAxMy41NiwxNy4zOSA2LjQ0LDE3LjM5IDIuMDEsMTEuODIgMy41OSw0Ljg5JyBmaWxsPScjMzI2Y2U1JyBzdHJva2U9JyMxZjNhNjMnIHN0cm9rZS13aWR0aD0nMS4yJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PGcgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOSc+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMCcgeTI9JzEuOCcvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMTYuNDEnIHkyPSc0Ljg5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxNy45OScgeTI9JzExLjgyJy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMy41NicgeTI9JzE3LjM5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPSc2LjQ0JyB5Mj0nMTcuMzknLz48bGluZSB4MT0nMTAnIHkxPScxMCcgeDI9JzIuMDEnIHkyPScxMS44MicvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMy41OScgeTI9JzQuODknLz48L2c+PGNpcmNsZSBjeD0nMTAnIGN5PScxMCcgcj0nNicgZmlsbD0nI2VlZjRmYycgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOScvPjx0ZXh0IHg9JzEwJyB5PScxMi4xNScgZm9udC1mYW1pbHk9J0FyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJyBmb250LXNpemU9JzUnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPScjMWYzYTYzJz5LOFM8L3RleHQ+PC9zdmc+",
		k8s_api:     "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPScxMCwxLjggMTYuNDEsNC44OSAxNy45OSwxMS44MiAxMy41NiwxNy4zOSA2LjQ0LDE3LjM5IDIuMDEsMTEuODIgMy41OSw0Ljg5JyBmaWxsPScjM2Y4YWUwJyBzdHJva2U9JyMxZjNhNjMnIHN0cm9rZS13aWR0aD0nMS4yJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PGcgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOSc+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMCcgeTI9JzEuOCcvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMTYuNDEnIHkyPSc0Ljg5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxNy45OScgeTI9JzExLjgyJy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMy41NicgeTI9JzE3LjM5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPSc2LjQ0JyB5Mj0nMTcuMzknLz48bGluZSB4MT0nMTAnIHkxPScxMCcgeDI9JzIuMDEnIHkyPScxMS44MicvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMy41OScgeTI9JzQuODknLz48L2c+PGNpcmNsZSBjeD0nMTAnIGN5PScxMCcgcj0nNicgZmlsbD0nI2VlZjRmYycgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOScvPjx0ZXh0IHg9JzEwJyB5PScxMi4xNScgZm9udC1mYW1pbHk9J0FyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJyBmb250LXNpemU9JzUnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPScjMWYzYTYzJz5BUEk8L3RleHQ+PC9zdmc+",
		k8s_cm:      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPScxMCwxLjggMTYuNDEsNC44OSAxNy45OSwxMS44MiAxMy41NiwxNy4zOSA2LjQ0LDE3LjM5IDIuMDEsMTEuODIgMy41OSw0Ljg5JyBmaWxsPScjMmY5ZmQwJyBzdHJva2U9JyMxZjNhNjMnIHN0cm9rZS13aWR0aD0nMS4yJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PGcgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOSc+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMCcgeTI9JzEuOCcvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMTYuNDEnIHkyPSc0Ljg5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxNy45OScgeTI9JzExLjgyJy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMy41NicgeTI9JzE3LjM5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPSc2LjQ0JyB5Mj0nMTcuMzknLz48bGluZSB4MT0nMTAnIHkxPScxMCcgeDI9JzIuMDEnIHkyPScxMS44MicvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMy41OScgeTI9JzQuODknLz48L2c+PGNpcmNsZSBjeD0nMTAnIGN5PScxMCcgcj0nNicgZmlsbD0nI2VlZjRmYycgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOScvPjx0ZXh0IHg9JzEwJyB5PScxMi4xNScgZm9udC1mYW1pbHk9J0FyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJyBmb250LXNpemU9JzUnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPScjMWYzYTYzJz5DVEw8L3RleHQ+PC9zdmc+",
		k8s_scheduler:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPScxMCwxLjggMTYuNDEsNC44OSAxNy45OSwxMS44MiAxMy41NiwxNy4zOSA2LjQ0LDE3LjM5IDIuMDEsMTEuODIgMy41OSw0Ljg5JyBmaWxsPScjNWI3OGQ2JyBzdHJva2U9JyMxZjNhNjMnIHN0cm9rZS13aWR0aD0nMS4yJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PGcgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOSc+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMCcgeTI9JzEuOCcvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMTYuNDEnIHkyPSc0Ljg5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxNy45OScgeTI9JzExLjgyJy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMy41NicgeTI9JzE3LjM5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPSc2LjQ0JyB5Mj0nMTcuMzknLz48bGluZSB4MT0nMTAnIHkxPScxMCcgeDI9JzIuMDEnIHkyPScxMS44MicvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMy41OScgeTI9JzQuODknLz48L2c+PGNpcmNsZSBjeD0nMTAnIGN5PScxMCcgcj0nNicgZmlsbD0nI2VlZjRmYycgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOScvPjx0ZXh0IHg9JzEwJyB5PScxMi4xNScgZm9udC1mYW1pbHk9J0FyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJyBmb250LXNpemU9JzUnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPScjMWYzYTYzJz5TQ0g8L3RleHQ+PC9zdmc+",
		k8s_kubelet: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPScxMCwxLjggMTYuNDEsNC44OSAxNy45OSwxMS44MiAxMy41NiwxNy4zOSA2LjQ0LDE3LjM5IDIuMDEsMTEuODIgMy41OSw0Ljg5JyBmaWxsPScjMmJiMGM3JyBzdHJva2U9JyMxZjNhNjMnIHN0cm9rZS13aWR0aD0nMS4yJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PGcgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOSc+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMCcgeTI9JzEuOCcvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMTYuNDEnIHkyPSc0Ljg5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxNy45OScgeTI9JzExLjgyJy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMy41NicgeTI9JzE3LjM5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPSc2LjQ0JyB5Mj0nMTcuMzknLz48bGluZSB4MT0nMTAnIHkxPScxMCcgeDI9JzIuMDEnIHkyPScxMS44MicvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMy41OScgeTI9JzQuODknLz48L2c+PGNpcmNsZSBjeD0nMTAnIGN5PScxMCcgcj0nNicgZmlsbD0nI2VlZjRmYycgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOScvPjx0ZXh0IHg9JzEwJyB5PScxMi4xNScgZm9udC1mYW1pbHk9J0FyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJyBmb250LXNpemU9JzUnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPScjMWYzYTYzJz5LQkw8L3RleHQ+PC9zdmc+",
		k8s_node:    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBvbHlnb24gcG9pbnRzPScxMCwxLjggMTYuNDEsNC44OSAxNy45OSwxMS44MiAxMy41NiwxNy4zOSA2LjQ0LDE3LjM5IDIuMDEsMTEuODIgMy41OSw0Ljg5JyBmaWxsPScjN2Y5Y2M0JyBzdHJva2U9JyMxZjNhNjMnIHN0cm9rZS13aWR0aD0nMS4yJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8+PGcgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOSc+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMCcgeTI9JzEuOCcvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMTYuNDEnIHkyPSc0Ljg5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxNy45OScgeTI9JzExLjgyJy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPScxMy41NicgeTI9JzE3LjM5Jy8+PGxpbmUgeDE9JzEwJyB5MT0nMTAnIHgyPSc2LjQ0JyB5Mj0nMTcuMzknLz48bGluZSB4MT0nMTAnIHkxPScxMCcgeDI9JzIuMDEnIHkyPScxMS44MicvPjxsaW5lIHgxPScxMCcgeTE9JzEwJyB4Mj0nMy41OScgeTI9JzQuODknLz48L2c+PGNpcmNsZSBjeD0nMTAnIGN5PScxMCcgcj0nNicgZmlsbD0nI2VlZjRmYycgc3Ryb2tlPScjMWYzYTYzJyBzdHJva2Utd2lkdGg9JzAuOScvPjx0ZXh0IHg9JzEwJyB5PScxMi4xNScgZm9udC1mYW1pbHk9J0FyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmJyBmb250LXNpemU9JzUnIGZvbnQtd2VpZ2h0PSdib2xkJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPScjMWYzYTYzJz5LOFM8L3RleHQ+PC9zdmc+",
		subnet:  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBhdGggZD0nTTUuNiwxNS4zIEMzLjIsMTUuMyAxLjMsMTMuNSAxLjMsMTEuMyBDMS4zLDkuMiAyLjksNy41IDUsNy4zIEM1LjQsNC43IDcuNiwyLjcgMTAuMiwyLjcgQzEzLDIuNyAxNS4zLDQuOCAxNS42LDcuNSBDMTcuNSw3LjcgMTksOS4zIDE5LDExLjIgQzE5LDEzLjQgMTcuMSwxNS4zIDE0LjcsMTUuMyBaJyBmaWxsPScjY2RkNmRiJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS40JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0ncm91bmQnLz48L3N2Zz4=",
	};

	// Node-type glyphs (distinct from the host device-type icons above), used
	// for Server/Proxy/Network nodes now that the icon background no longer
	// encodes node type (it encodes problem severity instead - see #buildIcon).
	static #TYPE_ICON = {
		// Zabbix DB / Proxy DB: plain database cylinder, shared by both.
		zabbix_db: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PHBhdGggZD0nTTUgOHYxNmMwIDIuOCA0LjkgNSAxMSA1czExLTIuMiAxMS01Vjh6JyBmaWxsPScjM2Y3ZmI1Jy8+PGVsbGlwc2UgY3g9JzE2JyBjeT0nOCcgcng9JzExJyByeT0nNScgZmlsbD0nIzZlYTZkMycvPjxwYXRoIGQ9J001IDE0YzAgMi44IDQuOSA1IDExIDVzMTEtMi4yIDExLTVNNSAyMGMwIDIuOCA0LjkgNSAxMSA1czExLTIuMiAxMS01JyBmaWxsPSdub25lJyBzdHJva2U9JyNmZmYnIHN0cm9rZS13aWR0aD0nMS40Jy8+PC9zdmc+",
		proxy_db: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PHBhdGggZD0nTTUgOHYxNmMwIDIuOCA0LjkgNSAxMSA1czExLTIuMiAxMS01Vjh6JyBmaWxsPScjM2Y3ZmI1Jy8+PGVsbGlwc2UgY3g9JzE2JyBjeT0nOCcgcng9JzExJyByeT0nNScgZmlsbD0nIzZlYTZkMycvPjxwYXRoIGQ9J001IDE0YzAgMi44IDQuOSA1IDExIDVzMTEtMi4yIDExLTVNNSAyMGMwIDIuOCA0LjkgNSAxMSA1czExLTIuMiAxMS01JyBmaWxsPSdub25lJyBzdHJva2U9JyNmZmYnIHN0cm9rZS13aWR0aD0nMS40Jy8+PC9zdmc+",
		// APM Data Store / ClickHouse: generic storage stack, no product logo.
		apm_datastore: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PHJlY3QgeD0nNCcgeT0nNCcgd2lkdGg9JzI0JyBoZWlnaHQ9JzcnIHJ4PScyJyBmaWxsPScjN2E1ZmIwJy8+PHJlY3QgeD0nNCcgeT0nMTIuNScgd2lkdGg9JzI0JyBoZWlnaHQ9JzcnIHJ4PScyJyBmaWxsPScjN2E1ZmIwJy8+PHJlY3QgeD0nNCcgeT0nMjEnIHdpZHRoPScyNCcgaGVpZ2h0PSc3JyByeD0nMicgZmlsbD0nIzdhNWZiMCcvPjxjaXJjbGUgY3g9JzknIGN5PSc3LjUnIHI9JzEuNScgZmlsbD0nI2ZmZicvPjxjaXJjbGUgY3g9JzknIGN5PScxNicgcj0nMS41JyBmaWxsPScjZmZmJy8+PGNpcmNsZSBjeD0nOScgY3k9JzI0LjUnIHI9JzEuNScgZmlsbD0nI2ZmZicvPjwvc3ZnPg==",
		// OTel System: hexagon with a small fan-out, no product logo.
		otel_system: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PHBhdGggZD0nTTE2IDIuNWwxMS43IDYuNzV2MTMuNUwxNiAyOS41IDQuMyAyMi43NVY5LjI1eicgZmlsbD0nIzJmOWU4ZicvPjxjaXJjbGUgY3g9JzE2JyBjeT0nMTYnIHI9JzMuNCcgZmlsbD0nI2ZmZicvPjxjaXJjbGUgY3g9JzE2JyBjeT0nOC42JyByPScyJyBmaWxsPScjZmZmJy8+PGNpcmNsZSBjeD0nOS42JyBjeT0nMTkuNycgcj0nMicgZmlsbD0nI2ZmZicvPjxjaXJjbGUgY3g9JzIyLjQnIGN5PScxOS43JyByPScyJyBmaWxsPScjZmZmJy8+PHBhdGggZD0nTTE2IDE2VjguNk0xNiAxNmwtNi40IDMuN00xNiAxNmw2LjQgMy43JyBzdHJva2U9JyNmZmYnIHN0cm9rZS13aWR0aD0nMS40Jy8+PC9zdmc+",
		// OTel Service: application window with tiles, a group of what it runs -
		// a different shape from the System hexagon, not only a different color.
		otel_service: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PHJlY3QgeD0nMycgeT0nNCcgd2lkdGg9JzI2JyBoZWlnaHQ9JzI0JyByeD0nNCcgZmlsbD0nIzFmN2Y5MScvPjxwYXRoIGQ9J00zIDhhNCA0IDAgMCAxIDQtNGgxOGE0IDQgMCAwIDEgNCA0djIuNUgzeicgZmlsbD0nIzE0NTg2NicvPjxyZWN0IHg9JzcnIHk9JzEzLjUnIHdpZHRoPSc3LjUnIGhlaWdodD0nNScgcng9JzEnIGZpbGw9JyNmZmYnLz48cmVjdCB4PScxNy41JyB5PScxMy41JyB3aWR0aD0nNy41JyBoZWlnaHQ9JzUnIHJ4PScxJyBmaWxsPScjZmZmJy8+PHJlY3QgeD0nNycgeT0nMjAuNScgd2lkdGg9JzcuNScgaGVpZ2h0PSc0LjUnIHJ4PScxJyBmaWxsPScjZmZmJy8+PHJlY3QgeD0nMTcuNScgeT0nMjAuNScgd2lkdGg9JzcuNScgaGVpZ2h0PSc0LjUnIHJ4PScxJyBmaWxsPScjZmZmJy8+PC9zdmc+",
		// Root Zabbix Server node: badge with "Z", filled with the Zabbix
		// brand red so this node reads as "Zabbix itself" at a glance.
		zbxserver: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMicgeT0nMicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyByeD0nMycgZmlsbD0nI2Q0MDAwMCcgc3Ryb2tlPScjYTMwMDAwJyBzdHJva2Utd2lkdGg9JzEuNCcvPjx0ZXh0IHg9JzEwJyB5PScxNC44JyBmb250LXNpemU9JzEyJyBmb250LWZhbWlseT0nc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyNmZmYnPlo8L3RleHQ+PC9zdmc+",
		// Proxy node: badge with "P", same red/white design as the Server badge.
		proxy: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMicgeT0nMicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyByeD0nMycgZmlsbD0nI2Q0MDAwMCcgc3Ryb2tlPScjYTMwMDAwJyBzdHJva2Utd2lkdGg9JzEuNCcvPjx0ZXh0IHg9JzEwJyB5PScxNC44JyBmb250LXNpemU9JzEyJyBmb250LWZhbWlseT0nc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyNmZmYnPlA8L3RleHQ+PC9zdmc+",
		// Proxy node, unresponsive: badge with "P" in gray/black instead of the
		// normal red/white, so an unreachable Proxy is visually distinct from a
		// healthy one at a glance (see meta.proxy_unresponsive in #buildIcon).
		proxy_offline: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMicgeT0nMicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyByeD0nMycgZmlsbD0nI2JkYmRiZCcgc3Ryb2tlPScjNmU2ZTZlJyBzdHJva2Utd2lkdGg9JzEuNCcvPjx0ZXh0IHg9JzEwJyB5PScxNC44JyBmb250LXNpemU9JzEyJyBmb250LWZhbWlseT0nc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyMwMDAnPlA8L3RleHQ+PC9zdmc+",
		// Proxy Group node: badge with "G", same red/white design as the Server badge.
		proxy_group: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMicgeT0nMicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyByeD0nMycgZmlsbD0nI2Q0MDAwMCcgc3Ryb2tlPScjYTMwMDAwJyBzdHJva2Utd2lkdGg9JzEuNCcvPjx0ZXh0IHg9JzEwJyB5PScxNC44JyBmb250LXNpemU9JzEyJyBmb250LWZhbWlseT0nc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyNmZmYnPkc8L3RleHQ+PC9zdmc+",
		// Cluster node (VMware/Kubernetes structured monitoring - see
		// HOLOZTEK_MM_CLUSTER_COMM_METHODS server-side): three connected nodes,
		// deliberately distinct from both the subnet cloud (#DEVICE_ICON.subnet)
		// and the Server/Proxy/Proxy Group red badges, since a Cluster node is
		// neither an IP waypoint nor a piece of Zabbix's own infrastructure.
		cluster: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PGNpcmNsZSBjeD0nMTAnIGN5PSc1LjUnIHI9JzMuNCcgZmlsbD0nI2NkZDZkYicgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuMicvPjxjaXJjbGUgY3g9JzUnIGN5PScxNCcgcj0nMy40JyBmaWxsPScjY2RkNmRiJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4yJy8+PGNpcmNsZSBjeD0nMTUnIGN5PScxNCcgcj0nMy40JyBmaWxsPScjY2RkNmRiJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4yJy8+PGxpbmUgeDE9JzEwJyB5MT0nOC41JyB4Mj0nNi4yJyB5Mj0nMTEuNCcgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuMScvPjxsaW5lIHgxPScxMCcgeTE9JzguNScgeDI9JzEzLjgnIHkyPScxMS40JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4xJy8+PGxpbmUgeDE9JzguMicgeTE9JzE0JyB4Mj0nMTEuOCcgeTI9JzE0JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS4xJy8+PC9zdmc+",
		// Datacenter/vCenter node (VMware structured monitoring - see
		// WidgetView::addVmwareHierarchy() server-side): a small building glyph,
		// distinct from the Cluster node's three-connected-nodes icon above -
		// a Datacenter is a physical/vCenter-inventory grouping, not itself a
		// set of connected hosts.
		datacenter: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nNCcgeT0nMicgd2lkdGg9JzEyJyBoZWlnaHQ9JzE2JyByeD0nMScgZmlsbD0nI2NkZDZkYicgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuNCcvPjxyZWN0IHg9JzYuNScgeT0nNC41JyB3aWR0aD0nMicgaGVpZ2h0PScyJyBmaWxsPScjMzM0Jy8+PHJlY3QgeD0nMTEuNScgeT0nNC41JyB3aWR0aD0nMicgaGVpZ2h0PScyJyBmaWxsPScjMzM0Jy8+PHJlY3QgeD0nNi41JyB5PSc4LjUnIHdpZHRoPScyJyBoZWlnaHQ9JzInIGZpbGw9JyMzMzQnLz48cmVjdCB4PScxMS41JyB5PSc4LjUnIHdpZHRoPScyJyBoZWlnaHQ9JzInIGZpbGw9JyMzMzQnLz48cmVjdCB4PSc2LjUnIHk9JzEyLjUnIHdpZHRoPScyJyBoZWlnaHQ9JzInIGZpbGw9JyMzMzQnLz48cmVjdCB4PScxMS41JyB5PScxMi41JyB3aWR0aD0nMicgaGVpZ2h0PScyJyBmaWxsPScjMzM0Jy8+PHJlY3QgeD0nOC41JyB5PScxNS41JyB3aWR0aD0nMycgaGVpZ2h0PScyLjUnIGZpbGw9JyM4ODknLz48L3N2Zz4=",
	};

	// Communication-method badges: rendered as small colored/lettered circles
	// composited onto the host icon (vis-network only supports one image per
	// node, so badges can't be separate overlay nodes).
	static #COMM_BADGE = {
		ping:   { letter: 'P', color: '#2ecc71' },
		snmp:   { letter: 'S', color: '#3498db' },
		agent:  { letter: 'A', color: '#9b59b6' },
		ipmi:   { letter: 'I', color: '#e67e22' },
		vmware: { letter: 'V', color: '#1abc9c' },
		odbc:   { letter: 'O', color: '#e74c3c' },
		jmx:    { letter: 'J', color: '#f39c12' },
		k8s:    { letter: 'K', color: '#326ce5' },
	};

	static #NODE_TYPE_LABEL = {
		server:      'Zabbix Server',
		proxy_group: 'Proxy Group',
		proxy:       'Zabbix Proxy',
		network:     'Network',
		cluster:     'Cluster',
		datacenter:  'Datacenter',
		host:        'Host',
		zabbix_db:     'Zabbix DB',
		proxy_db:      'Proxy DB',
		apm_datastore: 'APM Data Store',
		otel_service:  'OpenTelemetry service',
		otel_system:   'OpenTelemetry system',
	};

	// Not part of the monitoring tree - see #applyVisibility().
	static #BACKEND_NODE_TYPES = new Set(['zabbix_db', 'proxy_db', 'apm_datastore', 'otel_service', 'otel_system']);

	// relation_type -> Relations filter key; an edge without one is monitoring.
	static #RELATION_KEYS = {
		monitoring:  'relMonitoring',
		database:    'relDatabase',
		apm_storage: 'relApmStorage',
		telemetry:   'relTelemetry',
		telemetry_member: 'relTelemetry',
	};

	// Below this share of the new graph already being on screen, an update is
	// a different Topology and gets a fresh layout and fit (see #syncGraph()).
	static #MAJOR_CHANGE_RATIO = 0.2;

	// Stabilization budget: enough to settle the largest graphs before anything
	// is shown, since the layout is frozen as soon as it ends.
	static #STABILIZATION_MIN = 150;
	static #STABILIZATION_MAX = 1000;
	static #STABILIZATION_PER_NODE = 5;

	// Upper bound for new nodes to settle around the frozen ones.
	static #SETTLE_TIMEOUT_MS = 5000;

	// With "Layout iterations before display" set, physics spreads the layout
	// out on screen for at most this long.
	static #ANIMATION_TIMEOUT_MS = 20000;

	// Different patterns, so the relations differ by more than color.
	static #RELATION_DASHES = {
		database:    [8, 5],
		apm_storage: [2, 5],
		telemetry:   [10, 4, 2, 4],
		telemetry_member: [10, 4, 2, 4, 2, 4],
	};

	// Kept identifiable when zoomed out: their icon and label grow with the
	// zoom step below, while Host and OTel System labels are left to fade.
	static #MAJOR_NODE_TYPES = new Set(['server', 'proxy', 'proxy_group', 'apm_datastore', 'zabbix_db', 'otel_service']);

	// [minimum scale, step]: the step multiplies major nodes' icon and label
	// size and every edge's width and dash pattern. Coarse, so that zooming
	// only rarely touches the DataSets.
	static #ZOOM_STEPS = [[0.5, 1], [0.3, 2], [0.18, 3], [0.12, 4], [0, 6]];

	static #NODE_SIZE = 25;

	static #SEARCH_LIMIT = 20;
	static #SEARCH_DEBOUNCE_MS = 150;

	// A search result is never shown smaller than this.
	static #FOCUS_MIN_SCALE = 0.8;

	// Search result marker: a framed, glowing box rather than a color alone,
	// and unrelated to the Proxy highlight, which only thickens edges.
	static #SEARCH_MARK = { background: 'rgba(240,164,0,0.18)', border: '#f0a400' };

	// Legend rows, in display order. VMware and Kubernetes share one row.
	static #LEGEND_NODE_ROWS = [
		['server',        'Zabbix Server'],
		['proxy_group',   'Proxy Group'],
		['proxy',         'Zabbix Proxy'],
		['network',       'Network'],
		['virtual',       'Virtualization / Cluster'],
		['host',          'Host'],
		['zabbix_db',     'Zabbix DB'],
		['proxy_db',      'Proxy DB'],
		['apm_datastore', 'APM Data Store'],
		['otel_service',  'OpenTelemetry service'],
		['otel_system',   'OpenTelemetry system'],
	];

	static #RELATION_LABEL = {
		monitoring:  'Monitoring',
		database:    'Database',
		apm_storage: 'APM storage',
		telemetry:   'Telemetry',
		telemetry_member: 'Service member',
	};

	static #COMM_METHOD_LABEL = {
		ping:   'Ping',
		snmp:   'SNMP',
		agent:  'Agent',
		ipmi:   'IPMI',
		vmware: 'VMware',
		odbc:   'ODBC',
		jmx:    'JMX',
		k8s:    'Kubernetes',
	};

	// Matches WidgetForm::FILTER_POSITION_* on the PHP side.
	static #FILTER_POSITION_CLASS = {
		0: 'mm-filter--top-left',
		1: 'mm-filter--top-right',
		2: 'mm-filter--bottom-left',
		3: 'mm-filter--bottom-right',
	};

	// Every category below is an inclusion-set filter: selecting a checkbox
	// narrows the category to hosts matching one of the selected values (OR
	// within the category); an unchecked value excludes hosts matching only
	// that value, and every category is a complete/covering partition (every
	// possible host state maps to at least one checkbox) so that leaving a
	// whole category unchecked hides every host via that category, never
	// "no restriction". Categories combine with AND. Two keys in the
	// "障害状態" category are special: faultMaintenance is an independent OR
	// gate for hosts in maintenance (checked = show them whatever their
	// problem state, unchecked = hide them), and faultColor controls only
	// whether problem severity is colored onto the icon, never host
	// visibility (see #recomputeSeverity()).
	static #DEFAULT_FILTER = {
		// 障害状態 - faultUnack/faultAck/faultNone are a covering partition over
		// non-maintenance hosts (all on by default = every non-maintenance host
		// shown). faultMaintenance is an independent OR gate: a host in
		// maintenance is shown iff it is checked (default off), regardless of
		// its problem state. faultColor toggles severity-color display only, it
		// never hides a host (see #recomputeSeverity()).
		faultUnack:        true,
		faultAck:          true,
		faultNone:         true,
		faultMaintenance:  false,
		faultColor:        true,
		// インターフェイス - all checked by default (show every host).
		ifaceAvailable:    true,
		ifaceMixed:        true,
		ifaceUnavailable:  true,
		ifaceUnknown:      true,
		// ホスト状態 - cfgNormal defaults on so ordinary hosts (an interface
		// configured, not local-only, monitoring enabled) are shown out of the
		// box. cfgDisabled (default off) is the only bucket that admits
		// host_status === 1; the other three are guarded on host_status === 0
		// so this stays an exclusive 4-way partition (see #hostVisible()).
		cfgNormal:         true,
		cfgNoInterface:    false,
		cfgLocal:          false,
		cfgDisabled:       false,
		// 監視経路 - all checked by default (show every host).
		routeServer:       true,
		routeProxy:        true,
		routeProxyGroup:   true,
		// 監視方式 - all checked by default (show every host).
		methodPing:        true,
		methodAgent:       true,
		methodSnmp:        true,
		methodIpmi:        true,
		methodJmx:         true,
		methodOther:       true,
		// 関係 - what is drawn out of the fetched data, unlike the Widget's
		// backend_components setting, which decides what is fetched at all.
		// Not kept in localStorage: they start from the Widget's "Default
		// relation visibility" (see #applyRelationDefaults()).
		relMonitoring:     true,
		relDatabase:       true,
		relApmStorage:     true,
		relTelemetry:      true,
	};

	// value -> filter-key maps for the "single value per host, select-to-
	// include" categories (インターフェイス/監視経路).
	static #IFACE_KEYS = {
		available:   'ifaceAvailable',
		mixed:       'ifaceMixed',
		unavailable: 'ifaceUnavailable',
		unknown:     'ifaceUnknown',
	};

	static #ROUTE_KEYS = {
		server:      'routeServer',
		proxy:       'routeProxy',
		proxy_group: 'routeProxyGroup',
	};

	// comm_methods bucket -> filter-key map for 監視方式. vmware/odbc/k8s (the
	// comm_methods values not among the 5 explicit methods) all bucket into
	// "other" per user decision - k8s hosts still get their own badge letter
	// (see #COMM_BADGE) for at-a-glance identification, it just isn't a
	// separate filter checkbox. A host with no classifiable comm_methods at
	// all (no items, or only items mm_item_comm_method() can't classify, e.g.
	// HTTP agent/trapper/calculated) also buckets into "other" - see
	// #methodMatch(); this keeps 監視方式 a complete/covering partition per
	// issue #2.
	static #METHOD_KEYS = {
		ping:   'methodPing',
		agent:  'methodAgent',
		snmp:   'methodSnmp',
		ipmi:   'methodIpmi',
		jmx:    'methodJmx',
		vmware: 'methodOther',
		odbc:   'methodOther',
		k8s:    'methodOther',
	};

	#network      = null;
	#nodesDS      = null;
	#edgesDS      = null;
	#nodesMeta    = {};
	#iconCache    = {};
	#s            = {};
	#popupAnchor  = null;
	#children     = {};
	#highlightedProxy = null;
	#filter       = {};
	#panelEl      = null;
	#btnEl        = null;
	// Everything the server sent.
	#model        = { nodes: new Map(), edges: new Map() };
	// Settings the rendered graph was built with - a change needs a rebuild.
	#settingsKey  = null;
	// Host / host group selection last asked for, and the one on screen: a
	// different selection is a different Topology, not a refresh (issue #41).
	#requestedSelection = null;
	#selectionKey = null;
	// Node positions outliving the DataSet: the whole graph across a rebuild.
	#positions    = new Map();
	#savedView    = null;
	#userInteracted = false;
	// 'idle', or what the running physics is for: 'initial' (hidden), then
	// 'animating' when the movement is shown, or 'settling'.
	#layoutPhase  = 'idle';
	#settleTimer  = null;
	#dragging     = false;
	#userPlaced   = new Set();
	#zoomStep     = 1;
	// Search, legend: the state outlives a rebuild, the elements do not.
	#searchQuery    = '';
	#searchSelected = null;
	#searchPainted  = null;
	#searchIndex    = null;
	#searchResults  = [];
	#searchActive   = -1;
	#searchTimer    = null;
	#pendingFocus   = null;
	#infoOpen       = false;
	#searchWrapEl   = null;
	#searchInputEl  = null;
	#searchListEl   = null;
	#infoBtnEl      = null;
	#infoEl         = null;
	// What the last update fetched, for the Info panel (WidgetView 'status').
	#status         = null;
	// Relation filter keys -> on/off as the Widget's settings start them, and
	// the raw setting they came from: the user's choice holds until it changes.
	#relationDefaults    = {};
	#relationDefaultsRaw = null;

	onInitialize() {
		this._dom_id_suffix = '';
		// onInitialize() runs from the base constructor, before private fields exist.
		this._onDocumentClick = (e) => {
			if (this.#panelEl && this.#panelEl.style.display !== 'none'
					&& !this.#panelEl.contains(e.target) && e.target !== this.#btnEl) {
				this.#panelEl.style.display = 'none';
			}
			if (this.#searchWrapEl && !this.#searchWrapEl.contains(e.target)) {
				this.#closeSearchList();
			}
		};
		document.addEventListener('click', this._onDocumentClick);
	}

	onDestroy() {
		document.removeEventListener('click', this._onDocumentClick);
		clearTimeout(this.#searchTimer);
		this.#destroyNetwork();
		this.#hideTooltip();
	}

	hasPadding() {
		return false;
	}

	getUpdateRequestData() {
		const data = super.getUpdateRequestData();
		data.widget_unique_id = this.getUniqueId();
		this.#requestedSelection = this.#selectionKeyOf(data.fields ?? {});
		return data;
	}

	// Order-insensitive, so a Navigator re-broadcasting the same set is no change.
	#selectionKeyOf(fields) {
		const ids = value => (Array.isArray(value) ? value : (value ? [value] : [])).map(String).sort();
		return JSON.stringify([ids(fields.hostid), ids(fields.hostgroupid)]);
	}

	// The update response is only read here, not put into the body: replacing
	// the body would take the canvas with it, and with it the viewport, the
	// node positions and everything else the user is looking at.
	setContents(response) {
		if (response.dom_id_suffix !== undefined) this._dom_id_suffix = response.dom_id_suffix;

		const template = document.createElement('template');
		template.innerHTML = response.body ?? '';

		const next = template.content.querySelector('.js-mm-container');
		const elements = next ? this.#parseJson(next.dataset.elements, []) : [];
		if (next) this.#status = this.#parseJson(next.dataset.status, null);

		// The Navigator (or any other source) picked something else: lay the new
		// Topology out from scratch instead of growing the old layout around it.
		const selectionChanged = this.#selectionKey !== null && this.#requestedSelection !== this.#selectionKey;
		this.#selectionKey = this.#requestedSelection;

		if (this.#network !== null && elements.length > 0 && this.#settingsKeyOf(next) === this.#settingsKey) {
			this.#readModel(elements);
			if (selectionChanged) {
				const { nodes, edges } = this.#renderedGraph();
				this.#replaceGraph(nodes, edges);
			}
			else {
				this.#syncGraph();
			}
			return;
		}

		if (selectionChanged) {
			this.#positions.clear();
			this.#userPlaced.clear();
			this.#userInteracted = false;
			this.#savedView = null;
		}
		else {
			this.#saveLayout();
		}
		this.#destroyNetwork();

		super.setContents(response);

		this.#initGraph();
	}

	onClearContents() {
		this.#saveLayout();
		this.#destroyNetwork();
	}

	// ── graph ─────────────────────────────────────────────────────────────────

	#destroyNetwork() {
		clearTimeout(this.#settleTimer);
		this.#settleTimer = null;
		this.#layoutPhase = 'idle';
		this.#dragging = false;

		if (this.#network !== null) {
			this.#network.destroy();
			this.#network = null;
			this.#nodesDS = null;
			this.#edgesDS = null;
		}
		this.#panelEl = null;
		this.#btnEl = null;

		clearTimeout(this.#searchTimer);
		this.#searchTimer = null;
		this.#searchPainted = null;
		this.#searchIndex = null;
		this.#searchResults = [];
		this.#pendingFocus = null;
		this.#searchWrapEl = null;
		this.#searchInputEl = null;
		this.#searchListEl = null;
		this.#infoBtnEl = null;
		this.#infoEl = null;
	}

	#saveLayout() {
		if (this.#network === null || this.#layoutPhase === 'initial' || this.#layoutPhase === 'animating') return;

		this.#rememberPositions();
		this.#savedView = { position: this.#network.getViewPosition(), scale: this.#network.getScale() };
	}

	#rememberPositions() {
		const positions = this.#network.getPositions();
		for (const id in positions) this.#positions.set(id, positions[id]);
	}

	// What the Widget fetched, and how it went, is data, not a setting.
	#settingsKeyOf(container) {
		const { elements, status, ...settings } = container.dataset;
		return JSON.stringify(settings);
	}

	#initGraph() {
		const container = this._body.querySelector('.js-mm-container');
		if (!container) return;

		const elements = this.#parseJson(container.dataset.elements, []);
		if (elements.length === 0) return;

		this.#settingsKey = this.#settingsKeyOf(container);

		this.#s = {
			fontSize:       parseInt(container.dataset.nodeFontSize  || '12', 10),
			fontWeight:     parseInt(container.dataset.nodeFontStyle || '0', 10) === 1 ? 'bold'   : 'normal',
			fontStyle:      parseInt(container.dataset.nodeFontStyle || '0', 10) === 2 ? 'italic' : 'normal',
			fontColor:      container.dataset.nodeFontColor || this.#detectThemeFontColor(container),
			edgeWidth:      parseFloat(container.dataset.edgeWidth || '1'),
			dragFollowHops: parseInt(container.dataset.dragFollowHops ?? '6', 10),
			layoutIterations: parseInt(container.dataset.layoutIterations || '0', 10),
			edgeColor:      container.dataset.edgeColor     || '#aac4d8',
			filterPosition: parseInt(container.dataset.filterPosition || '1', 10),
			severityColors: this.#parseJson(container.dataset.severityColors, {}),
			severityLabels: this.#parseJson(container.dataset.severityLabels, {}),
		};

		const previousFilter = this.#filter;
		this.#loadFilterState();
		this.#applyRelationDefaults(container.dataset.defaultRelations ?? null, previousFilter);
		this.#status = this.#parseJson(container.dataset.status, null);
		this.#iconCache = {};
		this.#readModel(elements);

		const { nodes, edges } = this.#renderedGraph();

		// A rebuild of a graph already laid out (settings changed, contents
		// cleared in between) resumes that layout instead of starting over.
		const resume = this.#savedView !== null && nodes.every(node => this.#positions.has(node.id));
		if (resume) {
			nodes.forEach(node => Object.assign(node, this.#positions.get(node.id)));
		}
		else {
			this.#positions.clear();
			this.#userPlaced.clear();
			this.#userInteracted = false;
		}

		const nodeCount = nodes.length;

		this.#nodesDS = new vis.DataSet(nodes);
		this.#edgesDS = new vis.DataSet(edges);

		this.#network = new vis.Network(container, {
			nodes: this.#nodesDS,
			edges: this.#edgesDS,
		}, {
			physics: {
				enabled: !resume,
				solver: 'barnesHut',
				barnesHut: {
					gravitationalConstant: -8000,
					centralGravity:        0.3,
					springLength:          130,
					springConstant:        0.04,
					damping:               0.09,
				},
				stabilization: { iterations: this.#layoutBudget(nodeCount), fit: false },
			},
			interaction: {
				hover:        true,
				tooltipDelay: 200,
				hideEdgesOnDrag: true,
			},
			layout: { improvedLayout: true, randomSeed: 1 },
		});

		this.#wireNetworkEvents();
		this.#buildFilterUI(container);
		this.#applyVisibility();
		this.#paintHighlight();
		this.#paintSearchHighlight();

		if (resume) {
			this.#network.moveTo({ ...this.#savedView, animation: false });
		}
		else {
			this.#layoutPhase = 'initial';
		}
		this.#savedView = null;
	}

	// Registered once per Network - updates only ever touch the DataSets.
	#wireNetworkEvents() {
		this.#network.on('click', (params) => {
			if (params.nodes.length === 0) {
				this.#resetEdgeHighlight();
				return;
			}

			const nodeId = params.nodes[0];
			const meta   = this.#nodesMeta[nodeId];
			if (!meta) return;

			if (meta.node_type === 'host') {
				this.#hideTooltip();
				const hostid = nodeId.replace(/^h_/, '');
				this.#showHostMenu(hostid, this.#makePopupEvent(params));
				return;
			}

			if (meta.node_type === 'proxy') {
				this.#toggleProxyHighlight(nodeId);
				return;
			}

			this.#resetEdgeHighlight();
		});

		this.#network.on('hoverNode', (params) => {
			const meta = this.#nodesMeta[params.node];
			if (!meta) return;
			const node = this.#nodesDS.get(params.node);
			this.#showTooltip(node ? node.label : params.node, meta);
		});

		this.#network.on('blurNode', () => this.#hideTooltip());

		const onUserInteraction = () => {
			this.#userInteracted = true;
			this.#pendingFocus = null;
		};
		this.#network.on('zoom', onUserInteraction);
		this.#network.on('dragStart', (params) => {
			onUserInteraction();

			// params.nodes also lists a selected node while the canvas is panned.
			if (this.#network.getNodeAt(params.pointer.DOM) !== undefined) this.#startNodeDrag(params.nodes);
		});

		this.#network.on('dragEnd', (params) => {
			const positions = this.#network.getPositions(params.nodes);
			for (const id in positions) this.#positions.set(id, positions[id]);

			if (this.#dragging) this.#endNodeDrag(params.nodes);
		});

		this.#network.on('stabilizationIterationsDone', () => this.#onStabilizationDone());
		this.#network.on('stabilized', () => this.#finishLayout());

		// Wheel, fit and animated moves alike end up drawn.
		this.#network.on('afterDrawing', () => this.#applyZoomStep());
	}

	#applyZoomStep() {
		const scale = this.#network.getScale();
		const [, step] = CWidgetHoloztekMonitoringMap.#ZOOM_STEPS.find(([min]) => scale >= min);
		if (step === this.#zoomStep) return;

		this.#zoomStep = step;

		const nodeUpdates = [];
		for (const id of this.#nodesDS.getIds()) {
			const meta = this.#nodesMeta[id];
			if (meta && CWidgetHoloztekMonitoringMap.#MAJOR_NODE_TYPES.has(meta.node_type)) {
				nodeUpdates.push({ id, ...this.#nodeStyle(id, meta) });
			}
		}
		if (nodeUpdates.length > 0) this.#nodesDS.update(nodeUpdates);

		const edgeUpdates = this.#edgesDS.get({ filter: edge => edge.relation !== 'monitoring' })
			.map(edge => ({ id: edge.id, dashes: this.#edgeDashes(edge.relation) }));
		if (edgeUpdates.length > 0) this.#edgesDS.update(edgeUpdates);

		this.#paintHighlight();
	}

	#stabilizationBudget(nodeCount) {
		return Math.min(
			CWidgetHoloztekMonitoringMap.#STABILIZATION_MAX,
			Math.max(
				CWidgetHoloztekMonitoringMap.#STABILIZATION_MIN,
				nodeCount * CWidgetHoloztekMonitoringMap.#STABILIZATION_PER_NODE
			)
		);
	}

	#layoutBudget(nodeCount) {
		return this.#s.layoutIterations > 0 ? this.#s.layoutIterations : this.#stabilizationBudget(nodeCount);
	}

	// The hidden part of a fresh layout is done. Unless the movement is to be
	// shown, that is the whole layout; otherwise physics keeps running on
	// screen until the graph settles ('stabilized') or the time is up.
	#onStabilizationDone() {
		if (this.#layoutPhase !== 'initial' || this.#s.layoutIterations === 0) {
			this.#finishLayout();
			return;
		}

		this.#layoutPhase = 'animating';
		if (!this.#userInteracted) this.#network.fit({ animation: false });

		clearTimeout(this.#settleTimer);
		this.#settleTimer = setTimeout(() => this.#finishLayout(), CWidgetHoloztekMonitoringMap.#ANIMATION_TIMEOUT_MS);
	}

	// Physics only ever runs to produce a layout: once that is done, it is
	// switched off so that the graph stays exactly where the user sees it.
	// Physics runs only while the user moves a node, and only for the nodes close
	// to it: the layout is not fully converged, so anything else would drift too.
	#startNodeDrag(nodeIds) {
		this.#dragging = true;
		clearTimeout(this.#settleTimer);
		this.#settleTimer = null;

		if (this.#layoutPhase === 'initial' || this.#s.dragFollowHops === 0) return;

		const free = this.#nodesWithinHops(nodeIds, this.#s.dragFollowHops);
		nodeIds.forEach(id => free.add(id));

		this.#nodesDS.update(this.#nodesDS.getIds().map(id => ({ id, fixed: !free.has(id) })));

		this.#layoutPhase = 'settling';
		this.#network.setOptions({ physics: { enabled: true, stabilization: { enabled: false } } });
	}

	// Excludes what the user placed by hand: those stay where they were dropped.
	#nodesWithinHops(nodeIds, hops) {
		const neighbors = new Map();
		const link = (a, b) => neighbors.has(a) ? neighbors.get(a).push(b) : neighbors.set(a, [b]);

		this.#edgesDS.forEach(({ from, to }) => {
			link(from, to);
			link(to, from);
		});

		const seen = new Set(nodeIds);
		let frontier = nodeIds;
		for (let hop = 0; hop < hops; hop++) {
			frontier = frontier.flatMap(id => neighbors.get(id) ?? []).filter(id => !seen.has(id));
			frontier.forEach(id => seen.add(id));
		}

		nodeIds.forEach(id => seen.delete(id));
		this.#userPlaced.forEach(id => seen.delete(id));

		return seen;
	}

	#endNodeDrag(nodeIds) {
		this.#dragging = false;

		nodeIds.forEach(id => this.#userPlaced.add(id));

		if (this.#layoutPhase === 'idle') return;

		this.#nodesDS.update(nodeIds.map(id => ({ id, fixed: true })));
		this.#settleTimer = setTimeout(() => this.#finishLayout(), CWidgetHoloztekMonitoringMap.#SETTLE_TIMEOUT_MS);
	}

	#finishLayout() {
		if (this.#layoutPhase === 'idle' || this.#dragging) return;

		const initial = this.#layoutPhase === 'initial' || this.#layoutPhase === 'animating';

		this.#layoutPhase = 'idle';
		clearTimeout(this.#settleTimer);
		this.#settleTimer = null;

		this.#network.setOptions({ physics: { enabled: false } });

		const pinned = this.#nodesDS.get({ filter: node => node.fixed === true, fields: ['id'] });
		if (pinned.length > 0) {
			this.#nodesDS.update(pinned.map(({ id }) => ({ id, fixed: false })));
		}

		this.#rememberPositions();

		if (initial && !this.#userInteracted) {
			this.#network.fit({
				animation: this.#s.layoutIterations > 0 ? { duration: 300, easingFunction: 'easeInOutQuad' } : false,
			});
		}

		// A search result picked while a layout was still running.
		if (this.#pendingFocus !== null) {
			const id = this.#pendingFocus;
			this.#pendingFocus = null;
			this.#focusNode(id);
		}
	}

	// Parses the response into the full model. Hosts, Proxies and the like are
	// the server's; which of them get drawn is #renderedGraph()'s business.
	#readModel(elements) {
		const nodes = new Map();
		const edges = new Map();

		elements.forEach(el => {
			if (el.data.source) {
				const relation = el.data.relation_type;

				// Deterministic, so the same edge is recognized across updates.
				// Monitoring edges keep the plain form the highlight walk uses.
				const id = relation
					? `${el.data.source}__${el.data.target}__${relation}`
					: `${el.data.source}__${el.data.target}`;

				edges.set(id, { id, from: el.data.source, to: el.data.target, relation: relation || 'monitoring' });
				return;
			}

			const isHost = el.data.type === 'host';
			const meta = {
				node_type:           el.data.type,
				device_type:         el.data.device_type || 'server',
				comm_methods:        el.data.comm_methods || [],
				proxy_unresponsive:  el.data.proxy_unresponsive || false,
				host_status:         isHost ? Number(el.data.host_status || 0) : null,
				maintenance_status:  isHost ? Number(el.data.maintenance_status || 0) : null,
				has_interface:       isHost ? (el.data.has_interface !== false) : null,
				is_local:            isHost ? (el.data.is_local === true) : null,
				availability:        isHost ? (el.data.availability || 'unknown') : null,
				route:               isHost ? (el.data.route || 'server') : null,
				member_ips:          el.data.member_ips || null,
				apm_collector:       el.data.apm_collector === true,
				backend_owner:       el.data.backend_owner || null,
				db_type:             el.data.db_type || null,
				db_source:           el.data.db_source || null,
				apm_db:              el.data.apm_db || null,
				otel_truncated:      el.data.otel_truncated === true,
				otel_host:           el.data.otel_host || null,
				otel_service:        el.data.otel_service || null,
				otel_namespaces:     el.data.otel_namespaces || [],
				otel_environments:   el.data.otel_environments || [],
				otel_system_count:   el.data.otel_system_count || 0,
				otel_last_observed:  el.data.otel_last_observed || null,
				severity_ack:       isHost && el.data.severity_ack !== undefined && el.data.severity_ack !== null
					? Number(el.data.severity_ack) : null,
				severity_unack:     isHost && el.data.severity_unack !== undefined && el.data.severity_unack !== null
					? Number(el.data.severity_unack) : null,
				severity:           null,
				severity_color:     null,
				severity_label:     null,
			};
			if (isHost) {
				this.#recomputeSeverity(meta);
			}

			nodes.set(el.data.id, { id: el.data.id, label: el.data.label, meta });
		});

		this.#model = { nodes, edges };
	}

	// Turns the model into what is drawn, and refreshes #nodesMeta and
	// #children to match.
	#renderedGraph() {
		const { nodes: modelNodes, edges: modelEdges } = this.#model;

		this.#nodesMeta = {};
		const nodes = [];
		const edges = [];

		for (const { id, label, meta } of modelNodes.values()) {
			this.#nodesMeta[id] = meta;
			nodes.push(this.#visNode(id, label, meta));
		}

		this.#children = {};

		for (const edge of modelEdges.values()) {
			// #children is the monitoring tree only: filter visibility and
			// Proxy highlighting both walk it. A backend relation stays out.
			if (edge.relation === 'monitoring') {
				(this.#children[edge.from] ??= []).push(edge.to);
			}

			edges.push(this.#visEdge(edge));
		}

		return { nodes, edges };
	}

	#visNode(id, label, meta) {
		return {
			id,
			label,
			shape: 'image',
			image: this.#buildIcon(meta),
			...this.#nodeStyle(id, meta),
		};
	}

	// Everything about a node that depends on the zoom step or on the search
	// selection. Sub-objects are always complete: a DataSet update replaces them.
	#nodeStyle(id, meta) {
		const step = CWidgetHoloztekMonitoringMap.#MAJOR_NODE_TYPES.has(meta.node_type) ? this.#zoomStep : 1;
		const fontSize = this.#s.fontSize * step;
		const marked = id === this.#searchSelected;
		const mark = CWidgetHoloztekMonitoringMap.#SEARCH_MARK;
		const color = marked
			? { ...mark, highlight: { ...mark }, hover: { ...mark } }
			: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' };

		return {
			size: CWidgetHoloztekMonitoringMap.#NODE_SIZE * step,
			color,
			borderWidth:         marked ? 3 : 1,
			borderWidthSelected: marked ? 3 : 2,
			shapeProperties: { useBorderWithImage: marked },
			shadow: marked
				? { enabled: true, color: mark.border, size: 18, x: 0, y: 0 }
				: { enabled: false },
			font: {
				color: this.#s.fontColor,
				size:  fontSize,
				bold:  this.#s.fontWeight === 'bold' ? { size: fontSize, vadjust: 0 } : false,
				ital:  this.#s.fontStyle === 'italic',
			},
		};
	}

	#edgeDashes(relation) {
		const pattern = CWidgetHoloztekMonitoringMap.#RELATION_DASHES[relation];
		return pattern ? pattern.map(length => length * this.#zoomStep) : true;
	}

	#visEdge({ id, from, to, relation }) {
		return {
			id,
			from,
			to,
			relation,
			// vis-network defaults edges.color.inherit to 'from', which makes
			// an edge take its connected node's color instead of this
			// explicit one unless disabled here.
			color: { color: this.#s.edgeColor, highlight: this.#s.edgeColor, inherit: false },
			width: this.#s.edgeWidth * this.#zoomStep,
			smooth: { type: 'continuous' },
			...(relation !== 'monitoring' ? { dashes: this.#edgeDashes(relation) } : {}),
		};
	}

	// Brings the DataSets in line with the model, touching only what differs.
	// Same data: at most an icon or a label changes, physics stays off and the
	// view stays put. New or removed nodes: only the new ones get laid out.
	// A different Topology altogether: fresh layout and fit.
	#syncGraph() {
		const { nodes, edges } = this.#renderedGraph();

		const nextNodeIds = new Set(nodes.map(node => node.id));
		const removedNodes = this.#nodesDS.getIds().filter(id => !nextNodeIds.has(id));
		const addedNodes = nodes.filter(node => this.#nodesDS.get(node.id) === null);
		const keptCount = nodes.length - addedNodes.length;
		const smallerCount = Math.min(nodes.length, this.#nodesDS.length);

		if (keptCount / smallerCount < CWidgetHoloztekMonitoringMap.#MAJOR_CHANGE_RATIO) {
			this.#replaceGraph(nodes, edges);
			return;
		}

		const nextEdgeIds = new Set(edges.map(edge => edge.id));
		const removedEdges = this.#edgesDS.getIds().filter(id => !nextEdgeIds.has(id));
		if (removedEdges.length > 0) this.#edgesDS.remove(removedEdges);

		if (removedNodes.length > 0) this.#nodesDS.remove(removedNodes);

		for (const id of this.#positions.keys()) {
			if (nextNodeIds.has(id)) continue;

			this.#positions.delete(id);
			this.#userPlaced.delete(id);
		}

		const changedNodes = [];
		for (const node of nodes) {
			const current = this.#nodesDS.get(node.id);
			if (current !== null && (current.label !== node.label || current.image !== node.image)) {
				changedNodes.push({ id: node.id, label: node.label, image: node.image });
			}
		}
		if (changedNodes.length > 0) this.#nodesDS.update(changedNodes);

		const addedEdges = edges.filter(edge => this.#edgesDS.get(edge.id) === null);

		if (addedNodes.length > 0) this.#placeNewNodes(addedNodes, edges);
		if (addedEdges.length > 0) this.#edgesDS.add(addedEdges);

		this.#applyVisibility();
		this.#paintHighlight();
		this.#refreshSearch();

		if (removedNodes.length > 0 || addedNodes.length > 0) this.#fitIfNothingInView();
	}

	#replaceGraph(nodes, edges) {
		clearTimeout(this.#settleTimer);
		this.#settleTimer = null;

		this.#positions.clear();
		this.#userPlaced.clear();
		this.#userInteracted = false;

		this.#edgesDS.clear();
		this.#nodesDS.clear();
		this.#nodesDS.add(nodes);
		this.#edgesDS.add(edges);

		this.#applyVisibility();
		this.#paintHighlight();
		this.#refreshSearch();

		this.#layoutPhase = 'initial';
		this.#network.setOptions({ physics: { enabled: true } });
		this.#network.stabilize(this.#layoutBudget(nodes.length));
	}

	// Starts new nodes next to what they connect to and lets physics sort out
	// the rest, with every node already on screen pinned: it repels the new
	// ones, but does not move.
	#placeNewNodes(addedNodes, edges) {
		const placed = new Map();
		const known = id => placed.get(id) ?? this.#positions.get(id)
			?? (this.#nodesDS.get(id) !== null ? this.#network.getPositions([id])[id] : undefined);

		const neighbors = new Map(addedNodes.map(node => [node.id, []]));
		for (const { from, to } of edges) {
			neighbors.get(from)?.push(to);
			neighbors.get(to)?.push(from);
		}

		// New nodes may hang off each other, so work outwards from the known ones.
		const pending = new Set(addedNodes.map(node => node.id));
		let spiral = 0;

		const place = (id, requireAnchor) => {
			const saved = this.#positions.get(id);
			if (saved !== undefined) {
				placed.set(id, saved);
				return true;
			}

			const anchors = neighbors.get(id).map(known).filter(position => position !== undefined);
			if (anchors.length === 0 && requireAnchor) return false;

			const center = anchors.length > 0
				? {
					x: anchors.reduce((sum, position) => sum + position.x, 0) / anchors.length,
					y: anchors.reduce((sum, position) => sum + position.y, 0) / anchors.length,
				}
				: this.#network.getViewPosition();

			// Golden-angle spiral: siblings start apart, in a stable order.
			const radius = 80 + 18 * Math.sqrt(spiral);
			const angle  = spiral * 2.399963;
			spiral++;

			placed.set(id, { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
			return true;
		};

		for (let progress = true; progress && pending.size > 0;) {
			progress = false;
			for (const id of pending) {
				if (place(id, true)) {
					pending.delete(id);
					progress = true;
				}
			}
		}
		pending.forEach(id => place(id, false));

		const placedNodes = addedNodes.map(node => ({ ...node, ...placed.get(node.id) }));

		// The running stabilization takes them along.
		if (this.#layoutPhase === 'initial' || this.#layoutPhase === 'animating') {
			this.#nodesDS.add(placedNodes);
			return;
		}

		const pinned = this.#nodesDS.getIds().map(id => ({ id, fixed: true }));
		if (pinned.length > 0) this.#nodesDS.update(pinned);

		this.#nodesDS.add(placedNodes);

		this.#layoutPhase = 'settling';
		this.#network.setOptions({ physics: { enabled: true, stabilization: { enabled: false } } });
		this.#network.startSimulation();

		clearTimeout(this.#settleTimer);
		this.#settleTimer = setTimeout(() => this.#finishLayout(), CWidgetHoloztekMonitoringMap.#SETTLE_TIMEOUT_MS);
	}

	#fitIfNothingInView() {
		const visibleIds = this.#nodesDS.get({ filter: node => !node.hidden, fields: ['id'] }).map(({ id }) => id);
		if (visibleIds.length === 0) return;

		const { clientWidth, clientHeight } = this.#network.canvas.frame;
		const positions = this.#network.getPositions(visibleIds);

		const anyInView = visibleIds.some(id => {
			const { x, y } = this.#network.canvasToDOM(positions[id]);
			return x >= 0 && y >= 0 && x <= clientWidth && y <= clientHeight;
		});

		if (!anyInView) this.#network.fit({ animation: false });
	}

	// No node_font_color set in the widget's settings (the field is left blank
	// by default - see WidgetForm.php) - fall back to whatever text color the
	// current dashboard theme (light/dark) resolves to on this element, rather
	// than a hardcoded color that goes invisible against a dark background.
	#detectThemeFontColor(container) {
		const color = getComputedStyle(container).color;
		return color || '#333333';
	}

	// Parses a JSON data-attribute defensively - malformed/missing attributes
	// fall back to $fallback rather than breaking graph construction.
	#parseJson(str, fallback) {
		try {
			return str ? JSON.parse(str) : fallback;
		} catch (_) {
			return fallback;
		}
	}

	// Emergency fallback only, for Host nodes - the server always sends a
	// severity_color for every host (see WidgetView::applySeverities()), so
	// this path isn't normally reached. Server/Proxy Group/Proxy/Network don't
	// use this at all (see #buildIcon's bgColor).
	#colorForType() {
		return '#6a8da8';
	}

	// Thickens every edge on the path from a Proxy node down to the hosts it
	// monitors (Proxy -> Network -> Host), so the whole reachable subtree is
	// visually traceable. Clicking the same Proxy again clears it.
	#toggleProxyHighlight(proxyId) {
		if (this.#highlightedProxy === proxyId) {
			this.#resetEdgeHighlight();
			return;
		}

		this.#highlightedProxy = proxyId;
		this.#paintHighlight();
	}

	#resetEdgeHighlight() {
		if (this.#highlightedProxy === null) return;

		this.#highlightedProxy = null;
		this.#paintHighlight();
	}

	// Applies #highlightedProxy to the edges as they are now, so it also carries
	// an active highlight over to an updated tree. Only a Proxy gone from the
	// data ends it.
	#paintHighlight() {
		if (!this.#edgesDS) return;

		if (this.#highlightedProxy !== null && !(this.#highlightedProxy in this.#nodesMeta)) {
			this.#highlightedProxy = null;
		}

		const highlighted = new Set();
		const stack = this.#highlightedProxy !== null ? [this.#highlightedProxy] : [];
		while (stack.length > 0) {
			const id = stack.pop();
			for (const child of this.#children[id] || []) {
				highlighted.add(id + '__' + child);
				stack.push(child);
			}
		}

		const baseWidth = this.#s.edgeWidth * this.#zoomStep;
		const highlightWidth = (this.#s.edgeWidth * 3 + 2) * this.#zoomStep;

		const updates = [];
		for (const edge of this.#edgesDS.get()) {
			const width = highlighted.has(edge.id) ? highlightWidth : baseWidth;
			if (edge.width !== width) updates.push({ id: edge.id, width });
		}
		if (updates.length > 0) this.#edgesDS.update(updates);
	}

	/**
	 * Zabbix's menu popup positions itself relative to a real DOM element.
	 * Vis Network nodes are canvas-drawn, not DOM elements, so we drop an
	 * invisible anchor at the click point and use that as the popup's
	 * reference element instead of computing pageX/pageY by hand.
	 */
	#makePopupEvent(params) {
		if (!this.#popupAnchor) {
			this.#popupAnchor = document.createElement('span');
			this.#popupAnchor.style.cssText = 'position:fixed;width:0;height:0;pointer-events:none;';
			document.body.appendChild(this.#popupAnchor);
		}

		const canvas = this.#network.canvas.frame.canvas;
		const rect   = canvas.getBoundingClientRect();

		this.#popupAnchor.style.left = `${rect.left + params.pointer.DOM.x}px`;
		this.#popupAnchor.style.top  = `${rect.top  + params.pointer.DOM.y}px`;

		return {
			type: 'click',
			originalEvent: { detail: 0 },
			target: this.#popupAnchor
		};
	}

	#showHostMenu(hostid, event) {
		const $obj = $(event.target);

		$.ajax({
			url: 'zabbix.php?action=menu.popup&type=host',
			method: 'POST',
			data: { data: { hostid } },
			dataType: 'json'
		}).done((resp) => {
			if (!resp || 'error' in resp) return;
			$obj.menuPopup(getMenuPopupHost(resp.data, $obj), event, {});
		});
	}

	// Composites a colored background circle (problem severity - see
	// meta.severity_color, computed server-side from active Problems / Zabbix's
	// configured severity colors), a node-type/device-type glyph, and, for
	// hosts, a row of communication-method badges into a single SVG, then
	// returns it as a base64 data URI (vis-network's 'image' shape only
	// supports one image per node).
	#buildIcon(meta) {
		const cacheKey = `${meta.node_type}|${meta.device_type}|${meta.severity_color}|${meta.proxy_unresponsive}|${(meta.comm_methods || []).join(',')}`;
		if (this.#iconCache[cacheKey]) return this.#iconCache[cacheKey];

		// Only Host nodes carry a severity color (see WidgetView::applySeverities()) -
		// Server/Proxy Group/Proxy/Network aren't monitored objects with Problems
		// of their own, so they skip this background circle entirely and show
		// only their own badge/glyph (drawn below), instead of doubling up with
		// a same-colored circle behind it.
		const bgColor = meta.node_type === 'host'
			? (meta.severity_color || this.#colorForType())
			: 'none';
		const deviceIcon = meta.node_type === 'host'
			? (CWidgetHoloztekMonitoringMap.#DEVICE_ICON[meta.device_type] || CWidgetHoloztekMonitoringMap.#DEVICE_ICON.server)
			: meta.node_type === 'network'
				? CWidgetHoloztekMonitoringMap.#DEVICE_ICON.subnet
				: meta.node_type === 'proxy' && meta.proxy_unresponsive
					? CWidgetHoloztekMonitoringMap.#TYPE_ICON.proxy_offline
					: (CWidgetHoloztekMonitoringMap.#TYPE_ICON[meta.node_type] || CWidgetHoloztekMonitoringMap.#TYPE_ICON.zbxserver);

		const badges = (meta.comm_methods || []).map((method, i) => {
			const badge = CWidgetHoloztekMonitoringMap.#COMM_BADGE[method];
			if (!badge) return '';
			const cx = 8 + i * 9;
			const cy = 36;
			return `<circle cx="${cx}" cy="${cy}" r="4.3" fill="${badge.color}" stroke="#fff" stroke-width="0.6"/>`
				+ `<text x="${cx}" y="${cy + 1.8}" font-size="5.5" font-family="sans-serif" font-weight="bold" `
				+ `text-anchor="middle" fill="#fff">${badge.letter}</text>`;
		}).join('');

		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">`
			+ `<circle cx="20" cy="17" r="15" fill="${bgColor}"/>`
			+ `<image href="${deviceIcon}" x="9" y="6" width="22" height="22"/>`
			+ badges
			+ `</svg>`;

		const dataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
		this.#iconCache[cacheKey] = dataUri;
		return dataUri;
	}

	// ── filter ────────────────────────────────────────────────────────────────

	#filterStorageKey() {
		// getWidgetId() is the DB-stored id, stable across dashboard reloads and
		// distinct per widget instance. It's null until the widget is first saved
		// (new/unsaved widget), so fall back to the runtime id in that case - an
		// unsaved widget has no persisted state to restore anyway.
		return `holoztek-monitoringmap-filter-${this.getWidgetId() ?? this.getUniqueId()}`;
	}

	// pre-v1.0.1 key (before the holoztek_ id/prefix rename); same widget-id basis.
	#legacyFilterStorageKey() {
		return `monitoringmap-filter-${this.getWidgetId() ?? this.getUniqueId()}`;
	}

	#loadFilterState() {
		const defaults = { ...CWidgetHoloztekMonitoringMap.#DEFAULT_FILTER };
		try {
			let raw = localStorage.getItem(this.#filterStorageKey());
			if (raw === null) {
				// one-time migration: only when the new key has no data yet, so an
				// existing new-key value always wins and is never clobbered.
				const legacyRaw = localStorage.getItem(this.#legacyFilterStorageKey());
				if (legacyRaw !== null) {
					raw = legacyRaw;
					localStorage.setItem(this.#filterStorageKey(), raw);
				}
			}
			const stored = raw ? JSON.parse(raw) : null;
			this.#filter = stored
				? Object.assign(defaults, this.#withoutRelations(this.#migrateFilterState(stored)))
				: defaults;
		} catch (_) {
			this.#filter = defaults;
		}
	}

	// Up to v1.2.5 the relations were stored with the rest of the filter.
	#withoutRelations(filter) {
		if (filter === null || typeof filter !== 'object') return filter;

		const stripped = { ...filter };
		for (const key of Object.values(CWidgetHoloztekMonitoringMap.#RELATION_KEYS)) delete stripped[key];
		return stripped;
	}

	// The relations start where the Widget's settings put them each time the
	// dashboard is opened, and again whenever those settings change. Otherwise
	// - a refresh, a rebuild for another setting - the user's choice holds.
	#applyRelationDefaults(raw, previousFilter) {
		const keep = raw === this.#relationDefaultsRaw;
		const values = this.#parseJson(raw, {});
		const defaults = {};

		// Dashboards saved before the setting existed send nothing: all on.
		for (const [relation, key] of Object.entries(CWidgetHoloztekMonitoringMap.#RELATION_KEYS)) {
			if (!(key in defaults) || relation in values) defaults[key] = values[relation] !== false;
		}

		this.#relationDefaults = defaults;
		this.#relationDefaultsRaw = raw;

		for (const key in defaults) {
			this.#filter[key] = keep && key in previousFilter ? previousFilter[key] : defaults[key];
		}
	}

	// Pre-v1.0.8 the filter had a separate ホスト状態 category
	// (statusEnabled/statusMaintenance/statusDisabled) and no faultNone /
	// faultMaintenance / faultColor keys. A blob from that era is detected by
	// the absence of faultMaintenance; carry the user's intent across the
	// restructure and drop the now-dead keys so Object.assign doesn't keep
	// them around.
	#migrateFilterState(stored) {
		if (stored === null || typeof stored !== 'object' || 'faultMaintenance' in stored) {
			return stored;
		}

		stored.faultMaintenance = stored.statusMaintenance === true;
		stored.cfgDisabled      = stored.statusDisabled === true;
		// Old severity-color rule: shown iff faultAck or faultUnack was checked.
		stored.faultColor = stored.faultUnack !== false || stored.faultAck !== false;
		// The presence partition is new; default it fully on so a migrated user
		// keeps seeing every non-maintenance host exactly as before.
		stored.faultUnack = true;
		stored.faultAck   = true;
		stored.faultNone  = true;

		delete stored.statusEnabled;
		delete stored.statusMaintenance;
		delete stored.statusDisabled;

		return stored;
	}

	#saveFilterState() {
		try {
			localStorage.setItem(this.#filterStorageKey(), JSON.stringify(this.#withoutRelations(this.#filter)));
		} catch (_) {
			// localStorage unavailable (private browsing, quota, ...) - filter
			// state just won't persist across reloads, no functional impact.
		}
	}

	// Recomputes a host's effective severity from its ack/unack problem
	// buckets (see WidgetView::applyProblems()) and the current filter state,
	// entirely client-side. severity stays -1 (MM_SEVERITY_OK, see
	// helpers.php) when neither faultAck nor faultUnack is checked or neither
	// enabled bucket has an active problem. faultColor then gates whether the
	// resulting severity is painted onto the icon at all - it never changes
	// host visibility.
	#recomputeSeverity(meta) {
		let severity = null;

		if (this.#filter.faultAck && meta.severity_ack !== null) {
			severity = severity === null ? meta.severity_ack : Math.max(severity, meta.severity_ack);
		}
		if (this.#filter.faultUnack && meta.severity_unack !== null) {
			severity = severity === null ? meta.severity_unack : Math.max(severity, meta.severity_unack);
		}

		meta.severity = severity === null ? -1 : severity;

		// "深刻度で色分け表示" off means the severity color is not painted onto
		// the icon - showing the OK/green circle here would misleadingly imply
		// a confirmed-healthy status, so the host icon's background goes fully
		// transparent instead. Host visibility is unaffected either way.
		if (!this.#filter.faultColor) {
			meta.severity_color = 'none';
			meta.severity_label = null;
			return;
		}

		const key = String(meta.severity);
		meta.severity_color = this.#s.severityColors[key] || this.#colorForType();
		meta.severity_label = this.#s.severityLabels[key] || null;
	}

	// Re-derives severity for every host node (problem-filter checkboxes
	// changed) and refreshes the affected icons in place, without rebuilding
	// the graph.
	#refreshSeverities() {
		if (!this.#nodesDS) return;

		const updates = [];
		for (const id in this.#nodesMeta) {
			const meta = this.#nodesMeta[id];
			if (meta.node_type !== 'host') continue;
			this.#recomputeSeverity(meta);
			updates.push({ id, image: this.#buildIcon(meta) });
		}
		if (updates.length > 0) this.#nodesDS.update(updates);
	}

	// True if the host's single value for this category matches one of the
	// checked keys - an unchecked category (nothing checked) matches nothing,
	// hiding every host via this category. Used for インターフェイス/監視経路 (each
	// host has exactly one value in these categories).
	#singleMatch(valueKeys, value) {
		const key = valueKeys[value];
		return key !== undefined && this.#filter[key];
	}

	// True if the host has at least one of the checked tags (OR) - an
	// unchecked category matches nothing, hiding every host via this
	// category. Used for ホスト状態 (independent boolean tags); the category
	// includes a "baseline" tag (cfgNormal) so an ordinary host always has at
	// least one tag available to match.
	#tagMatch(pairs) {
		return pairs.some(([key, hostHasTag]) => this.#filter[key] && hostHasTag);
	}

	// True if the host has at least one comm_method bucketing into a checked
	// 監視方式 checkbox (OR) - an unchecked category matches nothing, hiding
	// every host via this category. A host can have multiple comm_methods at
	// once. An empty commMethods array (no items, or only unclassifiable
	// items) buckets into methodOther - without this, such hosts would never
	// match any key here and be hidden unconditionally regardless of which
	// checkboxes are on (issue #2).
	#methodMatch(commMethods) {
		if (commMethods.length === 0) return this.#filter.methodOther;

		return commMethods.some(method => {
			const key = CWidgetHoloztekMonitoringMap.#METHOD_KEYS[method];
			return key !== undefined && this.#filter[key];
		});
	}

	// AND-combines the host-level categories. 障害状態 gates first: a host in
	// maintenance passes only through the faultMaintenance OR-gate, every
	// other host through the faultUnack/faultAck/faultNone partition (see
	// #faultStateMatch()). The faultColor key is display-only, not consulted
	// here.
	#hostVisible(meta) {
		if (meta.maintenance_status === 1 && meta.host_status === 0) {
			// Independent OR gate: a host in maintenance is shown iff
			// faultMaintenance is checked, whatever its problem state.
			if (!this.#filter.faultMaintenance) return false;
		}
		else if (!this.#faultStateMatch(meta)) {
			return false;
		}

		if (!this.#tagMatch([
			['cfgNormal',      meta.host_status === 0 && meta.has_interface && !meta.is_local],
			['cfgNoInterface', meta.host_status === 0 && !meta.has_interface],
			['cfgLocal',       meta.host_status === 0 && meta.is_local],
			['cfgDisabled',    meta.host_status === 1],
		])) return false;

		if (!this.#singleMatch(CWidgetHoloztekMonitoringMap.#IFACE_KEYS, meta.availability)) return false;

		if (!this.#singleMatch(CWidgetHoloztekMonitoringMap.#ROUTE_KEYS, meta.route)) return false;

		if (!this.#methodMatch(meta.comm_methods)) return false;

		return true;
	}

	// 障害状態 partition over non-maintenance hosts: faultUnack/faultAck match a
	// host carrying an unacknowledged / acknowledged active problem, faultNone
	// matches a host with no active problem at all. All three checked = every
	// non-maintenance host matches. Hosts in maintenance never reach here -
	// they go through the faultMaintenance gate in #hostVisible() instead.
	#faultStateMatch(meta) {
		if (this.#filter.faultUnack && meta.severity_unack !== null) return true;
		if (this.#filter.faultAck   && meta.severity_ack   !== null) return true;
		if (this.#filter.faultNone  && meta.severity_unack === null && meta.severity_ack === null) return true;
		return false;
	}

	// A node stays visible iff it matches the filter itself OR at least one of
	// its descendants does - every node is only ever created because of an
	// actual host in the current selection (see WidgetView::doAction()), so this
	// cascade never spuriously keeps an ancestor with no host descendants at
	// all; it only fires because of these filters. This applies to Host nodes
	// too: since v1.0.9 a Host can be the structural ancestor of a deeper Host
	// (vCenter/ESXi over their VMs, a k8s aggregate host - which carries no
	// interface, so the default filter hides it - over its Cluster + component
	// hosts), and an ancestor that fails the filter must still be drawn so the
	// root-to-match path and its edges stay connected. Edges follow their
	// endpoints.
	#applyVisibility() {
		if (!this.#nodesDS || !this.#edgesDS) return;

		const metas = Object.values(this.#nodesMeta);
		const serverAnchored = metas.some(meta => !meta.backend_owner
			&& CWidgetHoloztekMonitoringMap.#BACKEND_NODE_TYPES.has(meta.node_type)
		);

		const visible = {};
		const computeVisible = (id) => {
			if (id in visible) return visible[id];
			const meta = this.#nodesMeta[id];
			// Seed against re-entrancy before recursing into children.
			visible[id] = false;

			// Backend components ignore the Host filter: a Proxy DB follows its
			// Proxy, the Server-level ones always stay.
			if (meta && CWidgetHoloztekMonitoringMap.#BACKEND_NODE_TYPES.has(meta.node_type)) {
				visible[id] = meta.backend_owner ? computeVisible(meta.backend_owner) : true;
				return visible[id];
			}

			// An APM-enabled Proxy may monitor no Host at all, and the Server has
			// to stay as the anchor of its Zabbix DB / APM Data Store.
			const selfMatch = meta
				? (meta.node_type === 'host'
					? this.#hostVisible(meta)
					: meta.apm_collector || (meta.node_type === 'server' && serverAnchored))
				: false;
			const result = selfMatch
				|| (this.#children[id] || []).some(childId => computeVisible(childId));
			visible[id] = result;
			return result;
		};

		Object.keys(this.#nodesMeta).forEach(computeVisible);

		// Relations filter, on top: an edge is drawn iff its relation is on and
		// both ends passed the above, and a node needs a drawn edge to stay. A
		// node with no edge at all has only the monitoring tree to belong to.
		const relationKeys = CWidgetHoloztekMonitoringMap.#RELATION_KEYS;
		const drawnEdges = new Set();
		const connected = new Set();
		const hasEdge = new Set();

		for (const edge of this.#edgesDS.get()) {
			hasEdge.add(edge.from);
			hasEdge.add(edge.to);

			if (this.#filter[relationKeys[edge.relation]] && visible[edge.from] && visible[edge.to]) {
				drawnEdges.add(edge.id);
				connected.add(edge.from);
				connected.add(edge.to);
			}
		}

		const shown = id => visible[id] && (hasEdge.has(id) ? connected.has(id) : this.#filter.relMonitoring);

		const nodeUpdates = [];
		for (const node of this.#nodesDS.get()) {
			const hidden = !shown(node.id);
			if (!!node.hidden !== hidden) nodeUpdates.push({ id: node.id, hidden });
		}
		if (nodeUpdates.length > 0) this.#nodesDS.update(nodeUpdates);

		const edgeUpdates = [];
		for (const edge of this.#edgesDS.get()) {
			const hidden = !drawnEdges.has(edge.id);
			if (!!edge.hidden !== hidden) edgeUpdates.push({ id: edge.id, hidden });
		}
		if (edgeUpdates.length > 0) this.#edgesDS.update(edgeUpdates);

		this.#toggleEmptyOverlay(!Object.keys(this.#nodesMeta).some(shown));
		this.#syncRelationRows();
	}

	// Relations the current data has none of cannot be switched: they are off
	// in the Widget's settings, not in this filter.
	#syncRelationRows() {
		if (!this.#panelEl) return;

		// One key can switch several relations: Telemetry is the whole OTel path.
		const relationKeys = CWidgetHoloztekMonitoringMap.#RELATION_KEYS;
		const present = new Set(this.#edgesDS.get().map(edge => relationKeys[edge.relation]));

		for (const key of new Set(Object.values(relationKeys))) {
			const input = this.#panelEl.querySelector(`input[data-filter="${key}"]`);
			if (input) input.disabled = !present.has(key);
		}
	}

	#onFilterChanged(key) {
		if (key === 'faultAck' || key === 'faultUnack' || key === 'faultColor') {
			this.#refreshSeverities();
		}
		this.#applyVisibility();
	}

	#toggleEmptyOverlay(show) {
		const container = this._body.querySelector('.js-mm-container');
		if (!container) return;

		let overlay = container.querySelector('.mm-filter-empty');
		if (show) {
			if (!overlay) {
				overlay = document.createElement('div');
				overlay.className = 'mm-filter-empty';
				overlay.textContent = t('No hosts match the current filter.');
				container.appendChild(overlay);
			}
		}
		else if (overlay) {
			overlay.remove();
		}
	}

	#filterPanelHtml() {
		const row = (key, label) =>
			`<label class="mm-filter-item">`
			+ `<input type="checkbox" data-filter="${key}"> ${this.#escape(label)}</label>`;
		// Relations carry their line style, so the filter doubles as a legend.
		const relationRow = (key, relation) =>
			`<label class="mm-filter-item">`
			+ `<input type="checkbox" data-filter="${key}"> ${this.#relationSample(relation)}`
			+ ` ${this.#escape(t(CWidgetHoloztekMonitoringMap.#RELATION_LABEL[relation]))}</label>`;

		return `
			<div class="mm-filter-header">
				<span>${this.#escape(t('Filter'))}</span>
				<button type="button" class="mm-filter-reset">${this.#escape(t('Reset'))}</button>
			</div>
			<details class="mm-filter-category">
				<summary>${this.#escape(t('Problem status'))}</summary>
				${row('faultUnack', t('Unacknowledged'))}
				${row('faultAck', t('Acknowledged'))}
				${row('faultNone', t('No problem'))}
				${row('faultMaintenance', t('Include hosts in maintenance'))}
				<div class="mm-filter-divider"></div>
				${row('faultColor', t('Colorize by severity'))}
			</details>
			<details class="mm-filter-category">
				<summary>${this.#escape(t('Host status'))}</summary>
				${row('cfgNormal', t('Normal hosts'))}
				${row('cfgNoInterface', t('No interface configured'))}
				${row('cfgLocal', t('Local host monitoring'))}
				${row('cfgDisabled', t('Disabled hosts'))}
			</details>
			<details class="mm-filter-category">
				<summary>${this.#escape(t('Interface'))}</summary>
				${row('ifaceAvailable', t('Available'))}
				${row('ifaceMixed', t('Mixed'))}
				${row('ifaceUnavailable', t('Not available'))}
				${row('ifaceUnknown', t('Unknown'))}
			</details>
			<details class="mm-filter-category">
				<summary>${this.#escape(t('Monitoring route'))}</summary>
				${row('routeServer', t('Zabbix Server'))}
				${row('routeProxy', t('Zabbix Proxy'))}
				${row('routeProxyGroup', t('Proxy Group'))}
			</details>
			<details class="mm-filter-category">
				<summary>${this.#escape(t('Monitoring method'))}</summary>
				${row('methodPing', t('Ping'))}
				${row('methodAgent', t('Zabbix Agent'))}
				${row('methodSnmp', t('SNMP'))}
				${row('methodIpmi', t('IPMI'))}
				${row('methodJmx', t('JMX'))}
				${row('methodOther', t('Other'))}
			</details>
			<details class="mm-filter-category">
				<summary>${this.#escape(t('Relations'))}</summary>
				${relationRow('relMonitoring', 'monitoring')}
				${relationRow('relDatabase', 'database')}
				${relationRow('relApmStorage', 'apm_storage')}
				${relationRow('relTelemetry', 'telemetry')}
			</details>
		`;
	}

	#wireFilterPanel(panel) {
		panel.querySelectorAll('input[type=checkbox][data-filter]').forEach(input => {
			const key = input.dataset.filter;
			input.checked = !!this.#filter[key];
			input.addEventListener('change', () => {
				this.#filter[key] = input.checked;
				this.#saveFilterState();
				this.#onFilterChanged(key);
			});
		});

		panel.querySelector('.mm-filter-reset').addEventListener('click', () => {
			this.#filter = { ...CWidgetHoloztekMonitoringMap.#DEFAULT_FILTER, ...this.#relationDefaults };
			this.#saveFilterState();
			panel.querySelectorAll('input[type=checkbox][data-filter]').forEach(input => {
				input.checked = !!this.#filter[input.dataset.filter];
			});
			this.#refreshSeverities();
			this.#applyVisibility();
		});
	}

	// The toolbar - [search][fit][info][filter], the filter in the corner -
	// and the panels it opens. Built once per Network: updates keep it as is.
	#buildFilterUI(container) {
		const posClass = CWidgetHoloztekMonitoringMap.#FILTER_POSITION_CLASS[this.#s.filterPosition]
			|| CWidgetHoloztekMonitoringMap.#FILTER_POSITION_CLASS[1];
		const icon = paths => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="16" height="16"'
			+ ' aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.6"'
			+ ` stroke-linejoin="round" stroke-linecap="round">${paths}</g></svg>`;

		const toolbar = document.createElement('div');
		toolbar.className = `mm-toolbar ${posClass}`;
		toolbar.setAttribute('role', 'toolbar');
		container.appendChild(toolbar);

		this.#buildSearchUI(toolbar, icon('<circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.6 12.6l5 5"/>'));

		toolbar.appendChild(this.#toolButton('mm-fit-btn', t('Fit topology to view'),
			icon('<path d="M3 7.5V3h4.5M12.5 3H17v4.5M17 12.5V17h-4.5M7.5 17H3v-4.5"/>'),
			() => this.#fitVisible()
		));

		this.#infoBtnEl = this.#toolButton('mm-info-btn', t('Info'),
			icon('<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5"/><path d="M10 6.2v.1"/>'),
			() => this.#setInfoOpen(!this.#infoOpen)
		);
		toolbar.appendChild(this.#infoBtnEl);

		this.#btnEl = this.#toolButton('mm-filter-btn', t('Filter'), icon('<path d="M2 3.5h16l-6 7.2v5l-4 2v-7z"/>'), () => {
			const open = this.#panelEl.style.display === 'none';
			this.#panelEl.style.display = open ? 'block' : 'none';
			if (open) this.#setInfoOpen(false);
		});
		toolbar.appendChild(this.#btnEl);

		this.#panelEl = document.createElement('div');
		this.#panelEl.className = `mm-filter-panel ${posClass}`;
		this.#panelEl.style.display = 'none';
		this.#panelEl.innerHTML = this.#filterPanelHtml();
		container.appendChild(this.#panelEl);
		this.#panelEl.addEventListener('click', (e) => e.stopPropagation());

		this.#wireFilterPanel(this.#panelEl);

		this.#infoEl = document.createElement('div');
		this.#infoEl.className = `mm-filter-panel mm-info-panel ${posClass}`;
		this.#infoEl.setAttribute('role', 'region');
		this.#infoEl.setAttribute('aria-label', t('Info'));
		container.appendChild(this.#infoEl);
		this.#infoEl.addEventListener('click', (e) => e.stopPropagation());

		this.#setInfoOpen(this.#infoOpen);
	}

	#toolButton(className, label, svg, onClick) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = `mm-tool-btn ${className}`;
		button.title = label;
		button.setAttribute('aria-label', label);
		button.innerHTML = svg;
		button.addEventListener('click', (e) => {
			e.stopPropagation();
			this.#closeSearchList();
			onClick();
		});
		return button;
	}

	// ── search / fit / info ───────────────────────────────────────────────────

	#buildSearchUI(toolbar, svg) {
		const listId = `mm-search-list-${this.getUniqueId()}`;

		this.#searchWrapEl = document.createElement('div');
		this.#searchWrapEl.className = 'mm-search';

		const input = document.createElement('input');
		input.type = 'search';
		input.className = 'mm-search-input';
		input.placeholder = t('Search nodes');
		input.autocomplete = 'off';
		input.spellcheck = false;
		input.value = this.#searchQuery;
		input.setAttribute('aria-label', t('Search nodes'));
		input.setAttribute('role', 'combobox');
		input.setAttribute('aria-autocomplete', 'list');
		input.setAttribute('aria-expanded', 'false');
		input.setAttribute('aria-controls', listId);

		const list = document.createElement('ul');
		list.className = 'mm-search-list';
		list.id = listId;
		list.setAttribute('role', 'listbox');
		list.setAttribute('aria-label', t('Search nodes'));
		list.style.display = 'none';

		this.#searchWrapEl.append(input, list);
		this.#searchInputEl = input;
		this.#searchListEl = list;

		toolbar.append(this.#searchWrapEl, this.#toolButton('mm-search-btn', t('Search nodes'), svg, () => {
			if (this.#searchWrapEl.classList.contains('mm-search--open')) {
				this.#clearSearch();
				this.#showSearchInput(false);
			}
			else {
				this.#showSearchInput(true);
			}
		}));

		// Rebuilt with a query: shown again, but without taking the focus.
		this.#showSearchInput(this.#searchQuery !== '', false);

		input.addEventListener('input', () => {
			this.#searchQuery = input.value;
			clearTimeout(this.#searchTimer);
			this.#searchTimer = null;

			if (input.value.trim() === '') {
				this.#clearSearch();
				return;
			}

			this.#searchTimer = setTimeout(() => this.#runSearch(), CWidgetHoloztekMonitoringMap.#SEARCH_DEBOUNCE_MS);
		});

		input.addEventListener('focus', () => {
			if (this.#searchQuery.trim() !== '') this.#runSearch();
		});

		input.addEventListener('keydown', (e) => {
			const listOpen = list.style.display !== 'none';

			switch (e.key) {
				case 'ArrowDown':
				case 'ArrowUp':
					e.preventDefault();
					if (!listOpen || this.#searchTimer !== null) {
						this.#runSearch();
						return;
					}
					if (this.#searchResults.length > 0) {
						const count = this.#searchResults.length;
						this.#searchActive = (this.#searchActive + (e.key === 'ArrowDown' ? 1 : count - 1)) % count;
						this.#markActiveResult();
					}
					return;

				case 'Enter':
					e.preventDefault();
					if (!listOpen || this.#searchTimer !== null) this.#runSearch();
					this.#selectSearchResult(this.#searchResults[Math.max(this.#searchActive, 0)]);
					return;

				case 'Escape':
					// Esc would otherwise also leave the dashboard's kiosk mode.
					e.preventDefault();
					e.stopPropagation();
					if (this.#searchQuery !== '' || this.#searchSelected !== null) {
						this.#clearSearch();
					}
					else {
						this.#showSearchInput(false);
					}
					return;
			}
		});

		// Keeps the focus in the input while a result is clicked.
		list.addEventListener('mousedown', (e) => e.preventDefault());
		list.addEventListener('click', (e) => {
			const item = e.target.closest('[data-index]');
			if (item) this.#selectSearchResult(this.#searchResults[Number(item.dataset.index)]);
		});
	}

	#showSearchInput(show, focus = show) {
		this.#searchWrapEl.classList.toggle('mm-search--open', show);
		if (focus) this.#searchInputEl.focus();
	}

	// The searchable nodes with their search text, built from the model on
	// demand and dropped on every update. Only what the graph already shows
	// is searched: labels, the OTel Service and metadata of an OTel System,
	// cluster addresses.
	#searchEntries() {
		if (this.#searchIndex !== null) return this.#searchIndex;

		const entries = [];
		const add = (id, label, meta) => {
			const text = String(label ?? '');
			const name = text.split('\n')[0];

			entries.push({
				id,
				name,
				meta,
				nameKey:  name.toLocaleLowerCase(),
				textKey:  [text, meta.otel_service, ...(meta.otel_namespaces ?? []),
					...(meta.otel_environments ?? []), ...(meta.member_ips ?? [])]
					.filter(Boolean).join('\n').toLocaleLowerCase(),
			});
		};

		for (const { id, label, meta } of this.#model.nodes.values()) add(id, label, meta);

		this.#searchIndex = entries;
		return entries;
	}

	// A result is offered only when it is shown: a click on it then reaches it.
	#searchReachable(entry) {
		const node = this.#nodesDS.get(entry.id);
		return node !== null && !node.hidden;
	}

	#runSearch() {
		clearTimeout(this.#searchTimer);
		this.#searchTimer = null;

		const query = this.#searchQuery.trim().toLocaleLowerCase();
		if (query === '' || !this.#nodesDS || !this.#searchListEl) {
			this.#closeSearchList();
			return;
		}

		const matches = [];
		for (const entry of this.#searchEntries()) {
			const rank = entry.nameKey === query ? 0
				: entry.nameKey.startsWith(query) ? 1
				: entry.nameKey.includes(query) ? 2
				: entry.textKey.includes(query) ? 3
				: -1;

			if (rank !== -1 && this.#searchReachable(entry)) matches.push({ entry, rank });
		}

		matches.sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name));

		const limit = CWidgetHoloztekMonitoringMap.#SEARCH_LIMIT;
		this.#searchResults = matches.slice(0, limit).map(({ entry }) => entry);
		this.#searchActive = this.#searchResults.length > 0 ? 0 : -1;

		const list = this.#searchListEl;
		list.innerHTML = this.#searchResults.length === 0
			? `<li class="mm-search-empty" role="presentation">${this.#escape(t('No matching nodes'))}</li>`
			: this.#searchResults.map((entry, i) =>
				`<li id="${list.id}-${i}" class="mm-search-item" role="option" data-index="${i}">`
				+ `<span class="mm-search-name">${this.#escape(entry.name)}</span>`
				+ `<span class="mm-search-type">${this.#escape(this.#typeLabel(entry.meta))}</span></li>`
			).join('')
			+ (matches.length > limit
				? `<li class="mm-search-more" role="presentation">${this.#escape(t('More results available...'))}</li>`
				: '');

		list.style.display = 'block';
		this.#searchInputEl.setAttribute('aria-expanded', 'true');
		this.#markActiveResult();
	}

	#markActiveResult() {
		const items = this.#searchListEl.querySelectorAll('.mm-search-item');
		items.forEach((item, i) => {
			const active = i === this.#searchActive;
			item.classList.toggle('mm-search-item--active', active);
			item.setAttribute('aria-selected', String(active));
			if (active) item.scrollIntoView({ block: 'nearest' });
		});

		if (this.#searchActive >= 0) {
			this.#searchInputEl.setAttribute('aria-activedescendant', `${this.#searchListEl.id}-${this.#searchActive}`);
		}
		else {
			this.#searchInputEl.removeAttribute('aria-activedescendant');
		}
	}

	#closeSearchList() {
		if (!this.#searchListEl || this.#searchListEl.style.display === 'none') return;

		this.#searchListEl.style.display = 'none';
		this.#searchInputEl.setAttribute('aria-expanded', 'false');
		this.#searchInputEl.removeAttribute('aria-activedescendant');
	}

	#selectSearchResult(entry) {
		if (!entry || !this.#network) return;

		this.#closeSearchList();

		if (!this.#searchReachable(entry)) return;

		this.#searchSelected = entry.id;
		this.#paintSearchHighlight();
		this.#focusNode(entry.id);
	}

	#clearSearch() {
		clearTimeout(this.#searchTimer);
		this.#searchTimer = null;

		this.#searchQuery = '';
		if (this.#searchInputEl) this.#searchInputEl.value = '';
		this.#searchSelected = null;

		this.#closeSearchList();
		this.#paintSearchHighlight();
	}

	// Marks #searchSelected, and unmarks what was marked before. Only a node
	// gone from the data ends the selection: one hidden by a filter keeps it,
	// and is marked again once shown.
	#paintSearchHighlight() {
		if (!this.#nodesDS) return;

		const selected = this.#searchSelected;
		if (selected !== null && !this.#model.nodes.has(selected)) {
			this.#searchSelected = null;
		}

		const updates = [];
		const restyle = (id) => {
			const meta = this.#nodesMeta[id];
			if (meta && this.#nodesDS.get(id) !== null) updates.push({ id, ...this.#nodeStyle(id, meta) });
		};

		if (this.#searchPainted !== null && this.#searchPainted !== this.#searchSelected) {
			restyle(this.#searchPainted);
		}

		const node = this.#searchSelected !== null ? this.#nodesDS.get(this.#searchSelected) : null;
		if (node !== null && !node.shapeProperties?.useBorderWithImage) restyle(this.#searchSelected);

		this.#searchPainted = node !== null ? this.#searchSelected : null;

		if (updates.length > 0) this.#nodesDS.update(updates);
	}

	// After every update: what can be found, and what is marked, may differ.
	#refreshSearch() {
		this.#searchIndex = null;
		this.#paintSearchHighlight();

		if (this.#searchListEl && this.#searchListEl.style.display !== 'none') this.#runSearch();
		if (this.#infoOpen) this.#renderInfo();
	}

	// Centers the node, zooming in only as far as needed to make it readable.
	// While a layout runs the node still moves: centered again once it is done,
	// unless the user has moved the view in between.
	#focusNode(id) {
		if (this.#layoutPhase !== 'idle') this.#pendingFocus = id;
		if (this.#layoutPhase === 'initial') return;

		const position = this.#network.getPositions([id])[id];
		if (!position) return;

		this.#userInteracted = true;
		this.#network.moveTo({
			position,
			scale: Math.max(this.#network.getScale(), CWidgetHoloztekMonitoringMap.#FOCUS_MIN_SCALE),
			animation: { duration: 300, easingFunction: 'easeInOutQuad' },
		});
	}

	// Explicit, unlike #fitIfNothingInView(): the nodes the filters left shown.
	// The first layout fits by itself once it is done.
	#fitVisible() {
		if (!this.#network || this.#layoutPhase === 'initial') return;

		const ids = this.#nodesDS.get({ filter: node => !node.hidden, fields: ['id'] }).map(({ id }) => id);
		if (ids.length === 0) return;

		this.#userInteracted = true;
		this.#network.fit({ nodes: ids, animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
	}

	#setInfoOpen(open) {
		this.#infoOpen = open;
		if (!this.#infoEl) return;

		if (open) {
			this.#renderInfo();
			this.#panelEl.style.display = 'none';
		}

		this.#infoEl.style.display = open ? 'block' : 'none';
		this.#infoBtnEl.setAttribute('aria-expanded', String(open));
	}

	// Counts are what the server sent (the model), not what the filters leave
	// shown; the legend is what the current graph has, not every type there is.
	#renderInfo() {
		const value = (label, text) => `<div class="mm-info-row"><span>${this.#escape(label)}</span>`
			+ `<span class="mm-info-value">${this.#escape(String(text))}</span></div>`;
		const section = (title, body) => `<div class="mm-info-section">`
			+ `<div class="mm-info-title">${this.#escape(title)}</div>${body}</div>`;
		const status = this.#status ?? {};

		const topology = value(t('Nodes'), this.#model.nodes.size)
			+ value(t('Relations'), this.#model.edges.size)
			+ value(t('Database topology'), status.database ? t('Enabled') : t('Disabled'));

		this.#infoEl.innerHTML = `
			<div class="mm-filter-header"><span>${this.#escape(t('Info'))}</span></div>
			${section(t('Topology'), topology)}
			${section(t('APM / OpenTelemetry'), this.#apmInfoRows(status.apm ?? {}, value))}
			${section(t('Legend'), this.#legendRows())}
		`;
	}

	// WidgetView::otelRetrievalState(): only what the retrieval itself tells.
	#apmInfoRows(apm, value) {
		if (apm.state === 'off' || apm.state === undefined) {
			return value(t('Status'), t('Disabled'));
		}
		if (apm.state === 'unsupported') {
			return value(t('Status'), t('Disabled'))
				+ `<div class="mm-info-note">${this.#escape(t('Requires Zabbix 8.0 or later'))}</div>`;
		}

		const states = {
			ok:            'OK',
			no_data:       'No data available',
			no_spans:      'No spans fetched',
			display_limit: 'Display limit reached',
			query_limit:   'Query limit reached',
			failed:        'Retrieval failed',
		};

		return value(t('Observation window'), `${apm.window} ${t('min')}`)
			+ value(t('Spans fetched'), Number(apm.spans).toLocaleString())
			+ value(t('Queries'), `${apm.queries} / ${apm.max_queries}`)
			+ value(t('Services'), apm.services)
			+ value(t('Systems'), apm.systems)
			+ value(t('Retrieval status'), t(states[apm.state] ?? 'No data available'));
	}

	#legendRows() {
		const nodeTypes = new Set();
		for (const meta of Object.values(this.#nodesMeta)) {
			nodeTypes.add(meta.node_type);

			if (meta.node_type === 'cluster' || meta.node_type === 'datacenter'
					|| (meta.node_type === 'host' && /^(virtual|vcenter|esxi|vm|k8s_)/.test(meta.device_type))) {
				nodeTypes.add('virtual');
			}
		}

		const relations = new Set(this.#edgesDS.get().map(edge => edge.relation));

		const typeIcon = CWidgetHoloztekMonitoringMap.#TYPE_ICON;
		const deviceIcon = CWidgetHoloztekMonitoringMap.#DEVICE_ICON;
		const icons = {
			server:  typeIcon.zbxserver,
			network: deviceIcon.subnet,
			virtual: typeIcon.cluster,
			host:    deviceIcon.server,
		};

		const relationRows = Object.keys(CWidgetHoloztekMonitoringMap.#RELATION_KEYS)
			.filter(relation => relations.has(relation))
			.map(relation => `<div class="mm-legend-row">${this.#relationSample(relation)}`
				+ `<span>${this.#escape(t(CWidgetHoloztekMonitoringMap.#RELATION_LABEL[relation]))}</span></div>`)
			.join('');

		const nodeRows = CWidgetHoloztekMonitoringMap.#LEGEND_NODE_ROWS
			.filter(([type]) => nodeTypes.has(type))
			.map(([type, label]) => `<div class="mm-legend-row">`
				+ `<img class="mm-legend-icon" src="${icons[type] ?? typeIcon[type]}" alt="">`
				+ `<span>${this.#escape(t(label))}</span></div>`)
			.join('');

		return `
			${relationRows !== '' ? `<div class="mm-legend-section">
				<div class="mm-legend-title">${this.#escape(t('Relations'))}</div>${relationRows}</div>` : ''}
			${nodeRows !== '' ? `<div class="mm-legend-section">
				<div class="mm-legend-title">${this.#escape(t('Node types'))}</div>${nodeRows}</div>` : ''}
		`;
	}

	// Drawn in the text color: the pattern, not the edge color, tells relations apart.
	#relationSample(relation) {
		const pattern = CWidgetHoloztekMonitoringMap.#RELATION_DASHES[relation];

		return '<svg class="mm-line-sample" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 8" width="32" height="8"'
			+ ' aria-hidden="true" focusable="false"><line x1="0" y1="4" x2="32" y2="4" stroke="currentColor" stroke-width="2"'
			+ (pattern ? ` stroke-dasharray="${pattern.join(' ')}"` : '') + '/></svg>';
	}

	#typeLabel(meta) {
		return t(CWidgetHoloztekMonitoringMap.#NODE_TYPE_LABEL[meta.node_type] || meta.node_type);
	}

	// ── tooltip ───────────────────────────────────────────────────────────────

	#showTooltip(label, meta) {
		let box = document.getElementById('mm-vis-tooltip');
		if (!box) {
			box = document.createElement('div');
			box.id = 'mm-vis-tooltip';
			box.style.cssText = 'position:fixed;background:#1d2228;color:#fff;padding:6px 10px;border-radius:4px;font-size:12px;pointer-events:none;z-index:99999;line-height:1.5;box-shadow:0 2px 8px rgba(0,0,0,.4)';
			document.body.appendChild(box);
		}

		const typeLabel = t(CWidgetHoloztekMonitoringMap.#NODE_TYPE_LABEL[meta.node_type] || meta.node_type);
		const isBackend = CWidgetHoloztekMonitoringMap.#BACKEND_NODE_TYPES.has(meta.node_type);
		// A backend label's second line is its type, shown as its own row below.
		const title = isBackend ? String(label).split('\n')[0] : label;
		let html = `<strong>${this.#escape(title)}</strong>`;
		if (title !== typeLabel && meta.node_type !== 'otel_service' && meta.node_type !== 'otel_system') {
			html += `<br><span style="opacity:.7">${typeLabel}</span>`;
		}

		if (meta.severity_label) {
			html += `<br><span style="opacity:.7">${t('Severity')}: ${this.#escape(meta.severity_label)}</span>`;
		}

		if (meta.node_type === 'proxy' && meta.proxy_unresponsive) {
			html += `<br><span style="opacity:.7">${t('Status')}: ${t('Not responding')}</span>`;
		}

		if (meta.node_type === 'host' && meta.comm_methods && meta.comm_methods.length > 0) {
			const names = meta.comm_methods.map(m => CWidgetHoloztekMonitoringMap.#COMM_METHOD_LABEL[m] || m).join(', ');
			html += `<br><span style="opacity:.7">${t('Communication method')}: ${this.#escape(names)}</span>`;
		}

		if (meta.node_type === 'cluster' && meta.member_ips && meta.member_ips.length > 0) {
			html += `<br><span style="opacity:.7">${t('Known addresses')}: ${this.#escape(meta.member_ips.join(', '))}</span>`;
		}

		if (meta.node_type === 'proxy' && meta.apm_collector) {
			html += `<br><span style="opacity:.7">${t('APM Collector')}: ${t('Enabled')}</span>`;
			if (meta.otel_system_count > 0) {
				html += `<br><span style="opacity:.7">${t('Observed telemetry systems')}: ${meta.otel_system_count}</span>`;
			}
		}

		if (isBackend) {
			html += this.#backendTooltipRows(meta);
		}

		box.innerHTML = html;
		box.style.display = 'block';

		const updatePos = (e) => {
			box.style.left = (e.clientX + 12) + 'px';
			box.style.top  = (e.clientY - 6)  + 'px';
		};
		document.addEventListener('mousemove', updatePos);
		box._cleanup = () => document.removeEventListener('mousemove', updatePos);
	}

	#backendTooltipRows(meta) {
		const row = (text) => `<br><span style="opacity:.7">${text}</span>`;
		let html = '';

		if (meta.db_type) {
			html += row(`${t('Type')}: ${this.#escape(meta.db_type)}`);
		}

		if (meta.db_source) {
			const source = meta.db_source === 'server_runtime' ? 'Server runtime' : 'Frontend configuration';
			html += row(`${t('Source')}: ${t(source)}`);
		}

		if (meta.node_type === 'apm_datastore') {
			if (meta.db_type) {
				html += row(`${t('Source')}: ${t('Global APM Data Source')}`);
			}
			if (meta.apm_db) {
				html += row(`${t('Database')}: ${this.#escape(meta.apm_db)}`);
			}
			if (meta.otel_truncated) {
				html += row(t('Too many APM systems to display.'));
			}
		}

		if (meta.node_type === 'otel_service') {
			html += row(`${t('Type')}: ${t('OpenTelemetry service')}`);
			html += row(`${t('Service')}: ${this.#escape(meta.otel_service)}`);
			if (meta.otel_system_count > 0) {
				html += row(`${t('Systems')}: ${meta.otel_system_count}`);
			}
		}

		if (meta.node_type === 'otel_system') {
			html += row(`${t('Type')}: ${t('OpenTelemetry system')}`);
			html += row(`${t('Host')}: ${this.#escape(meta.otel_host)}`);
			html += row(`${t('Service')}: ${this.#escape(meta.otel_service)}`);
		}

		// The latest span this widget fetched, not when anybody last used it.
		if (meta.otel_last_observed) {
			html += row(`${t('Last observed')}: ${this.#escape(meta.otel_last_observed)}`);
		}

		if (meta.node_type === 'otel_service' || meta.node_type === 'otel_system') {
			if (meta.otel_namespaces.length > 0) {
				html += row(`${t('Namespace')}: ${this.#escape(meta.otel_namespaces.join(', '))}`);
			}
			if (meta.otel_environments.length > 0) {
				html += row(`${t('Environment')}: ${this.#escape(meta.otel_environments.join(', '))}`);
			}
		}

		if (meta.node_type === 'proxy_db') {
			html += row(t('Database details are not available from the Zabbix API.'));
		}

		return html;
	}

	#hideTooltip() {
		const box = document.getElementById('mm-vis-tooltip');
		if (box) {
			box.style.display = 'none';
			if (box._cleanup) { box._cleanup(); box._cleanup = null; }
		}
	}

	#escape(str) {
		return String(str).replace(/[&<>"']/g, (c) => ({
			'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
		}[c]));
	}
}
