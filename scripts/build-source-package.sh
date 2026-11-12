#!/bin/sh
# 手動インストール用の HOLOZTEK 公式 Source パッケージ（tar.gz / zip）を作成する。
# usage: scripts/build-source-package.sh <tag> <vis-network.min.js> [出力先ディレクトリ]
#
# vis-network.min.js は .gitignore 対象のため、タグから自動生成される Source
# アーカイブには含まれない。ここでは RPM/DEB と同じファイル一式（spec の
# %install と同じ実行時ファイル）にベンダー JS を加え、docs/ を同梱する。
set -e

TAG=$1
VIS=$2
OUT=${3:-.}

if [ -z "${TAG}" ] || [ ! -f "${VIS}" ]; then
    echo "usage: $0 <tag> <vis-network.min.js> [outdir]" >&2
    exit 1
fi

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
OUT=$(CDPATH= cd -- "${OUT}" && pwd)
NAME=zabbix-widget-monitoring-topology-${TAG#v}
WORK=$(mktemp -d)
trap 'rm -rf "${WORK}"' EXIT

git -C "${ROOT}" archive --prefix="${NAME}/" "${TAG}" \
    LICENSE README.md manifest.json Module.php Widget.php \
    actions assets includes locale views docs | tar -x -C "${WORK}"
install -m 644 "${VIS}" "${WORK}/${NAME}/assets/js/vis-network.min.js"

# 実行時ファイルの欠落を検出する（manifest.json の assets.js を含む）。
for f in manifest.json Module.php Widget.php actions/WidgetView.php \
    assets/css/widget.css assets/js/class.widget.js assets/js/vis-network.min.js \
    includes/CWidgetFieldOtelWindow.php includes/WidgetForm.php includes/helpers.php \
    views/widget.edit.js.php views/widget.edit.php views/widget.view.php; do
    if [ ! -f "${WORK}/${NAME}/${f}" ]; then
        echo "Error: missing ${f}" >&2
        exit 1
    fi
done

cd "${WORK}"
tar --owner=0 --group=0 --numeric-owner --sort=name -czf "${OUT}/${NAME}.tar.gz" "${NAME}"
python3 -I -c '
import os, sys, zipfile
name, dest = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(name):
        dirs.sort()
        for f in sorted(files):
            z.write(os.path.join(root, f))
' "${NAME}" "${OUT}/${NAME}.zip"

cd "${OUT}"
sha256sum "${NAME}.tar.gz" "${NAME}.zip"
