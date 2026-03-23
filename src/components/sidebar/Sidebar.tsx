import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BasicSection } from "./BasicSection";
import { HolidaySection } from "./HolidaySection";
import { DesignSection } from "./DesignSection";
import { SettingsActions } from "./SettingsActions";

export function Sidebar() {
  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto bg-surface-container-low p-6">
      <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
        設定
      </p>

      <Accordion defaultValue={["basic"]} className="space-y-2">
        <AccordionItem value="basic" className="border-none">
          <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high hover:no-underline">
            基本設定
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-2">
            <BasicSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="holidays" className="border-none">
          <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high hover:no-underline">
            祝日
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-2">
            <HolidaySection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="design" className="border-none">
          <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high hover:no-underline">
            デザイン
          </AccordionTrigger>
          <AccordionContent className="px-3 pt-2">
            <DesignSection />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-auto pt-4">
        <SettingsActions />
      </div>
    </aside>
  );
}
