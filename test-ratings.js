async function checkRatings() {
    try {
        const storeRes = await fetch('http://localhost:5000/api/v1/stores/al-shaibani-restaurant');
        const storeData = await storeRes.json();
        console.log('Store Rating:', storeData.data.rating);

        const productRes = await fetch('http://localhost:5000/api/v1/products/64ff5872-382e-437f-a1d9-a5d770cbafaa');
        const productData = await productRes.json();
        console.log('Product Rating:', productData.data.rating);
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRatings();
