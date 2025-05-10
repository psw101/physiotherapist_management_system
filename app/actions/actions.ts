export async function create(formData: FormData): Promise<void> {  
  // Get the form data
  const productName = formData.get('productName');
  
  // Process the form data (e.g., save to database)
  console.log('Product name:', productName);
  
  try {
    // Send the data to your API endpoint
    const response = await fetch('http://localhost:3000/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }

    const result = await response.json();
    console.log('API response:', result);

    // Optionally redirect to another page
    // redirect('/products');
  } catch (error) {
    console.error('Error submitting to API:', error);
    // Handle error - could throw or return error information
  }
}





// export async function create(formData: FormData): Promise<void> {  
//           // Get the form data
//           const productName = formData.get('productName');
          
//           // Process the form data (e.g., save to database)
//           console.log('Product name:', productName);
          
//           // Return a result or redirect
//         }
       