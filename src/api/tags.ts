import request from '@/utils/request'
import type { Tag, ApiResponse } from '@/types'

// 获取标签列表
export const getTags = (params?: {
  page?: number
  pageSize?: number
  tag_group?: string
  keyword?: string
}) => {
  return request.get<ApiResponse<Tag[]>>('/tags', { params })
}

// 获取标签详情
export const getTagById = (id: string) => {
  return request.get<ApiResponse<Tag>>(`/tags/${id}`)
}

// 创建标签
export const createTag = (data: Partial<Tag>) => {
  return request.post<ApiResponse<Tag>>('/tags', data)
}

// 更新标签
export const updateTag = (id: string, data: Partial<Tag>) => {
  return request.put<ApiResponse<Tag>>(`/tags/${id}`, data)
}

// 删除标签
export const deleteTag = (id: string) => {
  return request.delete<ApiResponse<void>>(`/tags/${id}`)
}
