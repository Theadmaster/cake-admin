import { createBrowserRouter, Navigate } from 'react-router-dom'
import RequireAuth from '@/components/RequireAuth'
import Dashboard from '@/pages/Dashboard'
import BrandList from '@/pages/Brands/BrandList'
import BrandDetail from '@/pages/Brands/BrandDetail'
import ProductList from '@/pages/Products/ProductList'
import ProductDetail from '@/pages/Products/ProductDetail'
import StoreList from '@/pages/Stores/StoreList'
import StoreDetail from '@/pages/Stores/StoreDetail'
import BuyerList from '@/pages/Buyers/BuyerList'
import BuyerDetail from '@/pages/Buyers/BuyerDetail'
import SellerList from '@/pages/Sellers/SellerList'
import SellerDetail from '@/pages/Sellers/SellerDetail'
import OperatorList from '@/pages/Operators/OperatorList'
import OperatorDetail from '@/pages/Operators/OperatorDetail'
import WikiList from '@/pages/Wiki/WikiList'
import WikiDetail from '@/pages/Wiki/WikiDetail'
import TagList from '@/pages/Tags/TagList'
import Tasks from '@/pages/Tasks'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'brands',
        element: <BrandList />,
      },
      {
        path: 'brands/:id',
        element: <BrandDetail />,
      },
      {
        path: 'products',
        element: <ProductList />,
      },
      {
        path: 'products/:id',
        element: <ProductDetail />,
      },
      {
        path: 'stores',
        element: <StoreList />,
      },
      {
        path: 'stores/:id',
        element: <StoreDetail />,
      },
      {
        path: 'buyers',
        element: <BuyerList />,
      },
      {
        path: 'buyers/:id',
        element: <BuyerDetail />,
      },
      {
        path: 'sellers',
        element: <SellerList />,
      },
      {
        path: 'sellers/:id',
        element: <SellerDetail />,
      },
      {
        path: 'operators',
        element: <OperatorList />,
      },
      {
        path: 'operators/:id',
        element: <OperatorDetail />,
      },
      {
        path: 'wiki',
        element: <WikiList />,
      },
      {
        path: 'wiki/:id',
        element: <WikiDetail />,
      },
      {
        path: 'tags',
        element: <TagList />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
])

export default router
