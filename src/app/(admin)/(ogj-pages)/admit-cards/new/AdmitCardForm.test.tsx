import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";

import { AdmitCardForm } from "./AdmitCardForm";
import { ADMIT_CARDS_API } from "@/app/envConfig";

const mockGetPaginatedEntity = vi.fn();
const mockCreateEntity = vi.fn();
const mockUpdateEntity = vi.fn();

vi.mock("@/lib/api/global/Generic", () => ({
  getPaginatedEntity: (...args: unknown[]) => mockGetPaginatedEntity(...args),
  createEntity: (...args: unknown[]) => mockCreateEntity(...args),
  updateEntity: (...args: unknown[]) => mockUpdateEntity(...args),
}));

vi.mock("./StepBasicInfo", () => ({
  StepBasicInfo: function MockStepBasicInfo() {
    const { register } = useFormContext();
    return (
      <div data-testid="step-basic">
        <label htmlFor="title">Title</label>
        <input id="title" aria-label="Title" {...register("title")} />

        <label htmlFor="examName">Exam Name</label>
        <input id="examName" aria-label="Exam Name" {...register("examName")} />

        <label htmlFor="organizationId">Organization Id</label>
        <input id="organizationId" aria-label="Organization Id" {...register("organizationId")} />
      </div>
    );
  },
}));

vi.mock("./StepContent", () => ({
  StepContent: function MockStepContent() {
    return <div data-testid="step-content">Step Content</div>;
  },
}));

vi.mock("./StepSEOAndAI", () => ({
  StepSEOAndAI: function MockStepSEOAndAI() {
    return <div data-testid="step-seo">Step SEO</div>;
  },
}));

vi.mock("./StepReviewAndSubmit", () => ({
  StepReviewAndSubmit: function MockStepReviewAndSubmit() {
    return <div data-testid="step-review">Step Review</div>;
  },
}));

function renderForm(props?: Partial<React.ComponentProps<typeof AdmitCardForm>>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdmitCardForm isAdmin={true} {...props} />
    </QueryClientProvider>
  );
}

describe("AdmitCardForm integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockGetPaginatedEntity.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });
    mockCreateEntity.mockResolvedValue({ success: true, message: "ok" });
    mockUpdateEntity.mockResolvedValue({ success: true, message: "ok" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("blocks moving past step 1 until required fields are filled", async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByTestId("step-basic")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Title"), "RRB Technician Admit Card");
    await user.type(screen.getByLabelText("Exam Name"), "RRB Technician Exam");
    await user.type(screen.getByLabelText("Organization Id"), "org-1");

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByTestId("step-content")).toBeInTheDocument();
  });

  it("submits create flow via createEntity", async () => {
    const user = userEvent.setup();
    renderForm({ isAdmin: true, isEditMode: false });

    await user.type(screen.getByLabelText("Title"), "RRB Technician Admit Card");
    await user.type(screen.getByLabelText("Exam Name"), "RRB Technician Exam");
    await user.type(screen.getByLabelText("Organization Id"), "org-1");

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(mockCreateEntity).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateEntity).not.toHaveBeenCalled();
  });

  it("submits edit flow via updateEntity", async () => {
    const user = userEvent.setup();

    renderForm({
      isAdmin: true,
      isEditMode: true,
      initialValues: {
        id: "ac-1",
        title: "Existing Admit Card",
        examName: "Existing Exam",
        organizationId: "org-1",
        status: "upcoming",
        lifecycleStatus: "draft",
      },
    });

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(mockUpdateEntity).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateEntity).toHaveBeenCalledWith(
      ADMIT_CARDS_API,
      "ac-1",
      expect.any(Object),
      { entityName: "AdmitCard" }
    );
    expect(mockCreateEntity).not.toHaveBeenCalled();
  });
});
