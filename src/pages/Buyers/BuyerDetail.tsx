import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Descriptions, Tag, Avatar, Button, Statistic, Row, Col, Table } from 'antd'
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons'

export default function BuyerDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [, setLoading] = useState(false)
  const [buyer, setBuyer] = useState<any>(null)
  const [wants, setWants] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      fetchDetail()
      fetchWants()
      fetchComments()
    }
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${id}`)
      const json = await res.json()
      if (json.code === 0) {
        setBuyer({
          ...json.data,
          ...json.data.business_info,
        })
      }
    } catch (error) {
      console.error('获取详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWants = async () => {
    try {
      const res = await fetch(`/api/users/${id}/wants`)
      const json = await res.json()
      if (json.code === 0) {
        setWants(json.data || [])
      }
    } catch (error) {
      console.error('获取收藏失败:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/users/${id}/comments`)
      const json = await res.json()
      if (json.code === 0) {
        setComments(json.data || [])
      }
    } catch (error) {
      console.error('获取评论失败:', error)
    }
  }

  if (!buyer) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/buyers')}>返回</Button>
        <h2 className="text-xl font-semibold m-0">买家详情</h2>
      </div>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic title="会员等级" value={`Lv.${buyer.level || 1}`} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="积分" value={buyer.points || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="订单数" value={buyer.total_orders || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="消费金额" value={buyer.total_spent || 0} prefix="¥" precision={2} />
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <div className="flex items-center gap-4 mb-4">
          <Avatar src={buyer.avatar_url} size={64} icon={<UserOutlined />} />
          <div>
            <h3 className="m-0">{buyer.nickname || buyer.username}</h3>
            <Tag color={buyer.is_active ? 'green' : 'red'}>
              {buyer.is_active ? '正常' : '禁用'}
            </Tag>
          </div>
        </div>
        <Descriptions column={2}>
          <Descriptions.Item label="用户ID">{buyer.id}</Descriptions.Item>
          <Descriptions.Item label="用户名">{buyer.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{buyer.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {buyer.created_at ? new Date(buyer.created_at).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="收藏商品" className="mb-4">
        <Table
          dataSource={wants}
          rowKey="product_id"
          pagination={false}
          columns={[
            { title: '商品', dataIndex: 'product_title', key: 'product_title' },
            { title: '热度', dataIndex: 'heat_score', key: 'heat_score' },
            { title: '评分', dataIndex: 'rating', key: 'rating' },
            { title: '收藏时间', dataIndex: 'created_at', key: 'created_at', 
              render: (text) => text ? new Date(text).toLocaleDateString() : '-' },
          ]}
        />
      </Card>

      <Card title="评论记录">
        <Table
          dataSource={comments}
          rowKey="id"
          pagination={false}
          columns={[
            { title: '商品', dataIndex: 'product_title', key: 'product_title' },
            { title: '评论内容', dataIndex: 'content', key: 'content', ellipsis: true },
            { title: '评分', dataIndex: 'rating', key: 'rating',
              render: (val) => val ? `${val}分` : '-' },
            { title: '评论时间', dataIndex: 'created_at', key: 'created_at',
              render: (text) => text ? new Date(text).toLocaleDateString() : '-' },
          ]}
        />
      </Card>
    </div>
  )
}
