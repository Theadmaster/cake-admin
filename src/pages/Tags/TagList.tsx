import { useState, useEffect } from 'react'
import { Table, Button, Input, Tag, Space, Select, Modal, Form, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getTags, createTag, updateTag, deleteTag } from '@/api/tags'
import type { Tag as TagType } from '@/types'

export default function TagList() {
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [form] = Form.useForm()

  const fetchTags = async () => {
    try {
      setLoading(true)
      const res = await getTags({
        tag_group: selectedGroup,
        keyword: searchText,
      })
      const data = res.data.data
      if (Array.isArray(data)) {
        setTags(data)
      }
    } catch (error) {
      console.error('获取标签列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [selectedGroup])

  const handleAdd = () => {
    setEditingTag(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (tag: TagType) => {
    setEditingTag(tag)
    form.setFieldsValue(tag)
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该标签吗？删除后无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTag(id)
          message.success('删除成功')
          fetchTags()
        } catch (error) {
          console.error('删除失败:', error)
        }
      },
    })
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingTag) {
        await updateTag(editingTag.id, values)
        message.success('更新成功')
      } else {
        await createTag(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchTags()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleSearch = () => {
    fetchTags()
  }

  const columns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分组',
      dataIndex: 'tag_group',
      key: 'tag_group',
      render: (group: string) => {
        const colorMap: Record<string, string> = {
          '属性': 'blue',
          '风味': 'green',
          '场景': 'orange',
          '人群': 'purple',
        }
        return <Tag color={colorMap[group] || 'default'}>{group}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TagType) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
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
        <h2 className="text-2xl font-bold">标签管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增标签
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="搜索标签名称"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          className="w-64"
        />
        <Select
          placeholder="选择分组"
          allowClear
          value={selectedGroup}
          onChange={setSelectedGroup}
          className="w-40"
          options={[
            { value: '属性', label: '属性' },
            { value: '风味', label: '风味' },
            { value: '场景', label: '场景' },
            { value: '人群', label: '人群' },
          ]}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        loading={loading}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingTag ? '编辑标签' : '新增标签'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          <Form.Item
            name="tag_group"
            label="分组"
            rules={[{ required: true, message: '请选择分组' }]}
          >
            <Select
              placeholder="请选择分组"
              options={[
                { value: '属性', label: '属性' },
                { value: '风味', label: '风味' },
                { value: '场景', label: '场景' },
                { value: '人群', label: '人群' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
