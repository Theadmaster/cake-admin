import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Table,
  Button,
  Tag,
  Space,
  Drawer,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Timeline,
  Descriptions,
  Dropdown,
  message,
} from 'antd'
import {
  ReloadOutlined,
  PlusOutlined,
  MoreOutlined,
  RobotOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  reviewTicket,
  startTicketAi,
  completeTicket,
} from '@/api/tickets'
import type { Ticket, TicketDetail } from '@/types'

/* 状态 → Tag 颜色 */
const STATUS_COLOR: Record<string, string> = {
  待处理: 'warning',
  审阅中: 'default',
  AI处理中: 'processing',
  待审阅: 'cyan',
  已完成: 'success',
  已驳回: 'default',
  处理失败: 'error',
}

const PRIORITY_COLOR: Record<string, string> = {
  低: 'default',
  中: 'blue',
  高: 'orange',
  紧急: 'red',
}

/* 人工可设置的状态（AI处理中/待审阅由工作流控制） */
const MANUAL_STATUSES = ['待处理', '审阅中', '已驳回', '已完成']
/* 允许二次审阅/启动 AI 的状态 */
const AI_READY_STATUSES = ['待处理', '审阅中', '处理失败', '已驳回']

function isProcessing(status: string) {
  return status === 'AI处理中'
}

export default function Tickets() {
  /* ---------------- 列表 ---------------- */
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [filters, setFilters] = useState<{ status?: string; type?: string; keyword?: string }>({})
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchTickets = useCallback(
    async (page = 1, silent = false) => {
      if (!silent) setLoading(true)
      try {
        const res = await getTickets({ page, pageSize: pagination.pageSize, ...filters })
        const data = res.data.data
        setTickets(data?.list || [])
        setPagination((prev) => ({ ...prev, page, total: data?.pagination?.total || 0 }))
      } catch (error) {
        console.error('获取工单列表失败:', error)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [filters, pagination.pageSize]
  )

  /* 存在 AI 处理中的工单时，每 3 秒轮询刷新 */
  useEffect(() => {
    const hasProcessing = tickets.some((t) => isProcessing(t.status))
    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(() => fetchTickets(pagination.page, true), 3000)
    }
    if (!hasProcessing && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [tickets, pagination.page, fetchTickets])

  useEffect(() => {
    fetchTickets(1)
  }, [filters, fetchTickets])

  /* ---------------- 新建工单 ---------------- */
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm] = Form.useForm()

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields()
      setCreateLoading(true)
      await createTicket(values)
      message.success('工单已提交')
      setCreateOpen(false)
      createForm.resetFields()
      fetchTickets(1)
    } catch {
      /* 校验失败 */
    } finally {
      setCreateLoading(false)
    }
  }

  /* ---------------- 详情抽屉 ---------------- */
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<TicketDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const openDetail = useCallback(async (id: string) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const res = await getTicketById(id)
      setDetail(res.data.data || null)
    } catch (error) {
      console.error('获取工单详情失败:', error)
      message.error('获取工单详情失败')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  /* 详情打开期间如有 AI 处理中，跟随轮询刷新 */
  useEffect(() => {
    if (!detailOpen || detail?.status !== 'AI处理中') return
    const timer = setInterval(() => detail && openDetail(detail.id), 3000)
    return () => clearInterval(timer)
  }, [detailOpen, detail, openDetail])

  /* ---------------- 二次审阅 ---------------- */
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<Ticket | null>(null)
  const [reviewForm] = Form.useForm()

  const openReview = (ticket: Ticket) => {
    setReviewTarget(ticket)
    reviewForm.setFieldsValue({
      description: ticket.description,
      tech_notes: ticket.tech_notes || '',
    })
    setReviewOpen(true)
  }

  const handleReview = async () => {
    if (!reviewTarget) return
    try {
      const values = await reviewForm.validateFields()
      setReviewLoading(true)
      await reviewTicket(reviewTarget.id, {
        description: values.description,
        tech_notes: values.tech_notes,
      })
      message.success('审阅完成，AI 处理已启动')
      setReviewOpen(false)
      fetchTickets(pagination.page, true)
      if (detailOpen && detail?.id === reviewTarget.id) openDetail(reviewTarget.id)
    } catch {
      /* 校验失败 */
    } finally {
      setReviewLoading(false)
    }
  }

  /* ---------------- AI 结果审阅（通过/打回） ---------------- */
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  const [rejectForm] = Form.useForm()

  const handleApprove = (ticket: Ticket) => {
    Modal.confirm({
      title: '确认通过该工单的 AI 处理结果？',
      content: '通过后工单将标记为「已完成」。',
      okText: '通过',
      onOk: async () => {
        await completeTicket(ticket.id, { action: 'approve' })
        message.success('工单已完成')
        fetchTickets(pagination.page, true)
        if (detailOpen && detail?.id === ticket.id) openDetail(ticket.id)
      },
    })
  }

  const handleReject = async () => {
    if (!reviewTarget) return
    try {
      const values = await rejectForm.validateFields()
      setRejectLoading(true)
      await completeTicket(reviewTarget.id, { action: 'reject', note: values.note })
      message.success('已打回待处理')
      setRejectOpen(false)
      rejectForm.resetFields()
      fetchTickets(pagination.page, true)
      if (detailOpen && detail?.id === reviewTarget.id) openDetail(reviewTarget.id)
    } catch {
      /* 校验失败 */
    } finally {
      setRejectLoading(false)
    }
  }

  /* ---------------- 直接启动 AI / 手动更新状态 ---------------- */
  const handleStartAi = (ticket: Ticket) => {
    Modal.confirm({
      title: '确认启动 AI 自动处理？',
      content: 'AI 将读取工单内容，自动完成代码修改、运行测试、提交仓库并触发部署。建议先做二次审阅以提高处理精度。',
      okText: '启动',
      onOk: async () => {
        await startTicketAi(ticket.id)
        message.success('AI 处理已启动')
        fetchTickets(pagination.page, true)
        if (detailOpen && detail?.id === ticket.id) openDetail(ticket.id)
      },
    })
  }

  const [statusOpen, setStatusOpen] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusForm] = Form.useForm()
  const [statusTarget, setStatusTarget] = useState<Ticket | null>(null)

  const handleStatusUpdate = async () => {
    if (!statusTarget) return
    try {
      const values = await statusForm.validateFields()
      setStatusLoading(true)
      await updateTicket(statusTarget.id, { status: values.status, note: values.note })
      message.success('状态已更新')
      setStatusOpen(false)
      statusForm.resetFields()
      fetchTickets(pagination.page, true)
      if (detailOpen && detail?.id === statusTarget.id) openDetail(statusTarget.id)
    } catch {
      /* 校验失败 */
    } finally {
      setStatusLoading(false)
    }
  }

  const moreMenu = (record: Ticket): MenuProps => ({
    items: [
      ...(AI_READY_STATUSES.includes(record.status)
        ? [{ key: 'ai', icon: <RobotOutlined />, label: '直接启动 AI 处理' }]
        : []),
      { key: 'status', icon: <EditOutlined />, label: '更新状态' },
    ],
    onClick: ({ key }) => {
      if (key === 'ai') handleStartAi(record)
      if (key === 'status') {
        setStatusTarget(record)
        statusForm.setFieldsValue({ status: record.status })
        setStatusOpen(true)
      }
    },
  })

  /* ---------------- 表格 ---------------- */
  const columns: ColumnsType<Ticket> = [
    { title: '编号', dataIndex: 'ticket_no', key: 'ticket_no', width: 70 },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: string) => (type === 'bug' ? <Tag color="red">页面问题</Tag> : <Tag color="geekblue">功能优化</Tag>),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (p: string) => <Tag color={PRIORITY_COLOR[p] || 'default'}>{p}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={STATUS_COLOR[status] || 'default'}>{status}</Tag>,
    },
    {
      title: '提交人',
      dataIndex: 'created_by',
      key: 'created_by',
      width: 90,
      render: (v: string | null) => v || '-',
    },
    {
      title: 'AI 处理摘要',
      dataIndex: 'ai_summary',
      key: 'ai_summary',
      width: 260,
      ellipsis: true,
      render: (text: string | null, record) => {
        if (record.status === '处理失败' && record.failure_reason) {
          return <span className="text-red-500">{record.failure_reason}</span>
        }
        return text || '-'
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (t: string) => (t ? new Date(t).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record) => (
        <Space size={0}>
          <Button type="link" size="small" onClick={() => openDetail(record.id)}>
            详情
          </Button>
          {AI_READY_STATUSES.includes(record.status) && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openReview(record)}>
              二次审阅
            </Button>
          )}
          {record.status === '待审阅' && (
            <>
              <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setReviewTarget(record)
                  setRejectOpen(true)
                }}
              >
                打回
              </Button>
            </>
          )}
          <Dropdown menu={moreMenu(record)} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">工单管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchTickets(pagination.page)}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              createForm.resetFields()
              setCreateOpen(true)
            }}
          >
            提交工单
          </Button>
        </Space>
      </div>

      {/* 过滤条件 */}
      <div className="flex gap-3 mb-4">
        <Select
          allowClear
          placeholder="状态"
          className="w-36"
          options={Object.keys(STATUS_COLOR).map((s) => ({ value: s, label: s }))}
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        />
        <Select
          allowClear
          placeholder="类型"
          className="w-32"
          options={[
            { value: 'bug', label: '页面问题' },
            { value: '优化', label: '功能优化' },
          ]}
          value={filters.type}
          onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
        />
        <Input.Search
          allowClear
          placeholder="搜索标题/问题描述"
          className="w-72"
          onSearch={(v) => setFilters((f) => ({ ...f, keyword: v || undefined }))}
        />
      </div>

      <Table
        columns={columns}
        dataSource={tickets}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1300 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page) => fetchTickets(page),
        }}
      />

      {/* 新建工单 */}
      <Modal
        title="提交工单"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
        confirmLoading={createLoading}
        okText="提交"
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" initialValues={{ type: 'bug', priority: '中' }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入工单标题' }]}
          >
            <Input placeholder="一句话概括问题或需求" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Radio.Group>
              <Radio value="bug">页面问题</Radio>
              <Radio value="优化">功能优化</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="page_path" label="相关页面（可选）">
            <Input placeholder="如 /cake/[id] 或 商品列表页" maxLength={150} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select
              options={['低', '中', '高', '紧急'].map((p) => ({ value: p, label: p }))}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请描述遇到的问题或优化需求' }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="描述现象、复现步骤、期望结果，尽量具体"
              maxLength={2000}
              showCount
            />
          </Form.Item>
          <Form.Item name="created_by" label="提交人（可选）">
            <Input placeholder="你的姓名" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 二次审阅 */}
      <Modal
        title={`二次审阅 · #${reviewTarget?.ticket_no ?? ''} ${reviewTarget?.title ?? ''}`}
        open={reviewOpen}
        onOk={handleReview}
        onCancel={() => setReviewOpen(false)}
        confirmLoading={reviewLoading}
        okText="提交并启动 AI 处理"
        width={640}
        destroyOnHidden
      >
        <p className="text-gray-500 mb-4">
          可将问题描述改写为更具技术性的表述，或补充项目技术侧背景（涉及模块、可能原因、约束等），帮助 AI 更精准地修复。
        </p>
        <Form form={reviewForm} layout="vertical">
          <Form.Item name="description" label="问题描述（技术性改写）">
            <Input.TextArea rows={4} maxLength={2000} showCount />
          </Form.Item>
          <Form.Item
            name="tech_notes"
            label="技术背景说明"
            rules={[{ required: true, message: '请补充技术背景说明' }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="如：疑似商品详情页 SkuList 组件的状态未随 productId 变化重置；技术栈 Next.js App Router + Tailwind v4，接口在 src/app/api 下……"
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 打回说明 */}
      <Modal
        title="打回工单"
        open={rejectOpen}
        onOk={handleReject}
        onCancel={() => setRejectOpen(false)}
        confirmLoading={rejectLoading}
        okText="确认打回"
        okButtonProps={{ danger: true }}
        destroyOnHidden
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="note"
            label="打回说明"
            rules={[{ required: true, message: '请说明打回原因' }]}
          >
            <Input.TextArea rows={4} placeholder="说明 AI 处理结果不符合预期的地方，打回后可补充技术背景重新处理" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 手动更新状态 */}
      <Modal
        title="更新工单状态"
        open={statusOpen}
        onOk={handleStatusUpdate}
        onCancel={() => setStatusOpen(false)}
        confirmLoading={statusLoading}
        okText="更新"
        destroyOnHidden
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item name="status" label="目标状态" rules={[{ required: true }]}>
            <Select options={MANUAL_STATUSES.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="note" label="备注（可选）">
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title={detail ? `工单 #${detail.ticket_no} · ${detail.title}` : '工单详情'}
        placement="right"
        width={720}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnHidden
        extra={
          detail && AI_READY_STATUSES.includes(detail.status) ? (
            <Button type="primary" icon={<EditOutlined />} onClick={() => openReview(detail)}>
              二次审阅
            </Button>
          ) : null
        }
      >
        {detailLoading || !detail ? (
          <p className="text-gray-400">加载中...</p>
        ) : (
          <div className="space-y-6">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="状态">
                <Tag color={STATUS_COLOR[detail.status] || 'default'}>{detail.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                {detail.type === 'bug' ? '页面问题' : '功能优化'}
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={PRIORITY_COLOR[detail.priority] || 'default'}>{detail.priority}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交人">{detail.created_by || '-'}</Descriptions.Item>
              <Descriptions.Item label="相关页面" span={2}>
                {detail.page_path || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {detail.created_at ? new Date(detail.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <p className="text-gray-400 text-xs mb-1">问题描述</p>
              <p className="whitespace-pre-wrap">{detail.description}</p>
            </div>

            {detail.tech_notes && (
              <div>
                <p className="text-gray-400 text-xs mb-1">
                  技术背景说明（二次审阅 · {detail.reviewed_by || '-'}）
                </p>
                <p className="whitespace-pre-wrap bg-gray-50 rounded p-3">{detail.tech_notes}</p>
              </div>
            )}

            {detail.status === '处理失败' && detail.failure_reason && (
              <div>
                <p className="text-gray-400 text-xs mb-1">失败原因</p>
                <p className="whitespace-pre-wrap text-red-500">{detail.failure_reason}</p>
              </div>
            )}

            {detail.ai_result && (
              <div>
                <p className="text-gray-400 text-xs mb-2">
                  AI 处理明细
                  {detail.ai_result.simulate && (
                    <Tag className="ml-2">模拟模式（未配置 TICKET_AI_EXECUTOR）</Tag>
                  )}
                </p>
                <Space direction="vertical" size={4} className="w-full mb-3">
                  {detail.ai_result.commit && (
                    <span className="text-xs">
                      提交：<Tag color="purple">{detail.ai_result.commit}</Tag>
                      分支：{detail.ai_result.branch}
                    </span>
                  )}
                  {detail.ai_result.deployUrl && (
                    <span className="text-xs">部署：{detail.ai_result.deployUrl}</span>
                  )}
                </Space>
                <Timeline
                  items={detail.ai_result.steps.map((s) => ({
                    color: s.status === '成功' ? 'green' : s.status === '失败' ? 'red' : 'gray',
                    children: (
                      <div>
                        <p className="m-0 font-medium">
                          {s.name}
                          <span className="text-gray-400 text-xs ml-2">{s.durationMs}ms</span>
                        </p>
                        <p className="m-0 text-xs text-gray-500 whitespace-pre-wrap">{s.detail}</p>
                      </div>
                    ),
                  }))}
                />
              </div>
            )}

            {detail.ai_summary && (
              <div>
                <p className="text-gray-400 text-xs mb-1">AI 处理摘要</p>
                <p className="whitespace-pre-wrap">{detail.ai_summary}</p>
              </div>
            )}

            <div>
              <p className="text-gray-400 text-xs mb-3">处理时间线（{detail.events.length} 条）</p>
              <Timeline
                items={detail.events.map((e) => ({
                  color: e.step === '失败' ? 'red' : e.step === '完成' ? 'green' : 'blue',
                  children: (
                    <div>
                      <p className="m-0">
                        <span className="font-medium">{e.title}</span>
                        <Tag className="ml-2" color={STATUS_COLOR[e.step] || 'default'}>
                          {e.step}
                        </Tag>
                      </p>
                      {e.detail && (
                        <p className="m-0 text-xs text-gray-500 whitespace-pre-wrap">{e.detail}</p>
                      )}
                      <p className="m-0 text-xs text-gray-400">
                        {e.operator} · {new Date(e.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  ),
                }))}
              />
            </div>

            {/* 待审阅时的闭环操作 */}
            {detail.status === '待审阅' && (
              <Space>
                <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(detail)}>
                  审阅通过，完成工单
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setReviewTarget(detail)
                    rejectForm.resetFields()
                    setRejectOpen(true)
                  }}
                >
                  打回
                </Button>
              </Space>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
