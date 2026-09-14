import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShopOutlined,
  GiftOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '数据看板',
  },
  {
    key: '/brands',
    icon: <ShopOutlined />,
    label: '品牌管理',
  },
  {
    key: '/products',
    icon: <GiftOutlined />,
    label: '商品管理',
  },
  {
    key: '/stores',
    icon: <HomeOutlined />,
    label: '门店管理',
  },
  {
    key: 'content',
    label: '内容管理',
    icon: <BookOutlined />,
    children: [
      {
        key: '/wiki',
        label: '百科管理',
      },
      {
        key: '/tags',
        label: '标签管理',
      },
    ],
  },
  {
    key: 'accounts',
    label: '账号管理',
    icon: <TeamOutlined />,
    children: [
      {
        key: '/buyers',
        icon: <UserOutlined />,
        label: '买家管理',
      },
      {
        key: '/sellers',
        icon: <ShopOutlined />,
        label: '卖家管理',
      },
      {
        key: '/operators',
        icon: <UserOutlined />,
        label: '运营人员',
      },
    ],
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { collapsed, toggleCollapsed } = useAppStore()
  const { user, logout } = useAuthStore()

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]



  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-white"
        width={220}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary m-0">
            {collapsed ? 'CA' : 'Cake Admin'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['content', 'accounts']}
          items={menuItems}
          onClick={handleMenuClick}
          className="!border-r-0"
        />
      </Sider>
      <Layout>
        <Header className="!bg-white !px-4 flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            className="!w-16 !h-16"
          />
          <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
            <Space className="cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span>{user?.nickname || user?.username || 'Admin'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="m-4 p-6 bg-white rounded-lg shadow-sm">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
