# Carloha Marketing Hub 零代码部署与维护指南

## 1. 目标
把 Carloha Marketing Hub 部署到 Vercel，让内部、销售和经销商通过一个链接访问资料库。文件继续放在 Google Drive，网站负责展示分类、搜索、入口和使用说明。

推荐流程：Google Drive 存文件 → Google Sheets 管理链接 → Vercel 部署网站 → 每月维护表格和 Drive 文件。

## 2. 需要准备
- GitHub 账号：存放网站代码。
- Vercel 账号：部署网站并生成访问链接。
- Google Drive：存放车型资料和通用资料。
- Google Sheets：维护资料标题、分类、链接、更新时间。
- Google Form：收集 Q&A / Request。
- `carloha_marketing_hub_template.xlsx`：上传到 Google Drive 后用 Google Sheets 打开。

## 3. 部署到 GitHub + Vercel
1. 解压 `carloha_marketing_hub_nextjs.zip`，得到 `carloha-marketing-hub` 文件夹。
2. 在 GitHub 新建 Repository，建议名称：`carloha-marketing-hub`。
3. 上传解压后文件夹内的全部内容。注意 Repository 根目录必须能看到 `package.json`。
4. 打开 Vercel，使用 GitHub 登录。
5. 点击 Add New → Project。
6. 选择 `carloha-marketing-hub` Repository，点击 Import。
7. Framework Preset 应自动识别为 Next.js。
8. 第一次可以不填环境变量，直接点击 Deploy。
9. 部署完成后，Vercel 会生成一个 `vercel.app` 网址。

## 4. Google Sheets CSV 接入
1. 上传 `carloha_marketing_hub_template.xlsx` 到 Google Drive。
2. 使用 Google Sheets 打开。
3. 确认 `Vehicle Materials` 和 `General Materials` 两张表。
4. 在 Google Sheets 顶部菜单选择 File → Share → Publish to web。
5. 选择 `Vehicle Materials` 这张 sheet，不要选择 Entire document。
6. 格式选择 Comma-separated values (.csv)，点击 Publish，复制 CSV 链接。
7. 对 `General Materials` 重复一次。
8. 在 Vercel 项目中打开 Settings → Environment Variables，添加：

```bash
NEXT_PUBLIC_VEHICLE_CSV_URL=你的 Vehicle Materials CSV 链接
NEXT_PUBLIC_GENERAL_CSV_URL=你的 General Materials CSV 链接
```

9. 保存后到 Deployments 页面点击 Redeploy。

## 5. Request Form 和联系方式替换
创建 Google Form 后，复制表单链接。在 GitHub 中编辑 `lib/config.js`：

```js
export const REQUEST_FORM_URL = "你的 Google Form 链接";
export const CONTACT = {
  name: "Brad Hu",
  email: "你的邮箱",
  whatsapp: "你的 WhatsApp"
};
```

提交修改后，Vercel 会自动重新部署。

## 6. 每月维护流程
1. 在 Google Drive 更新资料文件和文件夹。
2. 在 Google Sheets 更新标题、链接、状态和 Last Updated。
3. 检查 Google Drive 权限。
4. 打开网站测试搜索和资料按钮。
5. 查看 Google Form Responses，整理销售和经销商需求。

## 7. 常见问题
- Vercel 部署失败：确认 `package.json` 在 GitHub 根目录。
- 网站数据没更新：检查 CSV 是否发布，等待几分钟或 Redeploy。
- Drive 链接打不开：检查 Google Drive 权限。
- 按钮显示 Coming Soon：把 Google Sheets 里的 Status 改为 Ready，并补充链接。
- Request 按钮打不开：确认 `REQUEST_FORM_URL` 已替换为 Google Form 链接。
