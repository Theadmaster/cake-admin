import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Space, Tag, message, Modal } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface Operator {
  id: string
  user_id: string
  username: string
  nickname: string
  phone: string
  real_name: string
  department: string
  role_name: string
  is_active: boolean
  last_login_at: string
  created_at: string
}

export default function OperatorList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Operator[]>([])
  const [keyword, setKeyword] = useState('')

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users?user_type=operator&keyword=${keyword}`)
      const json = await res.json()
      if (json.code === 0) {
        setData(json.data.list || [])
      }
    } catch (error) {
      console.error('获取运营人员列表失败:', error)
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
      content: '确定要删除该运营人员吗？',
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

  const columns: ColumnsType<Operator> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
      render: (text) => text || '-',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (text) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role_name',
      key: 'role_name',
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
      title: '最后登录',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (text) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/operators/${record.id}`)}
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
        <h2 className="text-xl font-semibold m-0">运营人员</h2>
        <Space>
          <Input
            placeholder="搜索用户名/姓名"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={fetchList}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/operators/new')}>
            新增运营
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
