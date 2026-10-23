import React from 'react'

function CategoryCard({ category, image }) {
  return (
    <div className='w-30 h-30 md:w-35 md:h-35 rounded-lg border-2 border-[#ff4d2d] shrink-0 overflow-hidden bg-[#fff9f6] shadow-md shadow-gray-200 hover:shadow-lg transition-shadow'>

      <img
        src={image}
        alt={category}
        className='w-full h-24 md:h-28 object-cover'
      />

      <h3 className='text-sm md:text-base text-center px-1'>
        {category}
      </h3>

    </div>
  )
}

export default CategoryCard;