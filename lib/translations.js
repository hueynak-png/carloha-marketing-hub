export const commonTranslations = {
  Ready: "可用",
  Updated: "已更新",
  "Coming Soon": "即将上线",
  Folder: "文件夹",
  Material: "资料",
  "Specification Sheet": "配置表",
  Brochures: "手册",
  Flyers: "单页",
  "Official Photos": "官方图片",
  "Official Videos": "官方视频",
  "Social Media Videos": "社媒视频",
  "Training Materials": "培训资料",
  "Dealer Guidelines": "经销商指南",
  "Brand Assets": "品牌素材",
  Logo: "Logo",
  "Event Materials": "活动物料",
  "Showroom Materials": "展厅物料",
  "Holiday Campaigns": "节日活动",
  "PR Articles": "PR文章",
};

export const generalDescriptions = {
  "Dealer Guidelines": "经销商市场使用规范资料夹。",
  "Brand Assets": "品牌视觉与基础素材资料夹。",
  Logo: "Logo 文件和使用素材资料夹。",
  "Event Materials": "活动执行与传播物料资料夹。",
  "Showroom Materials": "展厅展示与销售支持物料资料夹。",
  "Holiday Campaigns": "节日营销活动资料夹。",
  "PR Articles": "公关文章和传播内容资料夹。",
};

export function translateValue(value, fallback = value) {
  return commonTranslations[value] || fallback;
}
