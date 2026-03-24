import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelpModal } from "./HelpModal";
import { useCalendarStore } from "@/stores/calendarStore";

beforeEach(() => {
  useCalendarStore.setState({ themeId: "classic" });
});

describe("HelpModal", () => {
  it("renders help trigger button", () => {
    render(<HelpModal />);
    expect(screen.getByLabelText("Help")).toBeDefined();
  });

  it("renders ? text in trigger", () => {
    render(<HelpModal />);
    expect(screen.getByText("?")).toBeDefined();
  });

  it("does not show dark background warning for classic theme", () => {
    render(<HelpModal />);
    expect(screen.queryByText("背景色ありテーマを使用中")).toBeNull();
  });

  it("renders export format descriptions when opened", async () => {
    render(<HelpModal />);
    screen.getByLabelText("Help").click();
    await screen.findByText("出力形式の使い分け");
    expect(screen.getByText("一時保存について")).toBeDefined();
  });

  it("renders convenience store printing accordion for 3 chains", async () => {
    render(<HelpModal />);
    screen.getByLabelText("Help").click();
    const conveniTrigger = await screen.findByText("コンビニで印刷する");
    conveniTrigger.click();
    expect(await screen.findByText("セブン‐イレブン")).toBeDefined();
    expect(screen.getByText("ローソン")).toBeDefined();
    expect(screen.getByText("ファミリーマート")).toBeDefined();
  });

  it("shows glossy paper note for Seven-Eleven", async () => {
    render(<HelpModal />);
    screen.getByLabelText("Help").click();
    const conveniTrigger = await screen.findByText("コンビニで印刷する");
    conveniTrigger.click();
    const sevenTrigger = await screen.findByText("セブン‐イレブン");
    sevenTrigger.click();
    expect(await screen.findByText(/光沢紙はネットプリントでは選択できません/)).toBeDefined();
  });

  it("uses サービス公式 link text", async () => {
    render(<HelpModal />);
    screen.getByLabelText("Help").click();
    const conveniTrigger = await screen.findByText("コンビニで印刷する");
    conveniTrigger.click();
    const sevenTrigger = await screen.findByText("セブン‐イレブン");
    sevenTrigger.click();
    expect(await screen.findByText("サービス公式（料金・使い方）")).toBeDefined();
  });
});
