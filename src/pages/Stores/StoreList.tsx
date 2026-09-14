import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Tag, Space, Modal, Select, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getStores, deleteStore } from '@/api/stores'
import { getBrands } from '@/api/brands'
import type { Store, Brand } from '@/types'

export default function StoreList() {
  const navigate = useNavigate()
  const [stores, setStores] = useState<Store[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>()

  const fetchStores = async () => {
    try {
      setLoading(true)
      const params: {
        brand_id?: string
        page?: number
        pageSize?: number
      } = {}
      if (selectedBrand) params.brand_id = selectedBrand

      const res = await getStores(params)
      setStores(res.data.data || [])
    } catch (error) {
      console.error('获取门店列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const res = await getBrands()
      setBrands(res.data.data || [])
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchStores()
  }, [selectedBrand])

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该门店吗？删除后无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteStore(id)
          message.success('删除成功')
          fetchStores()
        } catch (error) {
          console.error('删除失败:', error)
        }
      },
    })
  }

  const handleSearch = () => {
    fetchStores()
  }

  const columns = [
    {
      title: '门店名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left' as const,
      render: (text: string | null) => text || '-',
    },
    {
      title: '品牌',
      dataIndex: 'brand_id',
      key: 'brand_id',
      width: 100,
      render: (brandId: string) => {
        const brand = brands.find((b) => b.id === brandId)
        return brand?.name || '-'
      },
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: '区域',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      render: (text: string | null) => text || '-',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (text: string | null) => text || '-',
    },
    {
      title: '营业时间',
      dataIndex: 'business_hours',
      key: 'business_hours',
      width: 150,
      render: (text: string | null) => text || '-',
    },
    {
      title: '配送范围',
      dataIndex: 'delivery_range',
      key: 'delivery_range',
      width: 120,
      render: (text: string | null) => text || '-',
    },
    {
      title: '配送费',
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      width: 100,
      render: (fee: number | null) => fee != null ? `¥${fee}` : '-',
    },
    {
      title: '主门店',
      dataIndex: 'is_main',
      key: 'is_main',
      width: 80,
      render: (isMain: boolean) => (
        <Tag color={isMain ? 'blue' : 'default'}>
          {isMain ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (text: string) => text ? new Date(text).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: Store) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/stores/${record.id}`)}
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
        <h2 className="text-2xl font-bold">门店管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/stores/new')}
        >
          新增门店
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="搜索门店名称或地址"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          className="w-60"
        />
        <Select
          placeholder="选择品牌"
          allowClear
          value={selectedBrand}
          onChange={setSelectedBrand}
          className="w-40"
          options={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={stores}
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
