import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UrlAnalyzerForm } from "@/features/analysis/url-analyzer-form";

describe("UrlAnalyzerForm", () => {
  it("submits a valid url", async () => {
    const onSubmit = vi.fn();
    render(<UrlAnalyzerForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText("https://exemple.com/login"), "example.com/login");
    await userEvent.click(screen.getByRole("button", { name: /lancer l'analyse/i }));

    expect(onSubmit).toHaveBeenCalledWith({ url: "example.com/login" }, expect.anything());
  });
});
