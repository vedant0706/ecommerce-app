import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    // console.log("All products:", products);
    // console.log("Products length:", products.length);
    
    if (products.length > 0) {
      // Log first product to see its structure
      // console.log("First product structure:", products[0]);
      
      // Check what bestseller fields exist
      products.forEach((product, index) => {
        if (index < 5) { // Log first 5 products
          // console.log(`Product ${index}:`, {
            // name: product.name,
            // bestseller: product.bestseller,
            // bestSeller: product.bestSeller,
            // BestSeller: product.BestSeller
          // });
        }
      });
      
      const bestProduct = products.filter((item) => {
        // console.log(`Checking ${item.name}:`, item.bestseller, item.bestSeller, item.BestSeller);
        return item.bestseller === true || item.bestSeller === true || item.BestSeller === true;
      });
      
      // console.log("Filtered bestseller products:", bestProduct);
      setBestSeller(bestProduct.slice(0, 5))
    }
  }, [products])

  return (    
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, placeat enim illum itaque eveniet optio
        </p>
      </div>

      {/* Rendering Products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
          bestSeller.length > 0 ? (
            bestSeller.map((item) => (
              <ProductItem key={item._id} id={item._id} image={item.image} name={item.name} price={item.price} />
            ))
          ) : (
            <p className='col-span-full text-center text-gray-500'>No bestsellers available</p>
          )
        }
      </div>
    </div>
  );
};

export default BestSeller;