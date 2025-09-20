'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

interface BaiduAnalyticsProps {
  baiduAnalyticsId: string
}

export function BaiduAnalytics({ baiduAnalyticsId }: BaiduAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && window._hmt) {
      // 百度统计 SPA 页面 PV 统计
      window._hmt.push(['_trackPageview', pathname + (searchParams?.toString() || '')])
    }
  }, [pathname, searchParams])

  if (!baiduAnalyticsId) {
    return null
  }

  return (
    <>
      {/* 百度统计脚本 */}
      <Script strategy="afterInteractive">
        {`
          var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?${baiduAnalyticsId}";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
          })();
        `}
      </Script>
    </>
  )
}

// 添加全局类型声明
declare global {
  interface Window {
    _hmt: any[]
  }
}