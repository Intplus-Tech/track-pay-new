'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

const PageHeader = () => {
  const pathname = usePathname()

  // Remove the first "/" and return the rest
  const pathWithoutLeadingSlash = pathname.startsWith('/') ? pathname.slice(1) : pathname

  // Extract the final segment (even if it's a nested path)
  const finalSegment = pathname.split('/').filter(Boolean).pop() || ''

  return (
    <div className=''>
      <p className='text-gray-900 text-lg'>{pathWithoutLeadingSlash}</p>
      <p className='text-gray-900 text-3xl font-bold capitalize'>{finalSegment}</p>
    </div>
  )
}

export default PageHeader
