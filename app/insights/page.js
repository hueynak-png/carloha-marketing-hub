import { summarizeAnalytics } from "../../lib/analyticsStore.js";

export const dynamic = "force-dynamic";

function SectionList({ titleEn, titleCn, items = [], emptyEn, emptyCn }) {
  return (
    <section className="insightPanel">
      <h2>
        <span className="en">{titleEn}</span>
        <span className="cn">{titleCn}</span>
      </h2>
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
        <>
          <p className="muted en">{emptyEn}</p>
          <p className="muted cn">{emptyCn}</p>
        </>
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

      <div className="insightsBanner">
        <strong className="en">Private view enabled</strong>
        <strong className="cn">当前为私密查看模式</strong>
        <p className="en">This page is hidden from public navigation and is available only after a valid access key has been verified.</p>
        <p className="cn">该页面不会出现在公开导航中，只有在验证正确访问 key 后才可查看。</p>
      </div>

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
        <SectionList
          titleEn="Top Pages"
          titleCn="热门页面"
          items={summary.topPages}
          emptyEn="No page view events yet."
          emptyCn="暂时还没有页面访问记录。"
        />
        <SectionList
          titleEn="Top Downloads"
          titleCn="热门资料打开"
          items={summary.topDownloads}
          emptyEn="No material open events yet."
          emptyCn="暂时还没有资料打开记录。"
        />
        <SectionList
          titleEn="Request Types"
          titleCn="需求类型"
          items={summary.topRequestTypes}
          emptyEn="No request submissions yet."
          emptyCn="暂时还没有需求提交流水。"
        />
        <SectionList
          titleEn="Assistant Topics"
          titleCn="助手话题"
          items={summary.topAssistantTopics}
          emptyEn="No assistant questions yet."
          emptyCn="暂时还没有助手提问记录。"
        />
        <SectionList
          titleEn="Recent Assistant Questions"
          titleCn="最近助手提问"
          items={summary.recentAssistantQuestions}
          emptyEn="No assistant activity yet."
          emptyCn="暂时还没有助手活动。"
        />
        <SectionList
          titleEn="Recent Poor Answers"
          titleCn="最近低质量回答"
          items={summary.recentPoorAnswers}
          emptyEn="No poor-answer signals yet."
          emptyCn="暂时还没有低质量回答信号。"
        />
      </div>
    </>
  );
}
