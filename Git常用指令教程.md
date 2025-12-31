# Git 常用指令教程

## 📚 目录

- [分支操作](#分支操作)
- [基础操作](#基础操作)
- [提交操作](#提交操作)
- [远程仓库操作](#远程仓库操作)
- [查看与比较](#查看与比较)
- [撤销与回退](#撤销与回退)
- [标签操作](#标签操作)
- [实用技巧](#实用技巧)

---

## 🌿 分支操作

### 创建分支

```bash
# 创建新分支（但不切换）
git branch <分支名>

# 创建并切换到新分支（推荐！）
git checkout -b <分支名>

# 或者使用新语法（Git 2.23+，更推荐）
git switch -c <分支名>
```

**示例**：
```bash
# 创建并切换到 feature 分支
git checkout -b feature/new-function

# 或者
git switch -c feature/new-function
```

### 切换分支

```bash
# 切换到已存在的分支
git checkout <分支名>

# 或者使用新语法
git switch <分支名>
```

**示例**：
```bash
git checkout main
# 或
git switch main
```

### 查看分支

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看远程分支
git branch -r

# 查看分支的详细信息（最后提交信息）
git branch -v
```

### 删除分支

```bash
# 删除已合并的分支
git branch -d <分支名>

# 强制删除分支（未合并也会删除）
git branch -D <分支名>

# 删除远程分支
git push origin --delete <分支名>
# 或
git push origin :<分支名>
```

**示例**：
```bash
# 删除本地分支
git branch -d feature/old-feature

# 删除远程分支
git push origin --delete feature/old-feature
```

### 合并分支

```bash
# 将指定分支合并到当前分支
git merge <分支名>

# 合并时使用 rebase（保持线性历史）
git rebase <分支名>
```

**示例**：
```bash
# 切换到 main 分支
git checkout main

# 合并 feature 分支到 main
git merge feature/new-function
```

### 重命名分支

```bash
# 重命名当前分支
git branch -m <新分支名>

# 重命名指定分支
git branch -m <旧分支名> <新分支名>
```

---

## 📝 基础操作

### 初始化仓库

```bash
# 在当前目录初始化 Git 仓库
git init

# 克隆远程仓库
git clone <仓库URL>

# 克隆指定分支
git clone -b <分支名> <仓库URL>
```

**示例**：
```bash
# 克隆 GitHub 仓库
git clone https://github.com/username/repo.git

# 克隆指定分支
git clone -b develop https://github.com/username/repo.git
```

### 查看状态

```bash
# 查看工作区状态
git status

# 简短状态
git status -s

# 查看状态和分支信息
git status -sb
```

### 添加到暂存区

```bash
# 添加单个文件
git add <文件名>

# 添加所有文件
git add .

# 添加所有修改的文件（不包括删除）
git add -u

# 交互式添加（选择性地添加文件的部分内容）
git add -p
```

**示例**：
```bash
# 添加单个文件
git add src/components/Header.astro

# 添加所有文件
git add .

# 交互式添加
git add -p
```

---

## 💾 提交操作

### 提交更改

```bash
# 提交暂存区的更改
git commit -m "提交信息"

# 提交时直接添加所有更改（不推荐，但快速）
git commit -am "提交信息"

# 提交并修改上一次提交信息
git commit --amend -m "新的提交信息"

# 提交时添加详细描述
git commit -m "简短标题" -m "详细描述"
```

**示例**：
```bash
# 标准提交
git commit -m "添加用户登录功能"

# 提交并修改上一次提交
git commit --amend -m "修复登录bug并添加验证"

# 多行提交信息
git commit -m "添加新功能" -m "- 实现用户认证
- 添加登录表单
- 更新样式"
```

### 查看提交历史

```bash
# 查看提交历史
git log

# 简洁的一行显示
git log --oneline

# 图形化显示分支
git log --graph --oneline --all

# 查看最近 N 条提交
git log -n 5

# 查看指定文件的提交历史
git log <文件名>
```

**示例**：
```bash
# 简洁显示
git log --oneline

# 图形化显示
git log --graph --oneline --all

# 查看最近 10 条
git log -10 --oneline
```

---

## 🌐 远程仓库操作

### 查看远程仓库

```bash
# 查看远程仓库列表
git remote

# 查看远程仓库详细信息
git remote -v

# 查看远程仓库 URL
git remote get-url origin
```

### 添加远程仓库

```bash
# 添加远程仓库
git remote add <名称> <URL>

# 修改远程仓库 URL
git remote set-url <名称> <新URL>
```

**示例**：
```bash
# 添加远程仓库
git remote add origin https://github.com/username/repo.git

# 修改远程仓库 URL
git remote set-url origin https://github.com/username/new-repo.git
```

### 拉取代码

```bash
# 从远程拉取并合并（推荐）
git pull

# 从指定远程和分支拉取
git pull <远程名> <分支名>

# 拉取但不合并（只更新远程分支信息）
git fetch

# 拉取所有远程分支
git fetch --all
```

**示例**：
```bash
# 拉取并合并
git pull origin main

# 只拉取不合并
git fetch origin

# 拉取后合并
git fetch origin
git merge origin/main
```

### 推送代码

```bash
# 推送到远程仓库
git push

# 推送到指定远程和分支
git push <远程名> <分支名>

# 首次推送并设置上游
git push -u <远程名> <分支名>

# 强制推送（谨慎使用！）
git push --force
# 或
git push -f
```

**示例**：
```bash
# 首次推送新分支
git push -u origin feature/new-function

# 后续推送
git push

# 推送所有分支
git push --all origin

# 推送标签
git push --tags
```

---

## 👀 查看与比较

### 查看差异

```bash
# 查看工作区与暂存区的差异
git diff

# 查看暂存区与仓库的差异
git diff --staged
# 或
git diff --cached

# 查看两个提交之间的差异
git diff <提交1> <提交2>

# 查看两个分支的差异
git diff <分支1>..<分支2>
```

**示例**：
```bash
# 查看未暂存的更改
git diff

# 查看已暂存的更改
git diff --staged

# 查看两个分支的差异
git diff main..develop
```

### 查看文件内容

```bash
# 查看文件内容
git show <提交>:<文件路径>

# 查看最新提交的某个文件
git show HEAD:<文件路径>
```

---

## ↩️ 撤销与回退

### 撤销工作区的更改

```bash
# 撤销工作区的更改（未暂存）
git checkout -- <文件名>
# 或使用新语法
git restore <文件名>

# 撤销所有工作区的更改
git checkout .
# 或
git restore .
```

**⚠️ 警告**：这会永久删除未提交的更改！

### 撤销暂存区的更改

```bash
# 取消暂存（保留文件更改）
git reset HEAD <文件名>
# 或使用新语法
git restore --staged <文件名>

# 取消所有暂存
git reset HEAD
# 或
git restore --staged .
```

### 回退提交

```bash
# 回退到指定提交（保留更改）
git reset --soft <提交哈希>

# 回退到指定提交（保留工作区，清空暂存区）
git reset --mixed <提交哈希>
# 或
git reset <提交哈希>

# 回退到指定提交（完全删除更改）
git reset --hard <提交哈希>

# 回退到上一个提交
git reset --hard HEAD~1
```

**示例**：
```bash
# 查看提交历史
git log --oneline

# 回退到指定提交（保留更改）
git reset --soft abc1234

# 完全回退到上一个提交
git reset --hard HEAD~1
```

### 撤销提交但保留更改

```bash
# 撤销上一次提交，保留更改在暂存区
git reset --soft HEAD~1

# 撤销上一次提交，保留更改在工作区
git reset HEAD~1
```

---

## 🏷️ 标签操作

### 创建标签

```bash
# 创建轻量标签
git tag <标签名>

# 创建附注标签（推荐）
git tag -a <标签名> -m "标签说明"

# 在指定提交创建标签
git tag -a <标签名> <提交哈希> -m "标签说明"
```

**示例**：
```bash
# 创建版本标签
git tag -a v1.0.0 -m "发布版本 1.0.0"

# 在指定提交创建标签
git tag -a v0.9.0 abc1234 -m "版本 0.9.0"
```

### 查看标签

```bash
# 查看所有标签
git tag

# 查看标签详细信息
git show <标签名>

# 按模式查找标签
git tag -l "v1.*"
```

### 删除标签

```bash
# 删除本地标签
git tag -d <标签名>

# 删除远程标签
git push origin --delete <标签名>
# 或
git push origin :refs/tags/<标签名>
```

### 推送标签

```bash
# 推送指定标签
git push origin <标签名>

# 推送所有标签
git push --tags
```

---

## 🎯 实用技巧

### 暂存更改（临时保存）

```bash
# 暂存当前更改
git stash

# 暂存并添加说明
git stash save "说明信息"

# 查看暂存列表
git stash list

# 恢复最近的暂存
git stash pop

# 恢复指定暂存（不删除）
git stash apply stash@{0}

# 删除暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear
```

**示例**：
```bash
# 暂存当前更改
git stash

# 切换到其他分支工作
git checkout other-branch

# 完成工作后切换回来
git checkout main

# 恢复暂存的更改
git stash pop
```

### 查找文件

```bash
# 查找文件
git ls-files | grep <文件名>

# 查找被删除的文件
git log --diff-filter=D --summary | grep delete
```

### 查看配置

```bash
# 查看所有配置
git config --list

# 查看全局配置
git config --global --list

# 设置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 常用别名设置

```bash
# 设置常用别名（添加到 ~/.gitconfig）
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

设置后可以使用：
- `git st` 代替 `git status`
- `git co` 代替 `git checkout`
- `git br` 代替 `git branch`
- `git ci` 代替 `git commit`

---

## 📋 常用工作流程

### 功能开发流程

```bash
# 1. 切换到主分支并更新
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/new-feature

# 3. 开发并提交
git add .
git commit -m "添加新功能"

# 4. 推送到远程
git push -u origin feature/new-feature

# 5. 在 GitHub 上创建 Pull Request

# 6. 合并后删除本地分支
git checkout main
git pull origin main
git branch -d feature/new-feature
```

### 修复 Bug 流程

```bash
# 1. 从主分支创建修复分支
git checkout main
git checkout -b hotfix/bug-fix

# 2. 修复并提交
git add .
git commit -m "修复bug描述"

# 3. 推送并创建 PR
git push -u origin hotfix/bug-fix

# 4. 合并后更新主分支
git checkout main
git pull origin main
```

### 查看和清理

```bash
# 查看已合并的分支
git branch --merged

# 删除已合并的分支（批量）
git branch --merged | grep -v "\*\|main\|master" | xargs -n 1 git branch -d

# 查看远程分支的跟踪情况
git branch -vv

# 清理远程已删除的分支
git remote prune origin
```

---

## ⚠️ 注意事项

### 危险操作

1. **`git push --force`**：会覆盖远程历史，谨慎使用！
2. **`git reset --hard`**：会永久删除未提交的更改！
3. **删除分支前**：确认分支已经合并或不再需要

### 最佳实践

1. ✅ **经常提交**：小步快跑，频繁提交
2. ✅ **清晰的提交信息**：使用有意义的提交信息
3. ✅ **创建分支开发**：不要直接在 main/master 分支开发
4. ✅ **拉取前先提交**：保持本地更改已提交
5. ✅ **定期推送**：避免丢失本地更改

### 提交信息规范

```bash
# 格式：<类型>(<范围>): <主题>

# 类型：
# feat: 新功能
# fix: 修复bug
# docs: 文档更新
# style: 代码格式（不影响功能）
# refactor: 重构
# test: 测试
# chore: 构建/工具变动

# 示例
git commit -m "feat(用户): 添加用户登录功能"
git commit -m "fix(文章): 修复文章列表显示问题"
git commit -m "docs(README): 更新安装说明"
```

---

## 🆕 Git 2.23+ 新语法

Git 2.23 版本引入了更清晰的命令：

```bash
# 旧语法 vs 新语法

# 切换分支
git checkout <分支>          →  git switch <分支>
git checkout -b <分支>       →  git switch -c <分支>

# 恢复文件
git checkout -- <文件>       →  git restore <文件>
git restore --staged <文件>  →  取消暂存（新命令）
```

**建议**：如果使用 Git 2.23+，优先使用新语法，更清晰明确！

---

## 📚 学习资源

- **官方文档**：https://git-scm.com/doc
- **交互式教程**：https://learngitbranching.js.org/
- **GitHub 指南**：https://guides.github.com/
- **Pro Git 书籍**：https://git-scm.com/book

---

**文档版本**：v1.0  
**最后更新**：2024年

