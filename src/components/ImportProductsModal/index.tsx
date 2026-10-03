import { useState } from 'react'
import { Modal, Upload, Button, Alert, message, Typography } from 'antd'
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons'
import { createImportTask } from '@/api/products'

const { Text } = Typography

interface ImportProductsModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (taskId: string) => void
}

/**
 * 商品批量导入弹窗：
 * 1. 下载导入模板
 * 2. 选择按模板填写的 .xlsx，直传七牛云 Kodo（import/ 目录）
 * 3. 调用后端创建导入任务（异步解析），成功后跳转任务中心
 */
export default function ImportProductsModal({ open, onClose, onSuccess }: ImportProductsModalProps) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDownloadTemplate = () => {
    // 走 vite 代理 / 生产网关，直接下载后端生成的模板
    window.open('/api/products/import/template', '_blank')
  }

  const handleUpload = async () => {
    if (!file) {
      message.warning('请先选择按模板填写的 Excel 文件')
      return
    }
    setUploading(true)
    try {
      // 1. 获取七牛云上传凭证（复用现有上传接口）
      const tokenRes = await fetch('/api/upload/token')
      const tokenJson = await tokenRes.json()
      if (tokenJson.code !== 0) {
        throw new Error(tokenJson.message || '获取上传凭证失败')
      }
      const { token, uploadUrl } = tokenJson.data

      // 2. 直传七牛云，统一放在 import/ 目录
      const ext = file.name.split('.').pop()?.toLowerCase() || 'xlsx'
      const key = `import/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const formData = new FormData()
      formData.append('file', file)
      formData.append('token', token)
      formData.append('key', key)

      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData })
      const uploadJson = await uploadRes.json()
      if (!uploadRes.ok || !uploadJson.key) {
        throw new Error(uploadJson.error || '文件上传到七牛云失败')
      }

      // 3. 创建导入任务（后端异步解析录入）
      const res = await createImportTask({ fileKey: key, fileName: file.name })
      const taskId = res.data.data?.taskId
      message.success('导入任务已创建，正在后台解析')
      setFile(null)
      onSuccess(taskId ?? '')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '导入失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      title="商品批量导入"
      open={open}
      onCancel={() => {
        if (!uploading) {
          setFile(null)
          onClose()
        }
      }}
      footer={[
        <Button key="tpl" icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
          下载导入模板
        </Button>,
        <Button key="cancel" disabled={uploading} onClick={() => { setFile(null); onClose() }}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={uploading} onClick={handleUpload}>
          上传并导入
        </Button>,
      ]}
      width={520}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        className="!mb-4"
        message="每行一个 SKU，同一商品可填写多行；系统将进行必填项、格式与重复 SKU 校验"
      />
      <Upload.Dragger
        accept=".xlsx,.xls"
        maxCount={1}
        fileList={file ? [{ uid: '-1', name: file.name, size: file.size } as never] : []}
        onRemove={() => setFile(null)}
        beforeUpload={(f) => {
          const isExcel = /\.(xlsx|xls)$/i.test(f.name)
          if (!isExcel) {
            message.error('仅支持 .xlsx / .xls 文件')
            return Upload.LIST_IGNORE
          }
          if (f.size > 10 * 1024 * 1024) {
            message.error('文件大小不能超过 10MB')
            return Upload.LIST_IGNORE
          }
          setFile(f)
          return false
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽 Excel 文件到此处</p>
        <p className="ant-upload-hint">支持 .xlsx / .xls，不超过 10MB；请使用最新导入模板填写</p>
      </Upload.Dragger>
      <div className="mt-3 text-center">
        <Text type="secondary">
          还没有模板？点击下方「下载导入模板」，按「填写说明」sheet 填写后上传
        </Text>
      </div>
    </Modal>
  )
}
