import { useState, useEffect } from 'react'
import { Upload, message } from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'

interface MultiQiniuUploadProps {
  value?: string[]
  onChange?: (urls: string[]) => void
  maxCount?: number
  listType?: 'text' | 'picture' | 'picture-card'
}

export default function MultiQiniuUpload({ value = [], onChange, maxCount = 9, listType = 'picture-card' }: MultiQiniuUploadProps) {
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // 监听value变化，同步更新fileList
  useEffect(() => {
    if (value && value.length > 0) {
      setFileList(value.map((url, index) => ({
        uid: `-${index}`,
        name: `image-${index}`,
        status: 'done' as const,
        url,
      })))
    } else {
      setFileList([])
    }
  }, [value])

  const getUploadToken = async () => {
    try {
      const res = await fetch('/api/upload/token')
      const json = await res.json()
      if (json.code === 0) {
        return json.data
      }
    } catch (error) {
      console.error('获取上传凭证失败:', error)
    }
    return null
  }

  const beforeUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件!')
      return false
    }

    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB!')
      return false
    }

    setLoading(true)

    try {
      const uploadData = await getUploadToken()
      if (!uploadData) {
        message.error('获取上传凭证失败')
        setLoading(false)
        return false
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('token', uploadData.token)
      // 使用文件名作为key，避免中文问题
      const ext = file.name.split('.').pop()
      const key = `cake/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      formData.append('key', key)

      const res = await fetch(uploadData.uploadUrl, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      const url = `https://${uploadData.domain}/${data.key}`

      const newFileList = [
        ...fileList,
        {
          uid: `-${Date.now()}`,
          name: file.name,
          status: 'done' as const,
          url,
        },
      ]
      
      setFileList(newFileList)
      
      const urls = newFileList
        .filter((f) => f.url)
        .map((f) => f.url as string)
      onChange?.(urls)
      
      message.success('上传成功')
    } catch (error) {
      message.error('上传失败')
    } finally {
      setLoading(false)
    }

    return false // 阻止默认上传
  }

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid)
    setFileList(newFileList)
    
    const urls = newFileList
      .filter((f) => f.url)
      .map((f) => f.url as string)
    onChange?.(urls)
  }

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  )

  return (
    <Upload
      listType={listType}
      fileList={fileList}
      beforeUpload={beforeUpload}
      onRemove={handleRemove}
      maxCount={maxCount}
    >
      {fileList.length >= maxCount ? null : uploadButton}
    </Upload>
  )
}
