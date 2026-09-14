import request from '@/utils/request'
import type { Brand, ApiResponse } from '@/types'

// 获取品牌列表
export const getBrands = () => {
  return request.get<ApiResponse<Brand[]>>('/brands')
}

// 获取品牌详情
export const getBrandById = (id: string) => {
  return request.get<ApiResponse<Brand>>(`/brands/${id}`)
}

// 创建品牌
export const createBrand = (data: Partial<Brand>) => {
  return request.post<ApiResponse<Brand>>('/brands', data)
}

// 更新品牌
export const updateBrand = (id: string, data: Partial<Brand>) => {
  return request.put<ApiResponse<Brand>>(`/brands/${id}`, data)
}

// 删除品牌
export const deleteBrand = (id: string) => {
  return request.delete<ApiResponse<void>>(`/brands/${id}`)
}
