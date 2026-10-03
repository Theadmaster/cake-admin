import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Tag, Space, Modal, Select, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { getProducts, deleteProduct } from '@/api/products'
import { getBrands } from '@/api/brands'
import ImportProductsModal from '@/components/ImportProductsModal'
import type { Product, Brand } from '@/types'

export default function ProductList() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>()
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>()
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [importOpen, setImportOpen] = useState(false)

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pagination.pageSize),
      })
      if (keyword) params.set('keyword', keyword)
      if (selectedBrand) params.set('brand_id', selectedBrand)
      if (selectedStatus) params.set('status', selectedStatus)

      const res = await getProducts(params.toString())
      const data = res.data.data
      setProducts(data?.list || [])
      setPagination((prev) => ({ ...prev, page, total: data?.pagination?.total || 0 }))
    } catch (error) {
      console.error('获取商品列表失败:', error)
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
    fetchProducts(1)
  }, [selectedBrand, selectedStatus])

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该商品吗？删除后无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteProduct(id)
          message.success('删除成功')
          fetchProducts(pagination.page)
        } catch (error) {
          console.error('删除失败:', error)
        }
      },
    })
  }

  const handleSearch = () => {
    fetchProducts(1)
  }

  const columns = [
    {
      title: '商品图片',
      dataIndex: 'cover_image_url',
      key: 'cover_image_url',
      width: 80,
      render: (url: string | null) => {
        if (!url) return '-'
        return (
          <img
            src={url}
            alt="商品图片"
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
          />
        )
      },
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left' as const,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
    },
    {
      title: '规格',
      dataIndex: 'size',
      key: 'size',
      width: 80,
      render: (text: string | null) => text || '-',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number | string) => price ? `¥${price}` : '-',
    },
    {
      title: '预订方式',
      dataIndex: 'booking',
      key: 'booking',
      width: 120,
      render: (text: string | null) => text || '-',
    },
    {
      title: '预订分组',
      dataIndex: 'bookingGroup',
      key: 'bookingGroup',
      width: 100,
      render: (text: string | null) => text || '-',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating: number | null) => rating?.toFixed(1) || '-',
    },
    {
      title: '评价数',
      dataIndex: 'reviews',
      key: 'reviews',
      width: 80,
    },
    {
      title: '人气标签',
      dataIndex: 'heatTag',
      key: 'heatTag',
      width: 100,
      render: (tag: string | null) => {
        if (!tag) return '-'
        const colorMap: Record<string, string> = {
          '糕圈纯元': 'gold',
          '双高爆款': 'red',
          '小众之选': 'green',
          '新品观察': 'blue',
          '冷门好物': 'default',
        }
        return <Tag color={colorMap[tag] || 'default'}>{tag}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${record.id}`)}
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
        <h2 className="text-2xl font-bold">商品管理</h2>
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setImportOpen(true)}
          >
            批量导入
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/new')}
          >
            新增商品
          </Button>
        </Space>
      </div>

      <ImportProductsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          setImportOpen(false)
          navigate('/tasks')
        }}
      />

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="搜索商品名称"
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
        <Select
          placeholder="商品状态"
          allowClear
          value={selectedStatus}
          onChange={setSelectedStatus}
          className="w-32"
          options={[
            { value: '在架', label: '在架' },
            { value: '下架', label: '下架' },
            { value: '缺货', label: '缺货' },
          ]}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1500 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page) => fetchProducts(page),
        }}
      />
    </div>
  )
}
