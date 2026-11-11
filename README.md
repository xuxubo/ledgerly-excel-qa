# Ledgerly：Excel 智能问答助手

Ledgerly 是一个 Excel 智能问答前端。上传 `.xlsx` 工作簿后，可以选择工作表、用自然语言提问，并查看分析过程、查询结果和原始数据来源。

> 本仓库仅包含前端。文件上传和问答依赖单独运行的分析后端；没有后端时，页面可以打开，但无法完成上传或提问。

## 功能

- 上传并在浏览器中解析 `.xlsx` 工作簿，查看工作表、行列数及数据预览。
- 选择工作表并向分析服务发送自然语言问题。
- 实时展示流式回答、分析步骤和查询结果。
- 查看当前工作表的列、单元格范围及前 12 行原始数据。

目前仅接受不超过 20 MB 的 `.xlsx` 文件。图表标签页尚未接入图表数据。

## 本地运行

需要 Node.js 和 npm，以及实现下述接口的分析后端。开发服务器会把 `/api` 请求代理到 `http://127.0.0.1:8000`（见 `vite.config.ts`）。

```bash
npm install
npm run dev
```

打开终端显示的本地地址。后端需要在上传文件和发送问题前启动。若后端使用其他地址，请修改 `vite.config.ts` 中的代理目标。

其他命令：

```bash
npm run lint
npm run build
npm run preview
```

## 后端接口

前端调用以下接口：

| 接口 | 用途 |
| --- | --- |
| `POST /api/v1/workbooks/upload` | 以 `multipart/form-data` 上传 `file`，可选 `sheet_name`；返回工作簿 ID、当前工作表和工作表列表。 |
| `POST /api/v1/chat/stream` | 以 JSON 提交 `workbook_id`、`question`、`conversation_id`；返回服务器发送事件（SSE）流。 |

问答流使用 `start`、`step`、`token`、`done` 和 `error` 事件。前端的具体字段类型定义见 `src/services/apiClient.ts`。本仓库不包含后端实现或模型配置。

## 技术栈

React 19、TypeScript、Vite 8、SheetJS（`xlsx`）和 React Markdown。
