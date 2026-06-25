<script lang="ts">
  import {
    PACKAGE_NAME,
    PACKAGE_URL,
    LIST_BUILDER_URL,
    PUBLISHER_URL,
    REPO_URL,
  } from "../../../_shared/links";

  let { eventName }: { eventName: string | null } = $props();
</script>

<section class="flex flex-col gap-3 border-b border-border py-5 sm:py-6">
  <h1 class="font-heading text-2xl font-bold uppercase tracking-wide text-text sm:text-3xl">
    {eventName ?? "ATC 2026"} · Army Lists
  </h1>
  <p class="max-w-2xl text-sm text-text-muted sm:text-base">
    Every list here is parsed and validated in your browser by
    <a class="text-accent hover:text-accent-hover" href={PACKAGE_URL} target="_blank" rel="noopener noreferrer">
      <code class="font-mono">{PACKAGE_NAME}</code></a>, the open-source 40K dataset + roster
    engine. A list that imports cleanly <em>and</em> round-trips through the share registry earns a
    one-tap
    <a class="text-accent hover:text-accent-hover" href={LIST_BUILDER_URL} target="_blank" rel="noopener noreferrer">
      list builder</a> link — so the green badge is a live proof that the importer understood the
    whole list.
  </p>
  <p class="text-xs text-text-dim">
    Lists are public on BCP. Builds with the same package:
    <a class="underline hover:text-text-muted" href={REPO_URL} target="_blank" rel="noopener noreferrer">
      source on GitHub</a>.
  </p>

  <!-- Byline (author-authorized): the alpaca-software mark + name, with a
       visible networking nudge. The favicon is dark, so it sits on a light chip. -->
  <a
    class="group mt-1 inline-flex w-fit items-center gap-2.5 rounded-md border border-panel-border bg-panel px-2.5 py-1.5 text-sm text-text-muted transition-colors hover:border-accent hover:text-text"
    href={PUBLISHER_URL}
    target="_blank"
    rel="noopener noreferrer"
  >
    <span class="inline-flex h-8 w-8 items-center justify-center rounded bg-text p-1">
      <img src="/favicon-32x32.png" alt="Alpaca Software" width="24" height="24" class="h-full w-full" />
    </span>
    <span class="flex flex-col leading-tight">
      <span>Built by <span class="font-semibold text-text">Will Mitchell</span></span>
      <span class="text-xs font-semibold text-accent">Come say Hi!</span>
    </span>
  </a>
</section>
