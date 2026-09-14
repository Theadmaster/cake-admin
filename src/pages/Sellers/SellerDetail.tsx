import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Button, Card, message, Space } from 'antd'

export default function SellerDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<any[]>([])
  const isEdit = id && id !== 'new'

  useEffect(() => {
    fetchBrands()
    if (isEdit) {
      fetchDetail()
    }
  }, [id])

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands')
      const json = await res.json()
      if (json.code === 0) {
        setBrands(json.data || [])
      }
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    }
  }

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/users/${id}`)
      const json = await res.json()
      if (json.code === 0) {
        const user = json.data
        form.setFieldsValue({
          username: user.username,
          nickname: user.nickname,
          phone: user.phone,
          brand_id: user.business_info?.brand_id,
          position: user.business_info?.position,
          is_active: user.is_active,
        })
      }
    } catch (error) {
      console.error('获取详情失败:', error)
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const url = isEdit ? `/api/users/${id}` : '/api/users'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          user_type: 'seller',
        }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success(isEdit ? '更新成功' : '创建成功')
        navigate('/sellers')
      } else {
        message.error(json.message || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{isEdit ? '编辑卖家' : '新增卖家'}</h2>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用于登录" disabled={!!isEdit} />
          </Form.Item>

          {!isEdit && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="初始密码" />
            </Form.Item>
          )}

          <Form.Item
            name="nickname"
            label="昵称"
          >
            <Input placeholder="显示名称" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input placeholder="联系电话" />
          </Form.Item>

          <Form.Item
            name="brand_id"
            label="所属品牌"
            rules={[{ required: true, message: '请选择品牌' }]}
          >
            <Select placeholder="选择品牌">
              {brands.map((brand) => (
                <Select.Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="职位"
          >
            <Input placeholder="如：店长、店员" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="状态"
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>启用</Select.Option>
              <Select.Option value={false}>禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate('/sellers')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
