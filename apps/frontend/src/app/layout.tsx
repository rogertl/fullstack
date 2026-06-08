import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import React from 'react'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: '合同管理系统',
  description: '用来管理华道的业务合同',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📄</text></svg>',
  },
}

export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
