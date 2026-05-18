export default function GuidelinesPage() {
  return (
    <>
      <h1 className="pageTitle">
        <span className="en">Usage Guidelines</span>
        <span className="cn">使用规范</span>
      </h1>
      <p className="muted en">
        Please follow the guidelines below when using vehicle materials, brand assets,
        and dealer marketing content.
      </p>
      <p className="muted cn">
        使用车型资料、品牌素材和经销商市场内容时，请遵守以下规范。
      </p>

      <section className="support-section highlight guidelines-section">
        <h2><span className="en">General Rules</span><span className="cn">通用规则</span></h2>

        <ul className="guidelines-list en">
          <li>
            <strong>Always use the latest version</strong> shown on this website.
          </li>
          <li>
            <strong>Do not modify logos, brand visuals, or official product information</strong>
            {" "}without approval.
          </li>
          <li>
            <strong>Confirm product specifications and prices</strong> before external sharing.
          </li>
          <li>
            <strong>Dealers may use approved materials</strong> for local marketing and social media promotion.
          </li>
        </ul>
        <ul className="guidelines-list cn">
          <li><strong>请始终使用网站上的最新版本</strong>资料。</li>
          <li><strong>未经批准，不得修改 Logo、品牌视觉或官方产品信息。</strong></li>
          <li><strong>对外分享前，请确认产品配置和价格信息。</strong></li>
          <li><strong>经销商可以使用已批准资料</strong>进行本地市场推广和社交媒体宣传。</li>
        </ul>
      </section>
    </>
  );
}
