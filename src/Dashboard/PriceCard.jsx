import React from 'react'

function PriceCard({ coin, price, change }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <h2 className="text-lg font-semibold">{coin}</h2>
      <p>{price}</p>
      <p>{change}</p>
    </div>
  )
}

export default PriceCard