<script lang="ts">
  import { PACKAGE_NAME, PACKAGE_URL, PUBLISHER_URL, REPO_URL } from "../../../_shared/links";

  let { eventName }: { eventName: string | null } = $props();
</script>

<section class="flex flex-col gap-3 border-b border-border py-5 sm:py-6">
  <h1 class="font-heading text-2xl font-bold uppercase tracking-wide text-text sm:text-3xl">
    {eventName ?? "ATC 2026"} · Army Lists
  </h1>
  <p class="max-w-2xl text-sm text-text-muted sm:text-base">
    Every army list submitted to the event, browsable. Each list is parsed in your browser by
    <a class="text-accent hover:text-accent-hover" href={PACKAGE_URL} target="_blank" rel="noopener noreferrer">
      <code class="font-mono">{PACKAGE_NAME}</code></a>.
    <a class="underline hover:text-text-muted" href={REPO_URL} target="_blank" rel="noopener noreferrer">Source</a>.
  </p>

  <!-- Byline (author-authorized). The favicon is dark, so it sits on a light chip. -->
  <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
    <a
      class="group inline-flex w-fit items-center gap-2.5 rounded-md border border-panel-border bg-panel px-2.5 py-1.5 text-sm text-text-muted transition-colors hover:border-accent hover:text-text"
      href={PUBLISHER_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="inline-flex h-8 w-8 items-center justify-center rounded bg-text p-1">
        <img src="/favicon-32x32.png" alt="Alpaca Software" width="24" height="24" class="h-full w-full" />
      </span>
      <span>Built by <span class="font-semibold text-text">Will Mitchell</span></span>
    </a>
  </div>
</section>
