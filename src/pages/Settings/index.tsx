import { Card, Form, Input, Button, Switch, Divider, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

export default function Settings() {
  const onFinish = () => {
    message.success('保存成功')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">系统设置</h2>

      <Card title="基本设置" className="mb-6">
        <Form layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="site_name" label="站点名称">
              <Input placeholder="请输入站点名称" />
            </Form.Item>
            <Form.Item name="site_url" label="站点URL">
              <Input placeholder="请输入站点URL" />
            </Form.Item>
          </div>
          <Form.Item name="site_description" label="站点描述">
            <Input.TextArea rows={3} placeholder="请输入站点描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="通知设置" className="mb-6">
        <Form layout="vertical">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">邮件通知</div>
              <div className="text-gray-500 text-sm">开启后将发送邮件通知</div>
            </div>
            <Switch />
          </div>
          <Divider />
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">短信通知</div>
              <div className="text-gray-500 text-sm">开启后将发送短信通知</div>
            </div>
            <Switch />
          </div>
        </Form>
      </Card>

      <Card title="缓存管理">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">清除缓存</div>
            <div className="text-gray-500 text-sm">清除系统缓存数据</div>
          </div>
          <Button danger>清除缓存</Button>
        </div>
      </Card>
    </div>
  )
}
