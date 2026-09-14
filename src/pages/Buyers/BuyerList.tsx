import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Space, Tag, Avatar } from 'antd'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface Buyer {
  id: string
  user_id: string
  username: string
  nickname: string
  avatar_url: string
  phone: string
  level: number
  points: number
  total_orders: number
  total_spent: number
  is_active: boolean
  created_at: string
}

export default function BuyerList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Buyer[]>([])
  const [keyword, setKeyword] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchList = async (page = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users?user_type=buyer&keyword=${keyword}&page=${page}&pageSize=${pagination.pageSize}`)
      const json = await res.json()
      if (json.code === 0) {
        setData(json.data.list || [])
        setPagination(prev => ({ ...prev, current: page, total: json.data.pagination?.total || 0 }))
      }
    } catch (error) {
      console.error('获取买家列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const columns: ColumnsType<Buyer> = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar_url} icon={<UserOutlined />} />
          <div>
            <div>{record.nickname || record.username}</div>
            <div className="text-xs text-gray-400">{record.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '会员等级',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Tag color="blue">Lv.{level || 1}</Tag>,
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: '订单数',
      dataIndex: 'total_orders',
      key: 'total_orders',
    },
    {
      title: '消费金额',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (val) => `¥${(val || 0).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/buyers/${record.user_id}`)}>
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold m-0">买家管理</h2>
        <Space>
          <Input
            placeholder="搜索昵称/手机号"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => fetchList()}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={() => fetchList()}>搜索</Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page) => fetchList(page),
        }}
      />
    </div>
  )
}
