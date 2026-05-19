import { persistAnalyticsEvent } from "./analyticsPersistence.js";

const MAX_EVENTS = 2000;

let events = [];

function nowIso() {
  return new Date().toISOString();
}

export function recordAnalyticsEvent(event) {
  const storedEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: nowIso(),
    ...event,
  };

  events.push(storedEvent);

  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }

  persistAnalyticsEvent(storedEvent);

  return storedEvent;
}

export function getAnalyticsEvents() {
  return [...events];
}

function countBy(items, keyFn) {
  const map = new Map();
  items.forEach(item => {
    const key = keyFn(item);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function recent(items, limit = 10) {
  return items
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);
}

export function summarizeAnalytics() {
  const pageViews = events.filter(event => event.type === "page_view");
  const downloads = events.filter(event => event.type === "material_open");
  const requests = events.filter(event => event.type === "request_submit");
  const assistantQuestions = events.filter(event => event.type === "assistant_question");
  const poorAnswers = events.filter(event => event.type === "assistant_poor_answer");

  return {
    totals: {
      pageViews: pageViews.length,
      downloads: downloads.length,
      requests: requests.length,
      assistantQuestions: assistantQuestions.length,
      poorAnswers: poorAnswers.length,
    },
    topPages: countBy(pageViews, event => event.path),
    topDownloads: countBy(downloads, event => [event.vehicle, event.materialType].filter(Boolean).join(" · ")),
    topRequestTypes: countBy(requests, event => event.requestType),
    topAssistantTopics: countBy(assistantQuestions, event => event.topic || event.query?.slice(0, 60)),
    recentPoorAnswers: recent(poorAnswers, 10),
    recentAssistantQuestions: recent(assistantQuestions, 10),
  };
}
