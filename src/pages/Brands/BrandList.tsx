import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Tag, Space, Modal, Image, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getBrands, deleteBrand } from '@/api/brands'
import type { Brand } from '@/types'

export default function BrandList() {
  const navigate = useNavigate()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const res = await getBrands()
      setBrands(res.data.data || [])
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该品牌吗？删除后无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteBrand(id)
          message.success('删除成功')
          fetchBrands()
        } catch (error) {
          console.error('删除失败:', error)
        }
      },
    })
  }

  const columns = [
    {
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '英文标识',
      dataIndex: 'slug',
      key: 'slug',
      width: 100,
    },
    {
      title: 'Logo',
      dataIndex: 'logo_url',
      key: 'logo_url',
      width: 80,
      render: (url: string | null) => url ? <Image src={url} alt="logo" width={32} height={32} className="object-contain" /> : '-',
    },
    {
      title: '一句话卖点',
      dataIndex: 'selling_point',
      key: 'selling_point',
      width: 150,
      ellipsis: true,
      render: (text: string | null) => text || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text: string | null) => text || '-',
    },
    {
      title: '抢购难度',
      dataIndex: 'rush_difficulty',
      key: 'rush_difficulty',
      width: 100,
      render: (difficulty: string) => {
        const colorMap: Record<string, string> = {
          '秒无': 'red',
          '热门': 'orange',
          '有货': 'green',
        }
        return <Tag color={colorMap[difficulty] || 'default'}>{difficulty}</Tag>
      },
    },
    {
      title: '配送方式',
      dataIndex: 'pickup_methods',
      key: 'pickup_methods',
      width: 150,
      render: (methods: string[] | null) => {
        if (!methods || methods.length === 0) return '-'
        return methods.map((m, i) => <Tag key={i}>{m}</Tag>)
      },
    },
    {
      title: '预定平台',
      dataIndex: 'purchase_channels',
      key: 'purchase_channels',
      width: 150,
      render: (channels: string[] | null) => {
        if (!channels || channels.length === 0) return '-'
        return channels.map((c, i) => <Tag key={i} color="blue">{c}</Tag>)
      },
    },
    {
      title: '放号日期',
      dataIndex: 'release_stock_day',
      key: 'release_stock_day',
      width: 100,
      render: (day: string | null) => day || '-',
    },
    {
      title: '放号时间',
      dataIndex: 'release_stock_time',
      key: 'release_stock_time',
      width: 100,
      render: (time: string | null) => time || '-',
    },
    {
      title: '预订文案',
      dataIndex: 'advance_booking_text',
      key: 'advance_booking_text',
      width: 120,
      ellipsis: true,
      render: (text: string | null) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      fixed: 'right' as const,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: Brand) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/brands/${record.id}`)}
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

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchText.toLowerCase()) ||
      brand.slug.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">品牌管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/brands/new')}
        >
          新增品牌
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="搜索品牌名称或英文标识"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-80"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredBrands}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1500 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  )
}
