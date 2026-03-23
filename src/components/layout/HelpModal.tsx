import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCalendarStore } from "@/stores/calendarStore";
import { THEMES } from "@/lib/themes";

export function HelpModal() {
  const themeId = useCalendarStore((s) => s.themeId);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const hasDarkBackground = theme.colors.background !== "#FFFFFF";

  return (
    <Dialog>
      <DialogTrigger
        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
        aria-label="Help"
      >
        ?
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">印刷手順ガイド</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-on-surface">
          <section>
            <h3 className="mb-2 font-semibold">ブラウザからPDF化する</h3>
            <ol className="list-inside list-decimal space-y-1 text-on-surface-variant">
              <li>ダウンロードしたHTMLファイルをChromeで開く</li>
              <li>
                <kbd className="rounded bg-surface-container-high px-1 py-0.5 text-xs">
                  Ctrl + P
                </kbd>
                で印刷ダイアログを開く
              </li>
              <li>送信先を「PDFに保存」に設定</li>
              <li>用紙サイズ: A4</li>
              <li>余白: なし</li>
              <li>「保存」をクリック</li>
            </ol>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">コンビニで印刷する</h3>
            <ol className="list-inside list-decimal space-y-1 text-on-surface-variant">
              <li>上記の手順でPDFファイルを保存する</li>
              <li>PDFをUSBメモリに保存、またはネットプリントに登録する</li>
              <li>コンビニのマルチコピー機でA4カラー印刷を選択</li>
              <li>両面印刷は不要（片面で印刷）</li>
            </ol>
          </section>

          {hasDarkBackground && (
            <section className="rounded-lg bg-surface-container-high p-3">
              <p className="font-semibold text-sunday">⚠ 背景色ありテーマを使用中</p>
              <p className="mt-1 text-on-surface-variant">
                印刷設定で「背景のグラフィック」にチェックを入れてください。
                チェックがないと背景色が印刷されません。
              </p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
