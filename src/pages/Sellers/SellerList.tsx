import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Space, Tag, message, Modal } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface Seller {
  id: string
  user_id: string
  username: string
  nickname: string
  phone: string
  brand_name: string
  brand_id: string
  store_name: string
  position: string
  is_active: boolean
  created_at: string
}

export default function SellerList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Seller[]>([])
  const [keyword, setKeyword] = useState('')

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users?user_type=seller&keyword=${keyword}`)
      const json = await res.json()
      if (json.code === 0) {
        setData(json.data.list || [])
      }
    } catch (error) {
      console.error('获取卖家列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该卖家账号吗？',
      onOk: async () => {
        try {
          const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
          const json = await res.json()
          if (json.code === 0) {
            message.success('删除成功')
            fetchList()
          }
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<Seller> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '所属品牌',
      dataIndex: 'brand_name',
      key: 'brand_name',
      render: (text) => text || '-',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/sellers/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold m-0">卖家管理</h2>
        <Space>
          <Input
            placeholder="搜索用户名/昵称"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={fetchList}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/sellers/new')}>
            新增卖家
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}
