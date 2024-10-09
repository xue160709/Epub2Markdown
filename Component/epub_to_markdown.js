const fs = require('fs').promises;
const path = require('path');
const extract = require('extract-zip');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const os = require('os');

const turndownService = new TurndownService();

async function convertEpubToMarkdown(epubPath, outputDir, options = {}) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'epub-'));
  
  try {
    console.log('临时文件夹创建在:', tmpDir);

    await extract(epubPath, { dir: tmpDir });

    const opfFile = await findFile(tmpDir, '.opf');
    if (!opfFile) throw new Error('无法找到OPF文件');

    const opfContent = await fs.readFile(opfFile, 'utf-8');
    const opfResult = await xml2js.parseStringPromise(opfContent);

    const toc = await parseToc(opfResult, path.dirname(opfFile));
    const meta = await parseMeta(opfResult);

    // 创建以EPUB文件名命名的新文件夹
    const epubFileName = path.basename(epubPath, path.extname(epubPath));
    const newOutputDir = path.join(outputDir, epubFileName);
    await fs.mkdir(newOutputDir, { recursive: true });

    const imagesDir = path.join(newOutputDir, 'images');
    await fs.mkdir(imagesDir, { recursive: true });

    for (let i = 0; i < toc.length; i++) {
      const chapter = toc[i];
      const chapterContent = await fs.readFile(chapter.path, 'utf-8');
      const $ = cheerio.load(chapterContent);
      $('script').remove();

      $('img').each((_, element) => {
        const src = $(element).attr('src');
        if (src) {
          const imagePath = path.join(path.dirname(chapter.path), src);
          const imageFileName = path.basename(src);
          const newImagePath = path.join(imagesDir, imageFileName);
          
          fs.copyFile(imagePath, newImagePath).catch(err => console.error('复制图片失败:', err));
          $(element).attr('src', `images/${imageFileName}`);
        }
      });

      const cleanHtml = $('body').html();
      let markdown = turndownService.turndown(cleanHtml);
      markdown = optimizeMarkdown(markdown, options);

      const outputPath = path.join(newOutputDir, `chapter_${i + 1}.md`);
      await fs.writeFile(outputPath, markdown);
      console.log(`转换完成: chapter_${i + 1}.md`);
    }

    await fs.writeFile(path.join(newOutputDir, 'metadata.json'), JSON.stringify(meta, null, 2));
    console.log('元数据已保存');

    console.log('所有章节转换完成');
    return newOutputDir; // 返回新创建的文件夹路径
  } catch (error) {
    console.error('转换过程中出错:', error);
    throw error; // 将错误抛出,以便主进程处理
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
      console.log('临时文件夹已删除:', tmpDir);
    } catch (err) {
      console.error('删除临时文件夹时出错:', err);
    }
  }
}

async function findFile(dir, extension) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const found = await findFile(path.join(dir, file.name), extension);
      if (found) return found;
    } else if (path.extname(file.name) === extension) {
      return path.join(dir, file.name);
    }
  }
  return null;
}

async function parseToc(opfResult, basePath) {
  const spine = opfResult.package.spine[0].itemref.map(item => item.$.idref);
  const manifest = opfResult.package.manifest[0].item.reduce((acc, item) => {
    acc[item.$.id] = item.$.href;
    return acc;
  }, {});

  return spine.map(id => ({
    path: path.join(basePath, manifest[id]),
    id: id
  }));
}

async function parseMeta(opfResult) {
  const meta = opfResult.package.metadata[0];
  return {
    title: meta['dc:title']?.[0] || '',
    author: meta['dc:creator']?.[0]?._ || meta['dc:creator']?.[0] || '',
    publisher: meta['dc:publisher']?.[0] || '',
    language: meta['dc:language']?.[0] || '',
  };
}

function optimizeMarkdown(markdown, options) {
  // 这里可以添加更多的优化逻辑
  markdown = markdown.replace(/\[\[(\d+)\]\]\((.*?)\)/g, '[^$1]');
  markdown = markdown.replace(/\[(\d+)\]\((.*?)\)/g, '[^$1]');
  
  if (options.convertInternalLinks) {
    markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[[$2|$1]]');
  }

  return markdown;
}

// 删除自动执行的示例代码
// const epubPath = path.resolve('回归商业常识.epub');
// const outputDir = path.resolve('output_markdown');
// convertEpubToMarkdown(epubPath, outputDir, { convertInternalLinks: true });

// 导出convertEpubToMarkdown函数
module.exports = {
  convertEpubToMarkdown
};