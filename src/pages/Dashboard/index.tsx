import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import {
  ShopOutlined,
  GiftOutlined,
  UserOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import Chart from '@/components/Charts'
import { getBrands } from '@/api/brands'
import { getProducts } from '@/api/products'
import type { Brand, Product } from '@/types'

export default function Dashboard() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [brandsRes, productsRes] = await Promise.all([
          getBrands(),
          getProducts({ pageSize: 10 }),
        ])
        setBrands(brandsRes.data.data || [])
        setProducts(productsRes.data.data?.list || [])
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 品牌分布饼图配置
  const getBrandPieOption = () => {
    const distribution: Record<string, number> = {}
    brands.forEach((brand) => {
      const key = brand.rush_difficulty || '未知'
      distribution[key] = (distribution[key] || 0) + 1
    })

    return {
      title: {
        text: '品牌分布',
        subtext: '按抢购难度',
        left: 'center',
      },
      tooltip: {
        trigger: 'item' as const,
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical' as const,
        left: 'left',
      },
      series: [
        {
          name: '抢购难度',
          type: 'pie' as const,
          radius: '50%',
          data: Object.entries(distribution).map(([name, value]) => ({
            name,
            value,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }
  }

  // 评分分布柱状图配置
  const getRatingBarOption = () => {
    const ranges = [
      { label: '0-1分', min: 0, max: 1 },
      { label: '1-2分', min: 1, max: 2 },
      { label: '2-3分', min: 2, max: 3 },
      { label: '3-4分', min: 3, max: 4 },
      { label: '4-5分', min: 4, max: 5 },
    ]

    const distribution = ranges.map((range) => {
      const count = products.filter((p) => {
        const rating = p.rating || 0
        return rating >= range.min && rating < range.max
      }).length
      return { name: range.label, value: count }
    })

    return {
      title: {
        text: '商品评分分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: {
          type: 'shadow' as const,
        },
      },
      xAxis: {
        type: 'category' as const,
        data: distribution.map((d) => d.name),
      },
      yAxis: {
        type: 'value' as const,
      },
      series: [
        {
          name: '商品数量',
          type: 'bar' as const,
          data: distribution.map((d) => d.value),
          itemStyle: {
            color: '#1677ff',
          },
        },
      ],
    }
  }

  const brandColumns = [
    {
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '抢购难度',
      dataIndex: 'rush_difficulty',
      key: 'rush_difficulty',
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
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '启用' : '禁用'}
        </Tag>
      ),
    },
  ]

  const productColumns = [
    {
      title: '商品名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '品牌',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: '热度',
      dataIndex: 'heat_score',
      key: 'heat_score',
      sorter: (a: Product, b: Product) => a.heat_score - b.heat_score,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number | null) => rating?.toFixed(1) || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          '在架': 'green',
          '下架': 'red',
          '缺货': 'orange',
        }
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>
      },
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">数据看板</h2>
      
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="品牌总数"
              value={brands.length}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={products.length}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card title="品牌分布">
            <Chart option={getBrandPieOption()} style={{ height: '350px' }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="评分分布">
            <Chart option={getRatingBarOption()} style={{ height: '350px' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="品牌列表" className="mb-6">
            <Table
              columns={brandColumns}
              dataSource={brands}
              loading={loading}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门商品 TOP10" className="mb-6">
            <Table
              columns={productColumns}
              dataSource={products}
              loading={loading}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
