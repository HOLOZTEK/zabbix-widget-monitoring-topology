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

	onInitialize() {
		this._dom_id_suffix = '';
		document.addEventListener('click', (e) => {
			if (this.#panelEl && this.#panelEl.style.display !== 'none'
					&& !this.#panelEl.contains(e.target) && e.target !== this.#btnEl) {
				this.#panelEl.style.display = 'none';
			}
		});
	}

	hasPadding() {
		return false;
	}

	getUpdateRequestData() {
		const data = super.getUpdateRequestData();
		data.widget_unique_id = this.getUniqueId();
		return data;
	}

	setContents(response) {
		super.setContents(response);

		if (response.dom_id_suffix !== undefined) this._dom_id_suffix = response.dom_id_suffix;

		this.#initGraph();
	}

	onClearContents() {
		if (this.#network !== null) {
			this.#network.destroy();
			this.#network = null;
			this.#nodesDS = null;
			this.#edgesDS = null;
		}
		this.#children = {};
		this.#highlightedProxy = null;
		this.#panelEl = null;
		this.#btnEl = null;
	}

	// ── graph ─────────────────────────────────────────────────────────────────

	#initGraph() {
		const container = this._body.querySelector('.js-mm-container');
		if (!container) return;

		if (this.#network !== null) {
			this.#network.destroy();
			this.#network = null;
			this.#nodesDS = null;
			this.#edgesDS = null;
		}

		this.#children = {};
		this.#highlightedProxy = null;

		let elements;
		try {
			elements = JSON.parse(container.dataset.elements || '[]');
		} catch (_) {
			elements = [];
		}

		if (elements.length === 0) return;

		this.#s = {
			fontSize:       parseInt(container.dataset.nodeFontSize  || '12', 10),
			fontWeight:     parseInt(container.dataset.nodeFontStyle || '0', 10) === 1 ? 'bold'   : 'normal',
			fontStyle:      parseInt(container.dataset.nodeFontStyle || '0', 10) === 2 ? 'italic' : 'normal',
			fontColor:      container.dataset.nodeFontColor || this.#detectThemeFontColor(container),
			edgeWidth:      parseFloat(container.dataset.edgeWidth || '1'),
			edgeColor:      container.dataset.edgeColor     || '#aac4d8',
			filterPosition: parseInt(container.dataset.filterPosition || '1', 10),
			severityColors: this.#parseJson(container.dataset.severityColors, {}),
			severityLabels: this.#parseJson(container.dataset.severityLabels, {}),
		};

		this.#loadFilterState();

		const visNodes = [];
		const visEdges = [];
		this.#nodesMeta = {};
		this.#iconCache = {};

		elements.forEach(el => {
			if (el.data.source) {
				(this.#children[el.data.source] ??= []).push(el.data.target);
				visEdges.push({
					id:    el.data.source + '__' + el.data.target,
					from:  el.data.source,
					to:    el.data.target,
					// vis-network defaults edges.color.inherit to 'from', which makes
					// an edge take its connected node's color instead of this
					// explicit one unless disabled here.
					color: { color: this.#s.edgeColor, highlight: this.#s.edgeColor, inherit: false },
					width: this.#s.edgeWidth,
					smooth: { type: 'continuous' },
				});
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
			this.#nodesMeta[el.data.id] = meta;

			visNodes.push({
				id:    el.data.id,
				label: el.data.label,
				shape: 'image',
				image: this.#buildIcon(meta),
				color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' },
				font: {
					color: this.#s.fontColor,
					size:  this.#s.fontSize,
					bold:  this.#s.fontWeight === 'bold' ? { size: this.#s.fontSize, vadjust: 0 } : false,
					ital:  this.#s.fontStyle === 'italic',
				},
			});
		});

		this.#nodesDS = new vis.DataSet(visNodes);
		this.#edgesDS = new vis.DataSet(visEdges);

		this.#network = new vis.Network(container, {
			nodes: this.#nodesDS,
			edges: this.#edgesDS,
		}, {
			physics: {
				solver: 'barnesHut',
				barnesHut: {
					gravitationalConstant: -8000,
					centralGravity:        0.3,
					springLength:          130,
					springConstant:        0.04,
					damping:               0.09,
				},
				stabilization: { iterations: 150, fit: true },
			},
			interaction: {
				hover:        true,
				tooltipDelay: 200,
				hideEdgesOnDrag: true,
			},
			layout: { improvedLayout: true },
		});

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

		this.#buildFilterUI(container);
		this.#applyVisibility();
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

		const highlighted = new Set();
		const stack = [proxyId];
		while (stack.length > 0) {
			const id = stack.pop();
			for (const child of this.#children[id] || []) {
				highlighted.add(id + '__' + child);
				stack.push(child);
			}
		}

		const baseWidth = this.#s.edgeWidth;
		const highlightWidth = baseWidth * 3 + 2;

		this.#edgesDS.update(this.#edgesDS.get().map(edge => ({
			id:    edge.id,
			width: highlighted.has(edge.id) ? highlightWidth : baseWidth,
		})));

		this.#highlightedProxy = proxyId;
	}

	#resetEdgeHighlight() {
		if (!this.#edgesDS || this.#highlightedProxy === null) return;

		const baseWidth = this.#s.edgeWidth;
		this.#edgesDS.update(this.#edgesDS.get().map(edge => ({ id: edge.id, width: baseWidth })));
		this.#highlightedProxy = null;
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
				? Object.assign(defaults, this.#migrateFilterState(stored))
				: defaults;
		} catch (_) {
			this.#filter = defaults;
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
			localStorage.setItem(this.#filterStorageKey(), JSON.stringify(this.#filter));
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

	// A non-host node (Server/Proxy/Proxy Group/Network/Cluster) is visible iff at
	// least one descendant host remains visible - every such node is only
	// ever created because of an actual host in the current selection (see
	// WidgetView::doAction()), so this cascade never spuriously hides an
	// ancestor with no host descendants at all; it only fires because of
	// these filters. Edges follow their endpoints.
	#applyVisibility() {
		if (!this.#nodesDS || !this.#edgesDS) return;

		const visible = {};
		const computeVisible = (id) => {
			if (id in visible) return visible[id];
			const meta = this.#nodesMeta[id];
			let result;
			if (!meta) {
				result = false;
			}
			else if (meta.node_type === 'host') {
				result = this.#hostVisible(meta);
			}
			else {
				result = (this.#children[id] || []).some(childId => computeVisible(childId));
			}
			visible[id] = result;
			return result;
		};

		const nodeUpdates = Object.keys(this.#nodesMeta).map(id => ({ id, hidden: !computeVisible(id) }));
		this.#nodesDS.update(nodeUpdates);

		const edgeUpdates = this.#edgesDS.get().map(edge => ({
			id:     edge.id,
			hidden: !(visible[edge.from] && visible[edge.to]),
		}));
		this.#edgesDS.update(edgeUpdates);

		this.#toggleEmptyOverlay(!Object.values(visible).some(v => v));
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
			this.#filter = { ...CWidgetHoloztekMonitoringMap.#DEFAULT_FILTER };
			this.#saveFilterState();
			panel.querySelectorAll('input[type=checkbox][data-filter]').forEach(input => {
				input.checked = !!this.#filter[input.dataset.filter];
			});
			this.#refreshSeverities();
			this.#applyVisibility();
		});
	}

	#buildFilterUI(container) {
		const posClass = CWidgetHoloztekMonitoringMap.#FILTER_POSITION_CLASS[this.#s.filterPosition]
			|| CWidgetHoloztekMonitoringMap.#FILTER_POSITION_CLASS[1];

		this.#btnEl = document.createElement('button');
		this.#btnEl.type = 'button';
		this.#btnEl.className = `mm-filter-btn ${posClass}`;
		this.#btnEl.title = t('Filter');
		this.#btnEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="16" height="16">'
			+ '<path d="M2 3.5h16l-6 7.2v5l-4 2v-7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
		container.appendChild(this.#btnEl);

		this.#panelEl = document.createElement('div');
		this.#panelEl.className = `mm-filter-panel ${posClass}`;
		this.#panelEl.style.display = 'none';
		this.#panelEl.innerHTML = this.#filterPanelHtml();
		container.appendChild(this.#panelEl);

		this.#btnEl.addEventListener('click', (e) => {
			e.stopPropagation();
			this.#panelEl.style.display = this.#panelEl.style.display === 'none' ? 'block' : 'none';
		});
		this.#panelEl.addEventListener('click', (e) => e.stopPropagation());

		this.#wireFilterPanel(this.#panelEl);
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
		let html = `<strong>${this.#escape(label)}</strong><br><span style="opacity:.7">${typeLabel}</span>`;

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

		box.innerHTML = html;
		box.style.display = 'block';

		const updatePos = (e) => {
			box.style.left = (e.clientX + 12) + 'px';
			box.style.top  = (e.clientY - 6)  + 'px';
		};
		document.addEventListener('mousemove', updatePos);
		box._cleanup = () => document.removeEventListener('mousemove', updatePos);
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
