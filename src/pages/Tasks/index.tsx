import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Tag, Space, Progress, Drawer, message, Tooltip } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getTasks, getTaskById } from '@/api/tasks'
import type { ImportTask, ImportTaskDetail, TaskError } from '@/types'

/* 状态 → Tag 颜色 */
const STATUS_COLOR: Record<string, string> = {
  排队中: 'default',
  处理中: 'processing',
  成功: 'success',
  部分成功: 'warning',
  失败: 'error',
}

function isPending(status: string) {
  return status === '排队中' || status === '处理中'
}

export default function Tasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<ImportTask[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<ImportTaskDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchTasks = useCallback(async (page = 1, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getTasks({ page, pageSize: 20 })
      const data = res.data.data
      setTasks(data?.list || [])
      setPagination((prev) => ({ ...prev, page, total: data?.pagination?.total || 0 }))
    } catch (error) {
      console.error('获取任务列表失败:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  /* 存在排队中/处理中的任务时，每 3 秒轮询刷新 */
  useEffect(() => {
    const hasPending = tasks.some((t) => isPending(t.status))
    if (hasPending && !pollRef.current) {
      pollRef.current = setInterval(() => fetchTasks(pagination.page, true), 3000)
    }
    if (!hasPending && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [tasks, pagination.page, fetchTasks])

  useEffect(() => {
    fetchTasks(1)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchTasks])

  const openDetail = async (id: string) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const res = await getTaskById(id)
      setDetail(res.data.data || null)
    } catch (error) {
      console.error('获取任务详情失败:', error)
      message.error('获取任务详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const columns: ColumnsType<ImportTask> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      ellipsis: true,
      render: (text: string | null, record) => text || record.file_name || record.id,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (type === 'export' ? '导出' : '导入'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={STATUS_COLOR[status] || 'default'}>{status}</Tag>,
    },
    {
      title: '进度',
      key: 'progress',
      width: 200,
      render: (_: unknown, record) => {
        const total = record.total_rows || 0
        const done = record.processed_rows || 0
        if (record.status === '排队中') return <span className="text-gray-400">排队等待中</span>
        if (total === 0) return '-'
        return (
          <div className="flex items-center gap-2">
            <Progress
              percent={Math.round((done / total) * 100)}
              size="small"
              status={record.status === '失败' ? 'exception' : isPending(record.status) ? 'active' : 'normal'}
              className="!mb-0 w-28 [&>.ant-progress-outer]:!mb-0"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {done}/{total}
            </span>
          </div>
        )
      },
    },
    {
      title: '结果',
      key: 'result',
      width: 220,
      render: (_: unknown, record) => {
        if (isPending(record.status)) return '-'
        return (
          <Space size={4} wrap>
            {record.new_products > 0 && <Tag color="blue">商品 +{record.new_products}</Tag>}
            {record.new_skus > 0 && <Tag color="geekblue">SKU +{record.new_skus}</Tag>}
            {record.fail_rows > 0 && (
              <Tooltip title="点击查看详情中的失败原因">
                <Tag color="red">失败 {record.fail_rows} 行</Tag>
              </Tooltip>
            )}
            {record.fail_rows === 0 && record.success_rows > 0 && <Tag color="green">成功 {record.success_rows} 行</Tag>}
          </Space>
        )
      },
    },
    {
      title: '摘要',
      dataIndex: 'message',
      key: 'message',
      width: 260,
      ellipsis: true,
      render: (text: string | null) => text || '-',
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
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record) => (
        <Button type="link" onClick={() => openDetail(record.id)}>
          详情
        </Button>
      ),
    },
  ]

  const errorColumns: ColumnsType<TaskError> = [
    { title: '行号', dataIndex: 'row', key: 'row', width: 70 },
    { title: '字段', dataIndex: 'field', key: 'field', width: 110 },
    { title: '失败原因', dataIndex: 'message', key: 'message', width: 240 },
    {
      title: '原始内容',
      dataIndex: 'raw',
      key: 'raw',
      ellipsis: true,
      render: (v: string) => v || '-',
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">任务中心</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchTasks(pagination.page)}>
            刷新
          </Button>
          <Button type="primary" onClick={() => navigate('/products')}>
            去导入商品
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1300 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page) => fetchTasks(page),
        }}
      />

      <Drawer
        title="任务详情"
        placement="right"
        width={640}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnHidden
      >
        {detailLoading || !detail ? (
          <p className="text-gray-400">加载中...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">任务名称</p>
              <p>{detail.name || detail.file_name || detail.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400 text-xs mb-1">状态</p>
                <Tag color={STATUS_COLOR[detail.status] || 'default'}>{detail.status}</Tag>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">类型</p>
                <p>{detail.type === 'export' ? '导出' : '导入'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">源文件</p>
                <p className="break-all">{detail.file_name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">创建时间</p>
                <p>{detail.created_at ? new Date(detail.created_at).toLocaleString('zh-CN') : '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">
                处理进度（成功 {detail.success_rows} 行 / 失败 {detail.fail_rows} 行 / 共 {detail.total_rows} 行）
              </p>
              <Progress
                percent={detail.total_rows ? Math.round((detail.processed_rows / detail.total_rows) * 100) : 0}
                status={detail.status === '失败' ? 'exception' : isPending(detail.status) ? 'active' : 'normal'}
              />
            </div>
            {detail.message && (
              <div>
                <p className="text-gray-400 text-xs mb-1">结果摘要</p>
                <p>{detail.message}</p>
              </div>
            )}
            {detail.errors && detail.errors.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs mb-2">失败明细（共 {detail.errors.length} 条）</p>
                <Table
                  size="small"
                  columns={errorColumns}
                  dataSource={detail.errors}
                  rowKey={(e) => `${e.row}-${e.field}-${e.message}`}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  scroll={{ y: 320 }}
                />
              </div>
            )}
            {detail.status === '失败' && !detail.message && !detail.errors?.length && (
              <p className="text-red-500">任务执行失败，但未记录具体原因，请查看服务端日志</p>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
