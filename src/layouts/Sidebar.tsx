import { NavLink, useLocation } from 'react-router-dom'
import {
  Store,
  ClipboardList,
  ShoppingCart,
  TrendingUp,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  end?: boolean
}

const navItems: NavItem[] = [
  { label: 'Магазин',     path: '/purchase',          icon: <Store className="h-6 w-6" />,       end: true  },
  { label: 'Потребность', path: '/need',              icon: <TrendingUp className="h-6 w-6" />,  end: true  },
  { label: 'Корзинка',    path: '/cart',              icon: <ShoppingCart className="h-6 w-6" />, end: true  },
  { label: 'Заказы',      path: '/orders',            icon: <ClipboardList className="h-6 w-6" />, end: false },
  { label: 'Дистрибуторы', path: '/wholesalers',       icon: <Building2 className="h-6 w-6" />,    end: true  },
  // { label: 'Пользователи', path: '/users',            icon: <Users className="h-6 w-6" />,        end: true  },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="flex h-screen w-[140px] shrink-0 flex-col bg-[#1C1917]">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-white/10">
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <ul className="flex flex-col items-center gap-1 px-2">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)

            return (
              <li key={item.path} className="w-full">
                <NavLink
                  to={item.path}
                  end={item.end}
                  title={item.label}
                  className="group flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-150"
                >
                  {/* Icon — white pill when active: 108×40 */}
                  <span
                    className={cn(
                      'flex h-[40px] w-[108px] shrink-0 items-center justify-center rounded-[120px] transition-all duration-150',
                      isActive
                        ? 'bg-white text-gray-900'
                        : 'text-[#6B7280] group-hover:text-stone-300'
                    )}
                  >
                    {item.icon}
                  </span>

                  {/* Label 16px */}
                  <span
                    className={cn(
                      'text-center text-[16px] leading-tight',
                      isActive
                        ? 'font-semibold text-white'
                        : 'font-normal text-[#6B7280] group-hover:text-stone-300'
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Version */}
      <div className="shrink-0 border-t border-[#6B7280] py-[16px]">
        <p className="text-center text-[14px] text-[#6B7280]">v1.0.9</p>
      </div>
    </aside>
  )
}
