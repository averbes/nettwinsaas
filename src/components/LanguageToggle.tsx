import React from 'react'
import { Globe } from 'lucide-react'
import { useTranslations } from '../lib/i18n'

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useTranslations()

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {language === 'en' ? 'ES' : 'EN'}
      </span>
    </button>
  )
}

export default LanguageToggle