import ProductBrowser from '@/components/ProductBrowser';

export const dynamic = 'force-dynamic';

const ProductsPage = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    let products = [];
    let fetchError = null;
    try {
        const res = await fetch(`${apiUrl}/products`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        if (!res.ok) {
            fetchError = 'Failed to fetch products. Please try again later.';
        } else {
            products = await res.json();
        }
    } catch (err) {
        console.error('Failed to fetch products:', err);
        fetchError = 'Failed to fetch products. Please try again later.';
    }

    return (
        <ProductBrowser
            initialProducts={Array.isArray(products) ? products : []}
            fetchError={fetchError}
        />
    );
};

export default ProductsPage;
