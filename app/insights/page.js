import { summarizeAnalytics } from "../../lib/analyticsStore.js";

export const dynamic = "force-dynamic";

function SectionList({ title, items = [], empty }) {
  return (
    <section className="insightPanel">
      <h2>{title}</h2>
      {items.length ? (
        <ul className="insightList">
          {items.map((item, index) => (
            <li key={`${item.label || item.query || item.createdAt}-${index}`}>
              <strong>{item.label || item.query || item.reason || "Item"}</strong>
              {"count" in item ? <span>{item.count}</span> : null}
              {item.createdAt ? <small>{item.createdAt}</small> : null}
              {item.path ? <small>{item.path}</small> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </section>
  );
}

export default function InsightsPage() {
  const summary = summarizeAnalytics();

  return (
    <>
      <h1 className="pageTitle">
        <span className="en">Insights</span>
        <span className="cn">监控面板</span>
      </h1>
      <p className="muted en">A lightweight live dashboard for page views, material opens, request activity, and assistant quality signals in the current server instance.</p>
      <p className="muted cn">这是一个轻量级实时监控面板，用于查看当前服务实例中的页面访问、资料打开、需求提交和助手质量信号。</p>

      <div className="statsGrid">
        <article className="statCard">
          <span className="statValue">{summary.totals.pageViews}</span>
          <span className="en">Page views</span>
          <span className="cn">页面访问</span>
        </article>
        <article className="statCard">
          <span className="statValue">{summary.totals.downloads}</span>
          <span className="en">Material opens</span>
          <span className="cn">资料打开</span>
        </article>
        <article className="statCard">
          <span className="statValue">{summary.totals.requests}</span>
          <span className="en">Requests</span>
          <span className="cn">需求提交</span>
        </article>
        <article className="statCard">
          <span className="statValue">{summary.totals.poorAnswers}</span>
          <span className="en">Poor-answer signals</span>
          <span className="cn">低质量回答信号</span>
        </article>
      </div>

      <div className="insightGrid">
        <SectionList title="Top Pages" items={summary.topPages} empty="No page view events yet." />
        <SectionList title="Top Downloads" items={summary.topDownloads} empty="No material open events yet." />
        <SectionList title="Request Types" items={summary.topRequestTypes} empty="No request submissions yet." />
        <SectionList title="Assistant Topics" items={summary.topAssistantTopics} empty="No assistant questions yet." />
        <SectionList title="Recent Assistant Questions" items={summary.recentAssistantQuestions} empty="No assistant activity yet." />
        <SectionList title="Recent Poor Answers" items={summary.recentPoorAnswers} empty="No poor-answer signals yet." />
      </div>
    </>
  );
}
