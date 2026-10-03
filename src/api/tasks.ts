import request from '@/utils/request'
import type { ApiResponse, ImportTask, ImportTaskDetail, PaginatedResponse } from '@/types'

// 任务列表（分页，可按类型/状态过滤）
export const getTasks = (params?: {
  page?: number
  pageSize?: number
  type?: string
  status?: string
}) => {
  return request.get<ApiResponse<PaginatedResponse<ImportTask>>>('/tasks', { params })
}

// 任务详情（含错误明细）
export const getTaskById = (id: string) => {
  return request.get<ApiResponse<ImportTaskDetail>>(`/tasks/${id}`)
}
