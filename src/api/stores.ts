import request from '@/utils/request'
import type { Store, ApiResponse } from '@/types'

// 获取门店列表
export const getStores = (params?: {
  brand_id?: string
  page?: number
  pageSize?: number
}) => {
  return request.get<ApiResponse<Store[]>>('/stores', { params })
}

// 获取门店详情
export const getStoreById = (id: string) => {
  return request.get<ApiResponse<Store>>(`/stores/${id}`)
}

// 创建门店
export const createStore = (data: Partial<Store>) => {
  return request.post<ApiResponse<Store>>('/stores', data)
}

// 更新门店
export const updateStore = (id: string, data: Partial<Store>) => {
  return request.put<ApiResponse<Store>>(`/stores/${id}`, data)
}

// 删除门店
export const deleteStore = (id: string) => {
  return request.delete<ApiResponse<void>>(`/stores/${id}`)
}
