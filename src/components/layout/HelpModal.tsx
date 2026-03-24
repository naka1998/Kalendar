import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
      <DialogContent className="glass-panel max-h-[85vh] max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">ヘルプ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto text-sm text-on-surface">
          <section>
            <h3 className="mb-2 font-semibold">基本の使い方</h3>
            <p className="text-on-surface-variant">
              設定 → プレビュー確認 → PDF出力 → 印刷が基本の流れです。
              まずはPDFで保存し、それを印刷してお使いください。
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">出力形式の使い分け</h3>
            <dl className="space-y-2 text-on-surface-variant">
              <div>
                <dt className="font-semibold text-on-surface">PDF</dt>
                <dd>
                  印刷して使うための基本の出力形式です。
                  ブラウザの印刷ダイアログからPDFに保存できます。
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-on-surface">HTML</dt>
                <dd>
                  設定や画像を含んだ再利用用の保存形式です。
                  あとで開き直して再編集したいときや、今年のデザインを来年もベースとして使いたいときに向いています。
                  気に入ったカレンダーをHTML出力しておけば、セーブポイントとしても使えます。
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-on-surface">ZIP</dt>
                <dd>
                  配布・保管向けの出力形式です。
                  アプリに直接読み込むことはできません。読み込み可能なのはHTMLファイルです。
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">一時保存について</h3>
            <p className="text-on-surface-variant">
              編集中にこまめに退避したい場合は、ヘッダーの「一時保存」ボタンが手軽です。
              ブラウザに状態を保存するため、ファイルは作成されません。
            </p>
            <p className="mt-1 text-on-surface-variant">
              HTML出力との違い:
              一時保存は編集中の手軽な退避向け、HTML出力はファイルとして残す・持ち運ぶ・来年も再利用する場合に使います。
            </p>
          </section>

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
            <p className="mb-2 text-on-surface-variant">
              この案内は、このアプリで保存したPDFを各コンビニの「ネットワークプリント」で印刷する手順です。
              まずPDFを保存してから、各社のサービスに登録して印刷します。
            </p>
            <Accordion>
              <AccordionItem value="seven">
                <AccordionTrigger>セブン‐イレブン</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-on-surface-variant">
                    <p>
                      「かんたんnetprint」または「netprint」にPDFを登録します。
                      すぐ印刷するなら「かんたんnetprint」（登録不要・有効期限
                      翌日）、後で印刷するなら「netprint」（要登録・有効期限30日）が便利です。
                    </p>
                    <p>
                      店頭ではマルチコピー機で「プリント」→「ネットプリント」を選び、予約番号の入力またはQRコードの読み取りで印刷します。
                    </p>
                    <p className="font-semibold text-on-surface">
                      A4料金目安（普通紙）: 白黒 20円 / カラー 60円
                    </p>
                    <p>
                      <a
                        href="https://www.printing.ne.jp/support/lite/pricelist_lite.html"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        公式案内（料金・使い方）
                      </a>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="lawson">
                <AccordionTrigger>ローソン</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-on-surface-variant">
                    <p>ネットワークプリントにPDFを登録します（会員登録なしでも利用可能）。</p>
                    <p>
                      店頭ではマルチコピー機で「ネットワークプリント」を選び、ユーザー番号または2次元コードでログインして印刷します。
                    </p>
                    <p className="font-semibold text-on-surface">
                      A4料金目安: 普通紙 白黒 20円 / カラー 60円、光沢紙 白黒 80円 / カラー
                      120円（おすすめ）
                    </p>
                    <p>
                      <a
                        href="https://networkprint.ne.jp/info/price/price_l.html"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        公式案内（料金・使い方）
                      </a>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="familymart">
                <AccordionTrigger>ファミリーマート</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-on-surface-variant">
                    <p>
                      ファミマネットワークプリントにPDFを登録します（会員登録不要）。
                      登録後に表示されるユーザー番号または2次元コードは必ず控えてください（ブラウザを閉じると再表示できません）。
                    </p>
                    <p>
                      店頭ではマルチコピー機で「ネットワークプリント」を選び、ユーザー番号または2次元コードでログインして印刷します。
                    </p>
                    <p className="font-semibold text-on-surface">
                      A4料金目安: 普通紙 白黒 20円 / カラー 60円、光沢紙 白黒 80円 / カラー
                      120円（おすすめ）
                    </p>
                    <p>
                      <a
                        href="https://networkprint.family.co.jp/info/price/price_f.html"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        公式案内（料金・使い方）
                      </a>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <p className="mt-2 text-xs text-on-surface-variant">
              USBメモリを持ち込めばさらに安く印刷できます（A4普通紙 白黒 10円 / カラー
              50円が目安）。
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              ※
              料金や画面は変更されることがあります。最新情報は各社の公式案内を確認してください。（2026年3月時点の情報）
            </p>
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
