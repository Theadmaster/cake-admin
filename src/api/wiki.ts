import request from '@/utils/request'
import type { WikiEntry, ApiResponse } from '@/types'

// 获取百科列表
export const getWikiEntries = (params?: {
  page?: number
  pageSize?: number
  category?: string
  keyword?: string
}) => {
  return request.get<ApiResponse<WikiEntry[]>>('/wiki', { params })
}

// 获取百科详情
export const getWikiById = (id: string) => {
  return request.get<ApiResponse<WikiEntry>>(`/wiki/${id}`)
}

// 创建百科
export const createWiki = (data: Partial<WikiEntry>) => {
  return request.post<ApiResponse<WikiEntry>>('/wiki', data)
}

// 更新百科
export const updateWiki = (id: string, data: Partial<WikiEntry>) => {
  return request.put<ApiResponse<WikiEntry>>(`/wiki/${id}`, data)
}

// 删除百科
export const deleteWiki = (id: string) => {
  return request.delete<ApiResponse<void>>(`/wiki/${id}`)
}
