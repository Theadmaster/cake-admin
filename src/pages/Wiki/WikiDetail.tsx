import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Button, Card, Select, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getWikiById, createWiki, updateWiki } from '@/api/wiki'
import type { WikiEntry } from '@/types'

const { TextArea } = Input

export default function WikiDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const isNew = id === 'new'

  useEffect(() => {
    if (!isNew && id) {
      fetchWiki(id)
    }
  }, [id, isNew])

  const fetchWiki = async (wikiId: string) => {
    try {
      setLoading(true)
      const res = await getWikiById(wikiId)
      const wiki = res.data.data
      if (wiki) {
        form.setFieldsValue(wiki)
      }
    } catch (error) {
      console.error('获取百科详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const onFinish = async (values: Partial<WikiEntry>) => {
    try {
      setSaving(true)
      if (isNew) {
        await createWiki(values)
        message.success('创建成功')
      } else if (id) {
        await updateWiki(id, values)
        message.success('更新成功')
      }
      navigate('/wiki')
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/wiki')}
          className="mr-4"
        >
          返回
        </Button>
        <h2 className="text-2xl font-bold m-0">
          {isNew ? '新增词条' : '编辑词条'}
        </h2>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="entry_name"
              label="词条名称"
              rules={[{ required: true, message: '请输入词条名称' }]}
            >
              <Input placeholder="请输入词条名称" />
            </Form.Item>

            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select
                placeholder="请选择分类"
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
            </Form.Item>
          </div>

          <Form.Item name="summary" label="摘要">
            <Input placeholder="请输入一句话简介" />
          </Form.Item>

          <Form.Item name="content" label="详细内容">
            <TextArea rows={10} placeholder="请输入详细内容" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-4">
              <Button onClick={() => navigate('/wiki')}>取消</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {isNew ? '创建' : '保存'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
