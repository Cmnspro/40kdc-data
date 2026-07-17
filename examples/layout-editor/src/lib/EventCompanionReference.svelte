<script lang="ts">
  import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist";
  import workerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
  import { eventCompanionPage, type EditLayout } from "./model.js";

  GlobalWorkerOptions.workerSrc = workerUrl;

  interface Props {
    layout: Pick<EditLayout, "mission_matchup_id" | "variant">;
    onimage: (image: string | null) => void;
    opacity?: number;
  }

  let { layout, onimage, opacity = $bindable(0.45) }: Props = $props();
  let documentProxy = $state<PDFDocumentProxy | null>(null);
  let error = $state<string | null>(null);
  let loading = $state(false);
  let currentUrl: string | null = null;
  let renderTask: RenderTask | null = null;
  let renderGeneration = 0;

  const pageNumber = $derived(eventCompanionPage(layout));

  function clearImage(): void {
    onimage(null);
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }

  async function destroyDocument(): Promise<void> {
    renderGeneration += 1;
    renderTask?.cancel();
    renderTask = null;
    const previous = documentProxy;
    documentProxy = null;
    if (previous) {
      previous.cleanup();
      await previous.destroy();
    }
  }

  async function selectFile(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    error = null;
    await destroyDocument();
    clearImage();
    if (!file) return;
    if (file.type !== "application/pdf") {
      error = "Choose a PDF file.";
      input.value = "";
      return;
    }

    loading = true;
    try {
      documentProxy = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    } catch {
      error = "This PDF could not be opened.";
      documentProxy = null;
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    const pdf = documentProxy;
    const page = pageNumber;
    const generation = ++renderGeneration;
    renderTask?.cancel();
    renderTask = null;

    if (!pdf || page === null) {
      clearImage();
      return;
    }

    void (async () => {
      try {
        const pdfPage = await pdf.getPage(page);
        if (generation !== renderGeneration) return;
        const viewport = pdfPage.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("canvas unavailable");
        renderTask = pdfPage.render({ canvasContext: context, viewport });
        await renderTask.promise;
        pdfPage.cleanup();
        if (generation !== renderGeneration) return;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("PNG conversion failed");
        const nextUrl = URL.createObjectURL(blob);
        const previousUrl = currentUrl;
        currentUrl = nextUrl;
        onimage(nextUrl);
        if (previousUrl) URL.revokeObjectURL(previousUrl);
      } catch (caught) {
        if ((caught as { name?: string }).name !== "RenderingCancelledException" && generation === renderGeneration) {
          error = `Page ${page} could not be rendered.`;
          clearImage();
        }
      } finally {
        if (generation === renderGeneration) renderTask = null;
      }
    })();
  });

  $effect(() => () => {
    void destroyDocument();
    clearImage();
  });
</script>

<section class="event-companion-reference" aria-label="Event Companion reference">
  <label>
    Event Companion PDF
    <input type="file" accept="application/pdf" onchange={selectFile} disabled={pageNumber === null} />
  </label>
  <label>
    Reference opacity
    <input type="range" min="0.10" max="0.90" step="0.05" bind:value={opacity} disabled={pageNumber === null} />
    <output>{Math.round(opacity * 100)}%</output>
  </label>
  {#if pageNumber === null}
    <p>No Event Companion drawing matches this layout.</p>
  {:else if loading}
    <p>Loading reference PDF…</p>
  {:else if error}
    <p class="error" role="status">{error}</p>
  {:else}
    <p>Page {pageNumber}. Kept in this browser session only.</p>
  {/if}
</section>

<style>
  .event-companion-reference {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 1rem;
    margin: 0 0 0.65rem;
    color: var(--ink-muted);
    font-size: 0.78rem;
  }

  label { display: inline-flex; align-items: center; gap: 0.4rem; }
  input[type="file"] { max-width: 15rem; }
  input[type="range"] { inline-size: 6rem; }
  output { min-inline-size: 2.4rem; font-variant-numeric: tabular-nums; }
  p { margin: 0; }
  .error { color: var(--danger, #9d3029); }
</style>
