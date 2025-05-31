import PageHeader from '@/components/PageHeader';
import TrackerPage from '@/components/TrackerPage'
import { PageProps } from '@/types';
import React from 'react'


const page = async ({ params }: PageProps) => {
  const { id } = await params;

  return (
    <div>
      <TrackerPage />
    </div>
  )
}

export default page