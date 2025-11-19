/**
 * 评论系统工具函数
 * 使用 localStorage 作为客户端存储（可扩展为后端 API）
 */

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string;
  parentId?: string; // 支持回复
}

const STORAGE_KEY = 'blog_comments';

/**
 * 获取文章的所有评论
 */
export function getComments(postId: string): Comment[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const allComments = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    ) as Comment[];
    return allComments.filter((c) => c.postId === postId);
  } catch {
    return [];
  }
}

/**
 * 添加评论
 */
export function addComment(comment: Omit<Comment, 'id' | 'date'>): Comment {
  if (typeof window === 'undefined') {
    throw new Error('只能在客户端调用');
  }

  const newComment: Comment = {
    ...comment,
    id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    date: new Date().toISOString(),
  };

  try {
    const allComments = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    ) as Comment[];
    allComments.push(newComment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allComments));
  } catch (error) {
    console.error('保存评论失败:', error);
  }

  return newComment;
}

/**
 * 删除评论（可选功能）
 */
export function deleteComment(commentId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const allComments = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    ) as Comment[];
    const filtered = allComments.filter((c) => c.id !== commentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取评论数量
 */
export function getCommentCount(postId: string): number {
  return getComments(postId).length;
}

