import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BasicSection } from "./BasicSection";
import { HolidaySection } from "./HolidaySection";
import { DesignSection } from "./DesignSection";
import { ImageSection } from "./ImageSection";
import { SettingsActions } from "./SettingsActions";

export function Sidebar({ mobile }: { mobile?: boolean }) {
  const containerClass = mobile
    ? "flex flex-col"
    : "flex h-full w-80 shrink-0 flex-col overflow-y-auto bg-surface-container-low p-6";

  return (
    <aside className={containerClass}>
      {!mobile && (
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          設定
        </p>
      )}

      <Accordion multiple defaultValue={["basic"]} className="space-y-2">
        <AccordionItem value="basic" className="border-none">
          <AccordionTrigger className="rounded-lg px-3 py-2.5 text-lg font-bold text-on-surface hover:bg-surface-container-high hover:no-underline">
            基本設定
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-2">
            <BasicSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="holidays" className="border-none">
          <AccordionTrigger className="rounded-lg px-3 py-2.5 text-lg font-bold text-on-surface hover:bg-surface-container-high hover:no-underline">
            祝日
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-2">
            <HolidaySection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="design" className="border-none">
          <AccordionTrigger className="rounded-lg px-3 py-2.5 text-lg font-bold text-on-surface hover:bg-surface-container-high hover:no-underline">
            デザイン
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-2">
            <DesignSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="images" className="border-none">
          <AccordionTrigger className="rounded-lg px-3 py-2.5 text-lg font-bold text-on-surface hover:bg-surface-container-high hover:no-underline">
            画像
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-2">
            <ImageSection />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4">
        <SettingsActions />
      </div>
    </aside>
  );
}
