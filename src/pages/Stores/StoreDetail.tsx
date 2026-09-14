import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Button, Card, Select, Switch, InputNumber, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getStoreById, createStore, updateStore } from '@/api/stores'
import { getBrands } from '@/api/brands'
import type { Store, Brand } from '@/types'

export default function StoreDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const isNew = id === 'new'

  useEffect(() => {
    fetchBrands()
    if (!isNew && id) {
      fetchStore(id)
    }
  }, [id, isNew])

  const fetchBrands = async () => {
    try {
      const res = await getBrands()
      setBrands(res.data.data || [])
    } catch (error) {
      console.error('获取品牌列表失败:', error)
    }
  }

  const fetchStore = async (storeId: string) => {
    try {
      setLoading(true)
      const res = await getStoreById(storeId)
      const store = res.data.data
      if (store) {
        form.setFieldsValue(store)
      }
    } catch (error) {
      console.error('获取门店详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const onFinish = async (values: Partial<Store>) => {
    try {
      setSaving(true)
      if (isNew) {
        await createStore(values)
        message.success('创建成功')
      } else if (id) {
        await updateStore(id, values)
        message.success('更新成功')
      }
      navigate('/stores')
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
          onClick={() => navigate('/stores')}
          className="mr-4"
        >
          返回
        </Button>
        <h2 className="text-2xl font-bold m-0">
          {isNew ? '新增门店' : '编辑门店'}
        </h2>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            is_main: false,
            is_active: true,
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="brand_id"
              label="所属品牌"
              rules={[{ required: true, message: '请选择品牌' }]}
            >
              <Select
                placeholder="请选择品牌"
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="门店名称"
            >
              <Input placeholder="请输入门店名称" />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="门店地址"
            rules={[{ required: true, message: '请输入门店地址' }]}
          >
            <Input placeholder="请输入门店地址" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="area" label="区域">
              <Input placeholder="请输入区域" />
            </Form.Item>

            <Form.Item name="phone" label="联系电话">
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="lat" label="纬度">
              <InputNumber className="w-full" placeholder="请输入纬度" />
            </Form.Item>

            <Form.Item name="lng" label="经度">
              <InputNumber className="w-full" placeholder="请输入经度" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="business_hours" label="营业时间">
              <Input placeholder="例如：09:00-21:00" />
            </Form.Item>

            <Form.Item name="delivery_range" label="配送范围">
              <Input placeholder="请输入配送范围" />
            </Form.Item>
          </div>

          <Form.Item name="delivery_fee" label="配送费">
            <InputNumber
              className="w-full"
              min={0}
              precision={2}
              placeholder="请输入配送费"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="is_main" label="是否主门店" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="is_active" label="是否启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.Item>
            <div className="flex justify-end gap-4">
              <Button onClick={() => navigate('/stores')}>取消</Button>
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
