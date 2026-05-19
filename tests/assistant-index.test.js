import test from "node:test";
import assert from "node:assert/strict";

import { buildAssistantIndex, retrieveAssistantContext } from "../lib/assistantIndex.js";

test("assistant index retrieves vehicle and wiki sources together", () => {
  const index = buildAssistantIndex(
    [
      {
        Vehicle: "Tiggo 9",
        "Material Type": "Brochures",
        Title: "Tiggo 9 Brochure",
        Description: "Official brochure for Tiggo 9",
        Status: "Ready",
        "Google Drive Link": "https://drive.test/tiggo9",
      },
    ],
    [],
    [
      {
        question: { en: "What is Carloha?" },
        short_answer: { en: "Carloha is a mobility company." },
        detailed_content: { en: "Carloha supports vehicle sales and services." },
        L2_title: { en: "Company" },
        tags: ["carloha", "company"],
      },
    ]
  );

  const retrieval = retrieveAssistantContext(index, "I need Tiggo 9 brochure");
  assert.match(retrieval.context, /Tiggo 9 Brochure/);
  assert.equal(retrieval.sources[0].kind, "vehicle");
});
