import request from '@/utils/request'
import type { Product, PaginatedResponse, ApiResponse } from '@/types'

// 获取商品列表
export const getProducts = (params?: string | {
  page?: number
  pageSize?: number
  brand_id?: string
  category?: string
  status?: string
  keyword?: string
}) => {
  if (typeof params === 'string') {
    return request.get<ApiResponse<PaginatedResponse<Product>>>(`/products?${params}`)
  }
  return request.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params })
}

// 获取商品详情
export const getProductById = (id: string) => {
  return request.get<ApiResponse<Product>>(`/products/${id}`)
}

// 创建商品
export const createProduct = (data: Partial<Product>) => {
  return request.post<ApiResponse<Product>>('/products', data)
}

// 更新商品
export const updateProduct = (id: string, data: Partial<Product>) => {
  return request.put<ApiResponse<Product>>(`/products/${id}`, data)
}

// 删除商品
export const deleteProduct = (id: string) => {
  return request.delete<ApiResponse<void>>(`/products/${id}`)
}
