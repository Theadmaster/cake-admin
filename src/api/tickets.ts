import request from '@/utils/request'
import type { ApiResponse, PaginatedResponse, Ticket, TicketDetail } from '@/types'

/* 工单列表（分页，可按状态/类型/关键词过滤） */
export const getTickets = (params?: {
  page?: number
  pageSize?: number
  status?: string
  type?: string
  keyword?: string
}) => {
  return request.get<ApiResponse<PaginatedResponse<Ticket>>>('/tickets', { params })
}

/* 工单详情（含 AI 处理明细与事件时间线） */
export const getTicketById = (id: string) => {
  return request.get<ApiResponse<TicketDetail>>(`/tickets/${id}`)
}

/* 工单提交 */
export const createTicket = (data: {
  title: string
  type: 'bug' | '优化'
  description: string
  page_path?: string
  priority?: string
  created_by?: string
}) => {
  return request.post<ApiResponse<Ticket>>('/tickets', data)
}

/* 工单更新（字段编辑 / 人工状态流转） */
export const updateTicket = (
  id: string,
  data: {
    title?: string
    description?: string
    page_path?: string | null
    priority?: string
    status?: string
    note?: string
    operator?: string
  }
) => {
  return request.patch<ApiResponse<Ticket>>(`/tickets/${id}`, data)
}

/* 二次审阅：补充技术背景 / 改写技术性描述，提交后自动启动 AI 处理 */
export const reviewTicket = (
  id: string,
  data: { description?: string; tech_notes?: string; reviewed_by?: string }
) => {
  return request.post<ApiResponse<unknown>>(`/tickets/${id}/review`, data)
}

/* 直接启动 AI 自动处理（跳过二次审阅 / 失败重跑） */
export const startTicketAi = (id: string, operator?: string) => {
  return request.post<ApiResponse<unknown>>(`/tickets/${id}/ai`, { operator })
}

/* AI 结果人工审阅闭环：approve-通过 / reject-打回 */
export const completeTicket = (
  id: string,
  data: { action: 'approve' | 'reject'; note?: string; operator?: string }
) => {
  return request.post<ApiResponse<unknown>>(`/tickets/${id}/complete`, data)
}
