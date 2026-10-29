import { describe, expect, it } from "vitest";
import { parseFootnotes, stripNoteMarkers } from "@/legacy/components/TranslationWithNotes";

describe("translator notes", () => {
  it("splits QuranEnc footnotes by number", () => {
    const n = parseFootnotes("[1] Ou seja, anjos. \n[2] A Tora e o Evangelho.");
    expect(n["1"]).toBe("Ou seja, anjos.");
    expect(n["2"]).toBe("A Tora e o Evangelho.");
  });
  it("removes markers where notes can't be shown", () => {
    expect(stripNoteMarkers("não a apresseis[1]. Glorificado")).toBe("não a apresseis. Glorificado");
  });
});
