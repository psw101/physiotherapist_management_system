'use client'
import Form  from 'next/form'
import React from 'react'
import {create } from '../../actions/actions'

const Products = () => {

  // to test client side loging in forms


  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   const formData = new FormData(e.currentTarget);
  //   console.log("Client-side log:", formData.get('productName'));
  // }

  return (
    <div>
        <Form action={create}>
            <label htmlFor="productName">Product Name</label>
            <input type="text" id="productName" name="productName"/>
            <button type="submit">Submit</button>
        </Form>
    </div>
  )
}

export default Products