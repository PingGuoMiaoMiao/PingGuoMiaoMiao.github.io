---
layout: ../../layouts/MarkdownPostLayout.astro
title: 前缀和数组（待写）
author: 苹果喵喵
description: "我遇到了一些问题，但是在社区里面提问真的很有帮助！"
image:
    url: "https://docs.astro.build/assets/rays.webp"
    alt: "Thumbnail of Astro rays."
pubDate: 2022-07-15
tags: ["astro", "learning in public", "setbacks", "community"]
---

概念：是从nums数组中给的第0个位置开始累加，到第i位置的和的结果，一般保存到preSum中记作preSum[i]。**我们常常把「前缀和」数组** `preSum` **的长度定义为** `原数组的长度 + 1`。`preSum` 的第 0 个位置，相当于一个占位符，置为 0。 **那么就可以把** `preSum` **的公式统一为** `preSum[i] = preSum[i - 1] + nums[i - 1]`，**此时的** `preSum[i]` **表示** `nums` **中 i 元素左边所有元素之和（不包含当前元素 i）**。 ​

**用途一:求数组前i个数之和**
sum（nums[0]...nums[length - 1]）,直接返回preSum[length]即可

**用途二:求数组中区间的和**
利用 `preSum` 数组，可以在 O(1)O(1)O(1) 的时间内快速求出 `nums`  任意区间 [i,j][i, j][i,j] (两端都包含) 内的所有元素之和。 ​

公式为： sum(i,j)=preSum[j+1]−preSum[i]sum(i, j) = preSum[j + 1] - preSum[i]sum(i,j)=preSum[j+1]−preSum[i]

什么原理呢？其实就是消除公共部分即 `0~i-1` 部分的和，那么就能得到 `i~j` 部分的区间和。 ​

注意上面的式子中，使用的是 `preSum[j + 1]` 和 `preSum[i]`，需要理解为什么这么做。（如果理解不了的知识，那就记不住，所以一定要理解） ​

- `preSum[j + 1]` 表示的是 `nums` 数组中 [0,j][0, j][0,j] 的所有数字之和（包含 000 和 jjj）。
- `preSum[i]`表示的是 `nums`数组中 [0,i−1][0, i - 1][0,i−1] 的所有数字之和（包含 000 和 i−1i - 1i−1）。
- 当两者相减时，结果留下了 `nums`数组中 [i,j][i, j][i,j] 的所有数字之和。

遇到二维数组求区间之和就用这个