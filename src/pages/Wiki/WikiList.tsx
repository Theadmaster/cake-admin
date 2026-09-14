import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Tag, Space, Modal, message, Select } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getWikiEntries, deleteWiki } from '@/api/wiki'
import type { WikiEntry } from '@/types'

export default function WikiList() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  const fetchEntries = async (page = 1) => {
    try {
      setLoading(true)
      const res = await getWikiEntries({
        page,
        pageSize: pagination.pageSize,
        category: selectedCategory,
        keyword: searchText,
      })
      const data = res.data.data
      if (Array.isArray(data)) {
        setEntries(data)
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: data.length,
        }))
      }
    } catch (error) {
      console.error('获取百科列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries(1)
  }, [selectedCategory])

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该词条吗？删除后无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteWiki(id)
          message.success('删除成功')
          fetchEntries(pagination.current)
        } catch (error) {
          console.error('删除失败:', error)
        }
      },
    })
  }

  const handleSearch = () => {
    fetchEntries(1)
  }

  const columns = [
    {
      title: '词条名称',
      dataIndex: 'entry_name',
      key: 'entry_name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: '浏览次数',
      dataIndex: 'view_count',
      key: 'view_count',
      sorter: (a: WikiEntry, b: WikiEntry) => a.view_count - b.view_count,
    },
    {
      title: '收藏次数',
      dataIndex: 'favorite_count',
      key: 'favorite_count',
      sorter: (a: WikiEntry, b: WikiEntry) => a.favorite_count - b.favorite_count,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: WikiEntry) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/wiki/${record.id}`)}
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">百科管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/wiki/new')}
        >
          新增词条
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="搜索词条名称"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          className="w-64"
        />
        <Select
          placeholder="选择分类"
          allowClear
          value={selectedCategory}
          onChange={setSelectedCategory}
          className="w-40"
          options={[
            { value: '蛋糕胚', label: '蛋糕胚' },
            { value: '奶油', label: '奶油' },
            { value: '品类', label: '品类' },
            { value: '风味', label: '风味' },
            { value: '原料', label: '原料' },
            { value: '保存', label: '保存' },
            { value: '尺寸', label: '尺寸' },
            { value: '术语', label: '术语' },
          ]}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={entries}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page) => fetchEntries(page),
        }}
      />
    </div>
  )
}
