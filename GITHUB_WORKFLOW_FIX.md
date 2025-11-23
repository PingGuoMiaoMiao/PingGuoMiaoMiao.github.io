# GitHub Workflow 修复指南

## 问题
构建时出现内存不足错误：`JavaScript heap out of memory`

## 解决方案

### 步骤 1：在 GitHub 网页上修改 workflow 文件

1. 访问：https://github.com/PingGuoMiaoMiao/PingGuoMiaoMiao.github.io
2. 进入 `.github/workflows/deploy.yml` 文件
3. 点击右上角的编辑按钮（铅笔图标）
4. 找到第 23-30 行，替换为：

```yaml
      - name: Install, build, and upload your site
        uses: withastro/action@v2
        with:
          node-version: 20
        env:
          NODE_OPTIONS: --max-old-space-size=4096
```

5. 点击 "Commit changes" 提交

### 步骤 2：验证

修改后，下次推送代码时，GitHub Actions 会自动使用 4GB 内存限制进行构建，应该可以成功构建。

## 说明

- `NODE_OPTIONS: --max-old-space-size=4096` 将 Node.js 内存限制设置为 4GB
- 这可以处理大型 Live2D 文件（33MB）的构建
- `package.json` 中的构建脚本也已经更新，本地构建时也会使用 4GB 内存

