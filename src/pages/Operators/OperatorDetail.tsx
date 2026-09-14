import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Button, Card, message, Space } from 'antd'

export default function OperatorDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEdit = id && id !== 'new'

  useEffect(() => {
    if (isEdit) {
      fetchDetail()
    }
  }, [id])

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
          real_name: user.business_info?.real_name,
          department: user.business_info?.department,
          role_name: user.business_info?.role_name,
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
          user_type: 'operator',
        }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success(isEdit ? '更新成功' : '创建成功')
        navigate('/operators')
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
      <h2 className="text-xl font-semibold mb-4">{isEdit ? '编辑运营人员' : '新增运营人员'}</h2>
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
            name="real_name"
            label="真实姓名"
          >
            <Input placeholder="真实姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input placeholder="联系电话" />
          </Form.Item>

          <Form.Item
            name="department"
            label="部门"
          >
            <Select placeholder="选择部门">
              <Select.Option value="运营部">运营部</Select.Option>
              <Select.Option value="内容部">内容部</Select.Option>
              <Select.Option value="客服部">客服部</Select.Option>
              <Select.Option value="技术部">技术部</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="role_name"
            label="角色"
          >
            <Select placeholder="选择角色">
              <Select.Option value="运营专员">运营专员</Select.Option>
              <Select.Option value="内容编辑">内容编辑</Select.Option>
              <Select.Option value="客服主管">客服主管</Select.Option>
              <Select.Option value="运营主管">运营主管</Select.Option>
            </Select>
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
              <Button onClick={() => navigate('/operators')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
