'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronDown,
  Home,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

type NavChild = {
  name: string;
  href: string;
};

type NavItem = {
  name: string;
  icon: React.ElementType;
  href?: string;
  children?: NavChild[];
};

const DashboardNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_USER_URL}/logout`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      router.push('/');
    }
  };

  const navigationItems: NavItem[] = [
    {
      name: 'Home',
      icon: Home,
      href: '/dashboard',
    },
    {
      name: 'Invoice',
      icon: BarChart3,
      children: [
        { name: 'Create', href: '/invoice/create' },
        { name: 'View', href: '/invoice/view' },
      ],
    },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">Dashboard</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex space-x-1">
                {navigationItems.map((item) => (
                  <div key={item.name} className="relative group">
                    {item.href ? (
                      <div
                        onClick={() => {
                          if (pathname !== item.href) {
                            router.push(item.href as string);
                          }
                        }}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                      >
                        <item.icon size={16} />
                        <span>{item.name}</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                      >
                        <item.icon size={16} />
                        <span>{item.name}</span>
                        <ChevronDown size={14} />
                      </div>
                    )}

                    {item.children && (
                      <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right section: Logout Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardNavbar;
