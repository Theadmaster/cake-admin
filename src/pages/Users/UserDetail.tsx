import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Descriptions, Avatar, Tabs, List } from 'antd'
import { ArrowLeftOutlined, UserOutlined, HeartOutlined, CommentOutlined } from '@ant-design/icons'
import { getUserById, getUserWants, getUserComments } from '@/api/users'
import type { User } from '@/types'

export default function UserDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [wants, setWants] = useState<unknown[]>([])
  const [comments, setComments] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchUserDetail(id)
    }
  }, [id])

  const fetchUserDetail = async (userId: string) => {
    try {
      setLoading(true)
      const [userRes, wantsRes, commentsRes] = await Promise.all([
        getUserById(userId),
        getUserWants(userId),
        getUserComments(userId),
      ])
      setUser(userRes.data.data || null)
      setWants(wantsRes.data.data || [])
      setComments(commentsRes.data.data || [])
    } catch (error) {
      console.error('获取用户详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const items = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="用户ID">{user?.id}</Descriptions.Item>
          <Descriptions.Item label="昵称">{user?.nickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="OpenID" span={2}>
            {user?.openid || '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'wants',
      label: (
        <span>
          <HeartOutlined /> 收藏商品
        </span>
      ),
      children: (
        <List
          dataSource={wants}
          locale={{ emptyText: '暂无收藏' }}
          renderItem={(item: unknown) => (
            <List.Item>
              <List.Item.Meta
                title={(item as { product_title?: string }).product_title || '未知商品'}
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'comments',
      label: (
        <span>
          <CommentOutlined /> 用户评论
        </span>
      ),
      children: (
        <List
          dataSource={comments}
          locale={{ emptyText: '暂无评论' }}
          renderItem={(item: unknown) => (
            <List.Item>
              <List.Item.Meta
                title={(item as { content?: string }).content || ''}
                description={(item as { created_at?: string }).created_at || ''}
              />
            </List.Item>
          )}
        />
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/users')}
          className="mr-4"
        >
          返回
        </Button>
        <h2 className="text-2xl font-bold m-0">用户详情</h2>
      </div>

      <Card loading={loading}>
        <div className="text-center mb-6">
          <Avatar size={80} src={user?.avatar_url} icon={<UserOutlined />} />
          <h3 className="mt-4 mb-0">{user?.nickname || '未设置昵称'}</h3>
        </div>

        <Tabs items={items} />
      </Card>
    </div>
  )
}
