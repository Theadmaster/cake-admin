import request from '@/utils/request'
import type { User, ApiResponse } from '@/types'

// 获取用户列表
export const getUsers = (params?: {
  page?: number
  pageSize?: number
  keyword?: string
}) => {
  return request.get<ApiResponse<User[]>>('/users', { params })
}

// 获取用户详情
export const getUserById = (id: string) => {
  return request.get<ApiResponse<User>>(`/users/${id}`)
}

// 获取用户收藏
export const getUserWants = (id: string) => {
  return request.get<ApiResponse<unknown[]>>(`/users/${id}/wants`)
}

// 获取用户评论
export const getUserComments = (id: string) => {
  return request.get<ApiResponse<unknown[]>>(`/users/${id}/comments`)
}
