/* 数据库查询结果类型定义 */

export type TagKind = 'good' | 'note' | 'plain'
export type AromaTone = 'green' | 'yellow' | 'purple'

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  selling_point: string | null
  description: string | null
  purchase_channels: string[] | null
  pickup_methods: string[] | null
  rush_difficulty: '秒无' | '热门' | '有货'
  advance_booking_text: string | null
  advance_days: number | null
  release_stock_time: string | null
  release_stock_day: '周一' | '周二' | '周三' | '周四' | '周五' | '周六' | '周日' | '每天' | '随机' | null
  limit_rules: string | null
  purchase_notes: string | null
  other_services: string[] | null
  contact_info: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  brand_id: string
  name: string | null
  address: string
  area: string | null
  phone: string | null
  business_hours: string | null
  delivery_range: string | null
  delivery_fee: number | null
  is_main: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  brand_id: string
  title: string
  category: string | null
  cover_image_url: string | null
  image_urls: string[] | null
  cake_base: string | null
  ingredient_text: string | null
  production_time: string | null
  accessories: string[] | null
  notes: string | null
  heat_score: number
  rating: number | null
  rating_count: number
  wants_count: number
  popularity_tag: string | null
  status: '在架' | '下架' | '缺货'
  is_active: boolean
  created_at: string
  updated_at: string
  skus?: ProductSku[]
  // 关联表数据
  taste_scores?: TasteScore | null
  aroma_notes?: AromaNote[]
  flavor_conclusions?: FlavorConclusion | null
  product_layers?: ProductLayer[]
  product_aroma_tags?: ProductAromaTag[]
  product_reviews?: ProductReview[]
}

export interface ProductSku {
  id: string
  product_id: string
  size_label: string
  size_detail: string | null
  people_range: string | null
  price: number
  status: string
  sort_order: number
  created_at: string
}

export interface TasteScore {
  id: string
  product_id: string
  sweetness: number | null
  sweetness_desc: string | null
  sourness: number | null
  sourness_desc: string | null
  bitterness: number | null
  bitterness_desc: string | null
  saltiness: number | null
  saltiness_desc: string | null
  umami: number | null
  umami_desc: string | null
}

export interface AromaNote {
  id: string
  product_id: string
  stage: '前调' | '中调' | '后调'
  stage_label: string | null
  summary: string | null
  detail: string | null
  sort_order?: number
}

export interface FlavorConclusion {
  id: string
  product_id: string
  summary: string | null
  content: string | null
}

export interface ProductLayer {
  id: string
  product_id: string
  layer_type: '顶层' | '中层' | '夹层' | '底层' | '装饰'
  layer_name: string | null
  ingredients: string | null
  mouthfeel: string | null
  highlight: string | null
  sort_order?: number
}

export interface ProductReview {
  id: string
  product_id: string
  review_type: '好评' | '差评'
  content: string
  feedback_count: number
  sort_order?: number
}

export interface ProductAromaTag {
  id: string
  product_id: string
  tag_name: string
}

export interface User {
  id: string
  username: string | null
  password_hash: string | null
  openid: string
  union_id: string | null
  nickname: string | null
  avatar_url: string | null
  phone: string | null
  user_type: 'buyer' | 'seller' | 'operator' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Buyer {
  id: string
  user_id: string
  level: number
  points: number
  total_orders: number
  total_spent: number
  favorite_areas: string[] | null
  created_at: string
  updated_at: string
}

export interface Seller {
  id: string
  user_id: string
  brand_id: string
  store_id: string | null
  position: string | null
  permissions: string[] | null
  created_at: string
  updated_at: string
}

export interface Operator {
  id: string
  user_id: string
  real_name: string | null
  department: string | null
  role_name: string | null
  permissions: string[] | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface WikiEntry {
  id: string
  entry_name: string
  category: '蛋糕胚' | '奶油' | '品类' | '风味' | '原料' | '保存' | '尺寸' | '术语'
  summary: string | null
  content: string | null
  view_count: number
  favorite_count: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  tag_group: '属性' | '风味' | '场景' | '人群'
  created_at: string
}

/* 工单管理 */
export type TicketType = 'bug' | '优化'
export type TicketPriority = '低' | '中' | '高' | '紧急'
export type TicketStatus = '待处理' | '审阅中' | 'AI处理中' | '待审阅' | '已完成' | '已驳回' | '处理失败'

export interface TicketAiStep {
  name: string
  status: '成功' | '失败' | '跳过'
  detail: string
  durationMs: number
}

export interface TicketAiResult {
  steps: TicketAiStep[]
  commit: string | null
  branch: string | null
  deployUrl: string | null
  simulate: boolean
}

export interface TicketEvent {
  id: string
  ticket_id: string
  step: string
  title: string
  detail: string | null
  operator: string
  created_at: string
}

export interface Ticket {
  id: string
  ticket_no: number
  title: string
  type: TicketType
  page_path: string | null
  description: string
  tech_notes: string | null
  priority: TicketPriority
  status: TicketStatus
  created_by: string | null
  reviewed_by: string | null
  ai_summary: string | null
  failure_reason: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

export interface TicketDetail extends Ticket {
  ai_result: TicketAiResult | null
  events: TicketEvent[]
}

/* API 响应格式 */
export interface PaginatedResponse<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T = unknown> {
  code: number
  data?: T
  message?: string
}

/* 异步任务（任务中心） */
export interface TaskError {
  row: number
  field: string
  message: string
  raw: string
}

export interface ImportTask {
  id: string
  type: 'import' | 'export'
  name: string | null
  file_name: string | null
  status: '排队中' | '处理中' | '成功' | '部分成功' | '失败'
  total_rows: number
  processed_rows: number
  success_rows: number
  fail_rows: number
  new_products: number
  new_skus: number
  message: string | null
  created_at: string
  updated_at: string
}

export interface ImportTaskDetail extends ImportTask {
  file_key: string | null
  errors: TaskError[]
}
