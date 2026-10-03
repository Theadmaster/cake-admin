import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Button, Card, Select, InputNumber, message, Tabs, Table, Popconfirm, Slider, Space } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { getProductById, createProduct, updateProduct } from '@/api/products'
import { getBrands } from '@/api/brands'
import QiniuUpload from '@/components/QiniuUpload'
import MultiQiniuUpload from '@/components/MultiQiniuUpload'
import type { ProductSku, Brand, TasteScore, AromaNote, FlavorConclusion, ProductLayer, ProductAromaTag, ProductReview } from '@/types'

const { TextArea } = Input

export default function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [skus, setSkus] = useState<ProductSku[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  
  // 关联表状态
  const [tasteScores, setTasteScores] = useState<TasteScore | null>(null)
  const [aromaNotes, setAromaNotes] = useState<AromaNote[]>([])
  const [flavorConclusions, setFlavorConclusions] = useState<FlavorConclusion | null>(null)
  const [productLayers, setProductLayers] = useState<ProductLayer[]>([])
  const [productAromaTags, setProductAromaTags] = useState<ProductAromaTag[]>([])
  const [productReviews, setProductReviews] = useState<ProductReview[]>([])
  
  const isNew = id === 'new'

  useEffect(() => {
    fetchBrands()
    if (!isNew && id) {
      fetchProduct(id)
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

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true)
      const res = await getProductById(productId)
      const product = res.data.data
      if (product) {
        form.setFieldsValue(product)
        // 详情接口返回的是 H5 结构(size/sizeDetail/people)，需归一化为 SKU 表格使用的字段名
        const normalizedSkus: ProductSku[] = (product.skus || []).map((s: any, i: number) => ({
          id: s.id,
          product_id: s.product_id ?? product.id,
          size_label: s.size_label ?? s.size ?? '',
          size_detail: s.size_detail ?? s.sizeDetail ?? '',
          people_range: s.people_range ?? s.people ?? '',
          price: s.price ?? 0,
          status: s.status ?? '在架',
          sort_order: s.sort_order ?? i,
          created_at: s.created_at ?? new Date().toISOString(),
        }))
        setSkus(normalizedSkus)
        setImageUrls(product.image_urls || [])
        // 设置关联表数据
        setTasteScores(product.taste_scores || null)
        setAromaNotes(product.aroma_notes || [])
        setFlavorConclusions(product.flavor_conclusions || null)
        setProductLayers(product.product_layers || [])
        setProductAromaTags(product.product_aroma_tags || [])
        setProductReviews(product.product_reviews || [])
      }
    } catch (error) {
      console.error('获取商品详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const onFinish = async () => {
    try {
      setSaving(true)
      // Tabs 仅挂载当前面板，values 会丢失未访问 tab 的字段（如状态配置），
      // 用 getFieldsValue(true) 取完整存储值，避免保存时把其他 tab 字段重置为默认值
      const data = {
        ...form.getFieldsValue(true),
        skus,
        image_urls: imageUrls,
        taste_scores: tasteScores,
        aroma_notes: aromaNotes,
        flavor_conclusions: flavorConclusions,
        product_layers: productLayers,
        product_aroma_tags: productAromaTags,
        product_reviews: productReviews,
      }
      if (isNew) {
        await createProduct(data)
        message.success('创建成功')
      } else if (id) {
        await updateProduct(id, data)
        message.success('更新成功')
      }
      navigate('/products')
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setSaving(false)
    }
  }

  // SKU 管理
  const addSku = () => {
    setSkus([...skus, {
      id: `temp-${Date.now()}`,
      product_id: id || '',
      size_label: '',
      size_detail: '',
      people_range: '',
      price: 0,
      status: '在架',
      sort_order: skus.length,
      created_at: new Date().toISOString(),
    }])
  }

  const removeSku = (index: number) => {
    setSkus(skus.filter((_, i) => i !== index))
  }

  const updateSku = (index: number, field: string, value: any) => {
    const newSkus = [...skus]
    newSkus[index] = { ...newSkus[index], [field]: value }
    setSkus(newSkus)
  }

  // 口味评分管理
  const updateTasteScore = (field: keyof TasteScore, value: any) => {
    setTasteScores(prev => ({
      id: prev?.id || `temp-${Date.now()}`,
      product_id: id || '',
      sweetness: prev?.sweetness ?? null,
      sweetness_desc: prev?.sweetness_desc ?? null,
      sourness: prev?.sourness ?? null,
      sourness_desc: prev?.sourness_desc ?? null,
      bitterness: prev?.bitterness ?? null,
      bitterness_desc: prev?.bitterness_desc ?? null,
      saltiness: prev?.saltiness ?? null,
      saltiness_desc: prev?.saltiness_desc ?? null,
      umami: prev?.umami ?? null,
      umami_desc: prev?.umami_desc ?? null,
      ...prev,
      [field]: value,
    }))
  }

  // 香气阶段管理
  const addAromaNote = (stage: '前调' | '中调' | '后调') => {
    setAromaNotes([...aromaNotes, {
      id: `temp-${Date.now()}`,
      product_id: id || '',
      stage,
      stage_label: stage === '前调' ? '入口瞬间' : stage === '中调' ? '咀嚼时' : '咽下余韵',
      summary: '',
      detail: '',
      sort_order: aromaNotes.length,
    }])
  }

  const removeAromaNote = (index: number) => {
    setAromaNotes(aromaNotes.filter((_, i) => i !== index))
  }

  const updateAromaNote = (index: number, field: keyof AromaNote, value: any) => {
    const newNotes = [...aromaNotes]
    newNotes[index] = { ...newNotes[index], [field]: value }
    setAromaNotes(newNotes)
  }

  // 风味结论管理
  const updateFlavorConclusion = (field: keyof FlavorConclusion, value: any) => {
    setFlavorConclusions(prev => ({
      id: prev?.id || `temp-${Date.now()}`,
      product_id: id || '',
      summary: prev?.summary ?? null,
      content: prev?.content ?? null,
      ...prev,
      [field]: value,
    }))
  }

  // 配料层次管理
  const addProductLayer = () => {
    setProductLayers([...productLayers, {
      id: `temp-${Date.now()}`,
      product_id: id || '',
      layer_type: '中层',
      layer_name: '',
      ingredients: '',
      mouthfeel: '',
      highlight: '',
      sort_order: productLayers.length,
    }])
  }

  const removeProductLayer = (index: number) => {
    setProductLayers(productLayers.filter((_, i) => i !== index))
  }

  const updateProductLayer = (index: number, field: keyof ProductLayer, value: any) => {
    const newLayers = [...productLayers]
    newLayers[index] = { ...newLayers[index], [field]: value }
    setProductLayers(newLayers)
  }

  // 香气标签管理
  const addAromaTag = () => {
    setProductAromaTags([...productAromaTags, {
      id: `temp-${Date.now()}`,
      product_id: id || '',
      tag_name: '',
    }])
  }

  const removeAromaTag = (index: number) => {
    setProductAromaTags(productAromaTags.filter((_, i) => i !== index))
  }

  const updateAromaTag = (index: number, value: string) => {
    const newTags = [...productAromaTags]
    newTags[index] = { ...newTags[index], tag_name: value }
    setProductAromaTags(newTags)
  }

  // 口碑管理
  const addProductReview = () => {
    setProductReviews([...productReviews, {
      id: `temp-${Date.now()}`,
      product_id: id || '',
      review_type: '好评',
      content: '',
      feedback_count: 1,
      sort_order: productReviews.length,
    }])
  }

  const removeProductReview = (index: number) => {
    setProductReviews(productReviews.filter((_, i) => i !== index))
  }

  const updateProductReview = (index: number, field: keyof ProductReview, value: any) => {
    const newReviews = [...productReviews]
    newReviews[index] = { ...newReviews[index], [field]: value }
    setProductReviews(newReviews)
  }

  const skuColumns = [
    {
      title: '规格名称',
      dataIndex: 'size_label',
      width: 120,
      render: (_: any, __: any, index: number) => (
        <Input
          value={skus[index].size_label}
          onChange={(e) => updateSku(index, 'size_label', e.target.value)}
          placeholder="如：6寸"
          size="small"
        />
      ),
    },
    {
      title: '规格详情',
      dataIndex: 'size_detail',
      width: 150,
      render: (_: any, __: any, index: number) => (
        <Input
          value={skus[index].size_detail || ''}
          onChange={(e) => updateSku(index, 'size_detail', e.target.value)}
          placeholder="如：直径15cm"
          size="small"
        />
      ),
    },
    {
      title: '适合人数',
      dataIndex: 'people_range',
      width: 120,
      render: (_: any, __: any, index: number) => (
        <Input
          value={skus[index].people_range || ''}
          onChange={(e) => updateSku(index, 'people_range', e.target.value)}
          placeholder="如：4-6人"
          size="small"
        />
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 120,
      render: (_: any, __: any, index: number) => (
        <InputNumber
          value={skus[index].price}
          onChange={(val) => updateSku(index, 'price', val || 0)}
          min={0}
          precision={2}
          size="small"
          className="w-full"
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_: any, __: any, index: number) => (
        <Select
          value={skus[index].status}
          onChange={(val) => updateSku(index, 'status', val)}
          size="small"
          options={[
            { value: '在架', label: '在架' },
            { value: '下架', label: '下架' },
            { value: '缺货', label: '缺货' },
          ]}
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <InputNumber
          value={skus[index].sort_order}
          onChange={(val) => updateSku(index, 'sort_order', val || 0)}
          min={0}
          size="small"
          className="w-full"
        />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Popconfirm
          title="确定删除此SKU？"
          onConfirm={() => removeSku(index)}
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ]

  const items = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <>
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
              name="title"
              label="商品标题"
              rules={[{ required: true, message: '请输入商品标题' }]}
            >
              <Input placeholder="请输入商品标题" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="分类">
              <Select
                placeholder="请选择分类"
                options={[
                  { value: '蛋糕', label: '蛋糕' },
                  { value: '千层', label: '千层' },
                  { value: '慕斯', label: '慕斯' },
                  { value: '挞', label: '挞' },
                ]}
              />
            </Form.Item>

            <Form.Item name="cake_base" label="蛋糕胚类型">
              <Input placeholder="请输入蛋糕胚类型" />
            </Form.Item>
          </div>

          <Form.Item name="ingredient_text" label="配料描述">
            <TextArea rows={3} placeholder="请输入配料描述" />
          </Form.Item>

          <Form.Item name="notes" label="注意事项">
            <TextArea rows={2} placeholder="请输入注意事项" />
          </Form.Item>

          <Form.Item name="cover_image_url" label="封面图">
            <QiniuUpload
              value={form.getFieldValue('cover_image_url')}
              onChange={(url) => form.setFieldsValue({ cover_image_url: url })}
              maxCount={1}
            />
          </Form.Item>

          <Form.Item label="商品图片列表">
            <MultiQiniuUpload
              value={imageUrls}
              onChange={(urls) => setImageUrls(urls)}
              maxCount={9}
            />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'status',
      label: '状态配置',
      children: (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Form.Item name="status" label="商品状态">
              <Select
                options={[
                  { value: '在架', label: '在架' },
                  { value: '下架', label: '下架' },
                  { value: '缺货', label: '缺货' },
                ]}
              />
            </Form.Item>

            <Form.Item name="heat_score" label="热度分">
              <InputNumber min={0} className="w-full" placeholder="不限上限" />
            </Form.Item>

            <Form.Item name="popularity_tag" label="人气标签">
              <Select
                allowClear
                options={[
                  { value: '糕圈纯元', label: '糕圈纯元' },
                  { value: '双高爆款', label: '双高爆款' },
                  { value: '小众之选', label: '小众之选' },
                  { value: '新品观察', label: '新品观察' },
                  { value: '冷门好物', label: '冷门好物' },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="rating" label="综合评分">
              <InputNumber min={0} max={5} step={0.1} className="w-full" />
            </Form.Item>

            <Form.Item name="rating_count" label="评价人数">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
        </>
      ),
    },
    {
      key: 'skus',
      label: 'SKU管理',
      children: (
        <>
          <div className="mb-4">
            <Button type="dashed" onClick={addSku} icon={<PlusOutlined />} block>
              添加SKU
            </Button>
          </div>
          <Table
            columns={skuColumns}
            dataSource={skus}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </>
      ),
    },
    {
      key: 'taste',
      label: '口味评分',
      children: (
        <div className="space-y-6">
          {[
            { key: 'sweetness', label: '甜度', descKey: 'sweetness_desc' },
            { key: 'sourness', label: '酸度', descKey: 'sourness_desc' },
            { key: 'bitterness', label: '苦度', descKey: 'bitterness_desc' },
            { key: 'saltiness', label: '咸度', descKey: 'saltiness_desc' },
            { key: 'umami', label: '鲜味', descKey: 'umami_desc' },
          ].map(({ key, label, descKey }) => (
            <div key={key} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-2">
                <div className="font-medium mb-2">{label}</div>
                <Slider
                  min={0}
                  max={5}
                  step={0.1}
                  value={tasteScores?.[key as keyof TasteScore] as number || 0}
                  onChange={(val) => updateTasteScore(key as keyof TasteScore, val)}
                />
                <InputNumber
                  min={0}
                  max={5}
                  step={0.1}
                  precision={1}
                  value={tasteScores?.[key as keyof TasteScore] as number || 0}
                  onChange={(val) => updateTasteScore(key as keyof TasteScore, val || 0)}
                  className="w-full mt-1"
                  size="small"
                />
              </div>
              <div className="col-span-10">
                <div className="text-sm text-gray-500 mb-1">{label}描述</div>
                <TextArea
                  rows={2}
                  value={tasteScores?.[descKey as keyof TasteScore] as string || ''}
                  onChange={(e) => updateTasteScore(descKey as keyof TasteScore, e.target.value)}
                  placeholder={`请输入${label}描述`}
                />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'aroma',
      label: '香气风味',
      children: (
        <div className="space-y-6">
          {/* 香气标签 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-medium">香气标签</div>
              <Button type="dashed" onClick={addAromaTag} icon={<PlusOutlined />} size="small">
                添加标签
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {productAromaTags.map((tag, index) => (
                <Space key={tag.id}>
                  <Input
                    value={tag.tag_name}
                    onChange={(e) => updateAromaTag(index, e.target.value)}
                    placeholder="标签名称"
                    size="small"
                    style={{ width: 120 }}
                  />
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => removeAromaTag(index)}
                  />
                </Space>
              ))}
            </div>
          </div>

          {/* 香气阶段 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-medium">香气阶段</div>
              <Select
                placeholder="添加阶段"
                size="small"
                style={{ width: 120 }}
                onChange={(val) => addAromaNote(val as '前调' | '中调' | '后调')}
                options={[
                  { value: '前调', label: '前调' },
                  { value: '中调', label: '中调' },
                  { value: '后调', label: '后调' },
                ]}
              />
            </div>
            <div className="space-y-4">
              {aromaNotes.map((note, index) => (
                <Card key={note.id} size="small">
                  <div className="flex justify-between items-center mb-2">
                    <Space>
                      <Select
                        value={note.stage}
                        onChange={(val) => updateAromaNote(index, 'stage', val)}
                        size="small"
                        style={{ width: 80 }}
                        options={[
                          { value: '前调', label: '前调' },
                          { value: '中调', label: '中调' },
                          { value: '后调', label: '后调' },
                        ]}
                      />
                      <Input
                        value={note.stage_label || ''}
                        onChange={(e) => updateAromaNote(index, 'stage_label', e.target.value)}
                        placeholder="阶段描述"
                        size="small"
                        style={{ width: 120 }}
                      />
                    </Space>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => removeAromaNote(index)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">总结</div>
                      <Input
                        value={note.summary || ''}
                        onChange={(e) => updateAromaNote(index, 'summary', e.target.value)}
                        placeholder="一句话描述"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">详细描述</div>
                      <TextArea
                        rows={2}
                        value={note.detail || ''}
                        onChange={(e) => updateAromaNote(index, 'detail', e.target.value)}
                        placeholder="详细说明"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 风味结论 */}
          <div>
            <div className="font-medium mb-4">风味结论</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">总结</div>
                <Input
                  value={flavorConclusions?.summary || ''}
                  onChange={(e) => updateFlavorConclusion('summary', e.target.value)}
                  placeholder="风味总结"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">详细内容</div>
                <TextArea
                  rows={3}
                  value={flavorConclusions?.content || ''}
                  onChange={(e) => updateFlavorConclusion('content', e.target.value)}
                  placeholder="风味详细描述"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'layers',
      label: '配料层次',
      children: (
        <>
          <div className="mb-4">
            <Button type="dashed" onClick={addProductLayer} icon={<PlusOutlined />} block>
              添加层次
            </Button>
          </div>
          <div className="space-y-4">
            {productLayers.map((layer, index) => (
              <Card key={layer.id} size="small">
                <div className="flex justify-between items-center mb-2">
                  <Space>
                    <Select
                      value={layer.layer_type}
                      onChange={(val) => updateProductLayer(index, 'layer_type', val)}
                      size="small"
                      style={{ width: 100 }}
                      options={[
                        { value: '顶层', label: '顶层' },
                        { value: '中层', label: '中层' },
                        { value: '夹层', label: '夹层' },
                        { value: '底层', label: '底层' },
                        { value: '装饰', label: '装饰' },
                      ]}
                    />
                    <Input
                      value={layer.layer_name || ''}
                      onChange={(e) => updateProductLayer(index, 'layer_name', e.target.value)}
                      placeholder="层次名称"
                      size="small"
                      style={{ width: 150 }}
                    />
                  </Space>
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => removeProductLayer(index)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">配料</div>
                    <TextArea
                      rows={2}
                      value={layer.ingredients || ''}
                      onChange={(e) => updateProductLayer(index, 'ingredients', e.target.value)}
                      placeholder="配料成分"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">口感</div>
                    <TextArea
                      rows={2}
                      value={layer.mouthfeel || ''}
                      onChange={(e) => updateProductLayer(index, 'mouthfeel', e.target.value)}
                      placeholder="口感描述"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">亮点</div>
                    <TextArea
                      rows={2}
                      value={layer.highlight || ''}
                      onChange={(e) => updateProductLayer(index, 'highlight', e.target.value)}
                      placeholder="特色亮点"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ),
    },
    {
      key: 'reviews',
      label: '口碑管理',
      children: (
        <>
          <div className="mb-4">
            <Button type="dashed" onClick={addProductReview} icon={<PlusOutlined />} block>
              添加口碑
            </Button>
          </div>
          <div className="space-y-4">
            {productReviews.map((review, index) => (
              <Card key={review.id} size="small">
                <div className="flex justify-between items-center mb-2">
                  <Space>
                    <Select
                      value={review.review_type}
                      onChange={(val) => updateProductReview(index, 'review_type', val)}
                      size="small"
                      style={{ width: 80 }}
                      options={[
                        { value: '好评', label: '好评' },
                        { value: '差评', label: '差评' },
                      ]}
                    />
                    <InputNumber
                      value={review.feedback_count}
                      onChange={(val) => updateProductReview(index, 'feedback_count', val || 1)}
                      min={1}
                      size="small"
                      addonBefore="反馈人数"
                      style={{ width: 120 }}
                    />
                  </Space>
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => removeProductReview(index)}
                  />
                </div>
                <TextArea
                  rows={2}
                  value={review.content}
                  onChange={(e) => updateProductReview(index, 'content', e.target.value)}
                  placeholder="口碑内容"
                />
              </Card>
            ))}
          </div>
        </>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
          className="mr-4"
        >
          返回
        </Button>
        <h2 className="text-2xl font-bold m-0">
          {isNew ? '新增商品' : '编辑商品'}
        </h2>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: '在架',
            heat_score: 0,
            rating_count: 0,
          }}
        >
          <Tabs items={items} />

          <div className="flex justify-end gap-4 mt-6">
            <Button onClick={() => navigate('/products')}>取消</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {isNew ? '创建' : '保存'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
