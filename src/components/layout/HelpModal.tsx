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
      <DialogContent className="glass-panel flex max-h-[85vh] max-w-xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">ヘルプ</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto text-sm text-on-surface">
          <p className="mb-3 text-on-surface-variant">
            設定 → プレビュー確認 → PDF出力 → 印刷が基本の流れです。
            まずはPDFで保存し、それを印刷してお使いください。
          </p>

          {hasDarkBackground && (
            <section className="mb-3 rounded-lg bg-surface-container-high p-3">
              <p className="font-semibold text-sunday">⚠ 背景色ありテーマを使用中</p>
              <p className="mt-1 text-on-surface-variant">
                印刷設定で「背景のグラフィック」にチェックを入れてください。
                チェックがないと背景色が印刷されません。
              </p>
            </section>
          )}

          <Accordion>
            <AccordionItem value="formats">
              <AccordionTrigger>出力形式の使い分け</AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="auto-save">
              <AccordionTrigger>自動保存について</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-on-surface-variant">
                  <p>
                    編集内容は自動的にブラウザに一時保存されます。設定を変更すると、約1.5秒後に自動保存されます。
                    ヘッダーに「自動保存済み」と表示されていれば、保存されています。
                  </p>
                  <p>
                    次回アクセス時に前回の編集データがある場合、復元するか破棄するかを選べます。
                  </p>
                  <p className="font-semibold text-on-surface">保存方法の使い分け</p>
                  <dl className="space-y-1">
                    <div>
                      <dt className="font-semibold text-on-surface">自動保存（ブラウザ内）</dt>
                      <dd>編集中の手軽な退避。同じ端末・同じブラウザでの作業継続向けです。</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-on-surface">HTML出力</dt>
                      <dd>
                        ファイルとして残す・来年も同じデザインを流用する・他端末に持ち運ぶ場合に使います。
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-on-surface">PDF出力</dt>
                      <dd>印刷して使うための最終出力です。</dd>
                    </div>
                  </dl>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pdf">
              <AccordionTrigger>ブラウザからPDF化する</AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="conveni">
              <AccordionTrigger>コンビニで印刷する</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-on-surface-variant">
                    この案内は、このアプリで保存したPDFを各コンビニの「ネットワークプリント」で印刷する手順です。
                    まずPDFを保存してから、各社のサービスに登録して印刷します。
                  </p>
                  <section className="space-y-2 border-l-2 border-on-surface-variant/20 pl-3">
                    <h4 className="font-semibold text-on-surface">セブン‐イレブン</h4>
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
                      <p className="text-xs">
                        ※ 光沢紙はネットプリントでは選択できません（普通紙のみ）
                      </p>
                      <p>
                        <a
                          href="https://www.printing.ne.jp/support/lite/pricelist_lite.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          サービス公式（料金・使い方）
                        </a>
                      </p>
                    </div>
                  </section>

                  <section className="space-y-2 border-l-2 border-on-surface-variant/20 pl-3">
                    <h4 className="font-semibold text-on-surface">ローソン</h4>
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
                          サービス公式（料金・使い方）
                        </a>
                      </p>
                    </div>
                  </section>

                  <section className="space-y-2 border-l-2 border-on-surface-variant/20 pl-3">
                    <h4 className="font-semibold text-on-surface">ファミリーマート</h4>
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
                          サービス公式（料金・使い方）
                        </a>
                      </p>
                    </div>
                  </section>

                  <section className="rounded-lg bg-surface-container-high p-3">
                    <p className="font-semibold text-on-surface">
                      写真入りカレンダーなら光沢紙・カラー印刷がおすすめ
                    </p>
                    <p className="mt-1 text-on-surface-variant">
                      写真を入れたカレンダーは、光沢紙にカラー印刷するときれいに仕上がります。
                      ローソン・ファミマの光沢紙カラー（A4
                      120円/枚）なら、12ヶ月分で約1,440円が目安です。
                    </p>
                  </section>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-on-surface">補足</p>
                    <p className="text-xs text-on-surface-variant">
                      USBメモリを持ち込めばさらに安く印刷できます（A4普通紙 白黒 10円 / カラー
                      50円が目安）。
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      ※
                      料金や画面は変更されることがあります。最新情報は各社の公式案内を確認してください。（2026年3月時点の情報）
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
