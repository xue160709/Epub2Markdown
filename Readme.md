# EPUB电子书转换器

这是一个使用Electron开发的桌面应用程序,用于将EPUB格式的电子书转换为Markdown文件。本工具旨在帮助用户轻松地将EPUB电子书转换为易于编辑和管理的Markdown格式。

## 功能特点

- 将EPUB文件转换为Markdown格式
- 保留原书的章节结构,确保内容组织不变
- 提取并保存元数据信息(如标题、作者、出版商等)
- 支持图片提取和保存,保持原有的图文排版
- 转换内部链接为Markdown兼容格式
- 简单易用的图形界面,操作直观

## 系统要求

- 操作系统: Windows 10+, macOS 10.12+, 或 Linux
- Node.js: v14.0.0 或更高版本

## 安装

1. 确保您的系统已安装Node.js (https://nodejs.org/)
2. 克隆此仓库到本地:
   ```bash
   git clone https://github.com/xue160709/Epub2Markdown.git
   ```
3. 进入项目目录:
   ```bash
   cd Epub2Markdown
   ```
4. 安装依赖:
   ```bash
   npm install
   ```

## 使用方法

1. 在项目目录中运行以下命令启动应用:
   ```bash
   npm start
   ```
2. 在打开的应用界面中:
   - 点击"选择电子书文件"按钮,选择要转换的EPUB文件
   - 点击"选择输出目录"按钮,选择保存转换后文件的目录
   - 点击"转换"按钮开始转换过程
3. 转换完成后,程序会自动打开输出目录,您可以查看生成的Markdown文件

## 开发

- `main.js`: Electron主进程文件,负责创建窗口和处理系统级操作
- `index.html`: 应用程序的HTML界面
- `renderer.js`: 渲染进程脚本,处理用户界面交互
- `Component/epub_to_markdown.js`: 核心转换逻辑,包含EPUB解析和Markdown生成代码

### 构建

要构建可分发的应用程序,请运行:
