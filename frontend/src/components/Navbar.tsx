import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">ZipChat</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/'
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                {t('nav.home')}
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/chat"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/chat'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {t('nav.chat')}
                  </Link>
                  <Link
                    to="/profile"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/profile'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {t('nav.profile')}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {t('auth.logout')}
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 