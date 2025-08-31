# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

MNLiteratureBoard 是一个基于 Next.js 15 构建的文献管理系统，专为学术研究和引用管理设计。该应用提供了管理学术文献、作者、期刊和研究进展跟踪的综合功能。

**技术栈：**
- Next.js 15.2.4 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3.4.17
- shadcn/ui 组件库
- React Hook Form + Zod 验证
- Lucide React 图标

## 开发命令

```bash
# 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 安装依赖
pnpm install
```

## 项目结构

### 核心架构

项目采用 Next.js App Router 结构，单页应用模式：

```
app/
├── globals.css          # 全局样式和 Tailwind 工具类
├── layout.tsx          # 根布局，配置 Geist 字体
├── loading.tsx         # 加载组件
└── page.tsx            # 主应用（所有功能都在单一组件中）
```

### 主要功能

主应用 (`app/page.tsx`) 是一个综合的文献管理系统，包含：

1. **文献管理**：学术论文、书籍、会议等的增删改查操作
2. **作者管理**：作者档案和专业领域管理
3. **期刊/出版社管理**：出版载体跟踪
4. **进展追踪**：研究进展文档记录
5. **引用系统**：引用和参考文献管理

### 数据模型

应用定义了几个核心 TypeScript 接口：

#### 文献接口
```typescript
interface Literature {
  id: string
  title: string
  authors: string[]
  year: number
  type: "paper" | "book" | "conference" | "thesis" | "report" | "misc"
  // 丰富的元数据，包括 DOI、ISBN、引用次数等
}
```

#### 引用系统
```typescript
interface Reference {
  id: string
  literatureId: string
  citationKey: string
  citations: Citation[]
}

interface Citation {
  id: string
  content: string
  page?: number
  note?: string
  timestamp: string
}
```

### 组件架构

- **单页组件**：所有 UI 逻辑都包含在 `app/page.tsx` 中（41,000+ 行）
- **shadcn/ui 组件**：通过 shadcn/ui 广泛使用 Radix UI 组件
- **状态管理**：使用 React hooks（useState、useRef、useEffect）进行本地状态管理
- **表单处理**：React Hook Form 配合 Zod 验证

### UI 系统

项目使用 shadcn/ui 和自定义 Tailwind 配置：

- **组件库**：`components/ui/` 中的完整 shadcn/ui 设置
- **主题系统**：使用 CSS 变量管理颜色和间距
- **暗色模式**：基于 class 的暗色模式支持
- **图标**：Lucide React 图标库
- **字体**：Geist Sans 和 Geist Mono 字体

### 配置文件

- **TypeScript**：标准 Next.js TypeScript 配置，包含路径别名 (`@/*`)
- **Tailwind**：扩展主题，包含自定义颜色系统和动画
- **Next.js**：开发时忽略 ESLint 和 TypeScript 错误
- **shadcn/ui**：配置为 neutral 基色和 CSS 变量

### 开发注意事项

1. **单组件架构**：整个应用逻辑都在一个大型组件文件中
2. **类型安全**：广泛使用 TypeScript 接口进行数据建模
3. **构建配置**：为加快开发迭代忽略构建错误
4. **路径别名**：使用 `@/` 进行导入（在 TypeScript 和 shadcn/ui 中配置）
5. **组件系统**：利用 shadcn/ui 组件保持 UI 模式一致性

### 在此代码库中工作

进行更改时：

1. **数据模型**：在 `app/page.tsx` 顶部更新 TypeScript 接口
2. **UI 组件**：使用 `components/ui/` 中现有的 shadcn/ui 组件
3. **样式设计**：遵循已建立的 Tailwind CSS 模式
4. **状态管理**：使用 React hooks 进行状态管理
5. **表单**：使用 React Hook Form 和 Zod 验证模式实现

代码库专为快速原型设计而设计，在单文件架构中实现了综合的文献管理功能。