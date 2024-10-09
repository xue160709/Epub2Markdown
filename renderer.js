const { ipcRenderer } = require('electron');

let selectedFilePath = '';
let selectedOutputDir = '';

document.getElementById('selectFile').addEventListener('click', async () => {
  selectedFilePath = await ipcRenderer.invoke('select-file');
  document.getElementById('selectedFile').textContent = selectedFilePath || '未选择文件';
});

document.getElementById('selectOutputDir').addEventListener('click', async () => {
  selectedOutputDir = await ipcRenderer.invoke('select-output-directory');
  document.getElementById('selectedOutputDir').textContent = selectedOutputDir || '未选择输出目录';
});

document.getElementById('convert').addEventListener('click', async () => {
  if (!selectedFilePath || !selectedOutputDir) {
    alert('请先选择输入文件和输出目录');
    return;
  }

  document.getElementById('status').textContent = '正在转换...';
  const result = await ipcRenderer.invoke('convert', selectedFilePath, selectedOutputDir, { convertInternalLinks: true });
  
  if (result.success) {
    document.getElementById('status').textContent = '转换成功!';
    // 打开输出目录
    await ipcRenderer.invoke('open-directory', result.outputDir);
  } else {
    document.getElementById('status').textContent = `转换失败: ${result.error}`;
  }
});