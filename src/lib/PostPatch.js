export const changeUser = async (productId, method, data) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${productId}/status`;
    console.log("URL:", url);

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update product status');
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};