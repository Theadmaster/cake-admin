import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Button, Card, Select, TimePicker, InputNumber, message } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { getBrandById, createBrand, updateBrand } from '@/api/brands'
import QiniuUpload from '@/components/QiniuUpload'
import type { Brand } from '@/types'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function BrandDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const isNew = id === 'new'

  useEffect(() => {
    if (!isNew && id) {
      fetchBrand(id)
    }
  }, [id, isNew])

  const fetchBrand = async (brandId: string) => {
    try {
      setLoading(true)
      const res = await getBrandById(brandId)
      const brand = res.data.data
      if (brand) {
        form.setFieldsValue({
          ...brand,
          release_stock_time: brand.release_stock_time
            ? dayjs(brand.release_stock_time, 'HH:mm:ss')
            : undefined,
        })
      }
    } catch (error) {
      console.error('获取品牌详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const onFinish = async (values: Partial<Brand>) => {
    try {
      setSaving(true)
      const data = {
        ...values,
        release_stock_time: values.release_stock_time
          ? dayjs(values.release_stock_time).format('HH:mm:ss')
          : null,
      }

      if (isNew) {
        await createBrand(data)
        message.success('创建成功')
      } else if (id) {
        await updateBrand(id, data)
        message.success('更新成功')
      }
      navigate('/brands')
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
          onClick={() => navigate('/brands')}
          className="mr-4"
        >
          返回
        </Button>
        <h2 className="text-2xl font-bold m-0">
          {isNew ? '新增品牌' : '编辑品牌'}
        </h2>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            rush_difficulty: '有货',
            is_active: true,
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="品牌名称"
              rules={[{ required: true, message: '请输入品牌名称' }]}
            >
              <Input placeholder="请输入品牌名称" />
            </Form.Item>

            <Form.Item
              name="slug"
              label="英文标识"
              rules={[{ required: true, message: '请输入英文标识' }]}
            >
              <Input placeholder="请输入英文标识（用于URL）" />
            </Form.Item>
          </div>

          <Form.Item
            name="logo_url"
            label="品牌Logo"
          >
            <QiniuUpload />
          </Form.Item>

          <Form.Item
            name="selling_point"
            label="一句话卖点"
          >
            <Input placeholder="请输入一句话卖点" />
          </Form.Item>

          <Form.Item
            name="description"
            label="品牌描述"
          >
            <TextArea rows={4} placeholder="请输入品牌描述" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="rush_difficulty"
              label="抢购难度"
            >
              <Select
                options={[
                  { value: '秒无', label: '秒无' },
                  { value: '热门', label: '热门' },
                  { value: '有货', label: '有货' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="advance_days"
              label="建议提前天数"
            >
              <InputNumber min={0} className="w-full" placeholder="请输入天数" />
            </Form.Item>
          </div>

          <Form.Item
            name="advance_booking_text"
            label="预订时间文案"
          >
            <Input placeholder="例如：提前3天预订" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="release_stock_day"
              label="放号日期"
            >
              <Select
                allowClear
                options={[
                  { value: '每天', label: '每天' },
                  { value: '周一', label: '周一' },
                  { value: '周二', label: '周二' },
                  { value: '周三', label: '周三' },
                  { value: '周四', label: '周四' },
                  { value: '周五', label: '周五' },
                  { value: '周六', label: '周六' },
                  { value: '周日', label: '周日' },
                  { value: '随机', label: '随机' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="release_stock_time"
              label="放号时间"
            >
              <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>
          </div>

          <Form.Item label="预定平台">
            <Form.List name="purchase_channels">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-2 mb-2">
                      <Form.Item {...restField} name={name} className="flex-1 mb-0">
                        <Input placeholder="请输入平台名称" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-full"
                  >
                    添加平台
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item label="配送方式">
            <Form.List name="pickup_methods">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-2 mb-2">
                      <Form.Item {...restField} name={name} className="flex-1 mb-0">
                        <Input placeholder="请输入配送方式" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-full"
                  >
                    添加配送方式
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item label="其他服务">
            <Form.List name="other_services">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-2 mb-2">
                      <Form.Item {...restField} name={name} className="flex-1 mb-0">
                        <Input placeholder="请输入服务内容" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-full"
                  >
                    添加服务
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="limit_rules"
            label="限购规则"
          >
            <TextArea rows={2} placeholder="请输入限购规则" />
          </Form.Item>

          <Form.Item
            name="purchase_notes"
            label="购买须知"
          >
            <TextArea rows={2} placeholder="请输入购买须知" />
          </Form.Item>

          <Form.Item
            name="contact_info"
            label="联系方式"
          >
            <Input placeholder="请输入联系方式" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-4">
              <Button onClick={() => navigate('/brands')}>取消</Button>
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
