import { authClient } from '@/lib/auth-client';
import { Chip, Spinner, Table } from '@heroui/react';
import React from 'react';

const YourAddedProduct = async () => {
    const  session = await authClient.getSession();
    if (!session) {
        return (
            <div className='w-full h-96 flex flex-col items-center justify-center gap-4'>
                <p className='text-sm text-slate-600'>You are not logged in. Please log in to view your added products.</p>
            </div>
        );
    }
    console.log(session);
    const userEmail = session.user.email;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-products?email=${userEmail}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
        },
    });

    if (!res.ok) {
        return (
            <div className='w-full h-96 flex flex-col items-center justify-center gap-4'>
                <p className='text-sm text-slate-600'>Failed to fetch your added products. Please try again later.</p>
            </div>
        );
    }

    const data = await res.json();
    console.log(data);

    const items = data.products || [];
    const hasMore = data.hasMore || false;
    const isLoading = false; // You can manage loading state as needed

    const columns = [
        { id: "name", name: "Product Name" },
        { id: "role", name: "Category" },
        { id: "status", name: "Status" },
        { id: "email", name: "Added By" },
    ];

    const statusColorMap = {
        pending: "warning",
        approved: "success",
        rejected: "error",
    };

    return (
        <div>
            <h1>Your Added Products</h1>
            <Table>
      <Table.ScrollContainer className="h-[280px] overflow-y-auto">
        <Table.Content aria-label="Async loading table" className="min-w-[600px]">
          <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
            {columns.map((col) => (
              <Table.Column key={col.id} id={col.id} isRowHeader={col.id === "name"}>
                {col.name}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            <Table.Collection items={items}>
              {(data) => (
                <Table.Row>
                  <Table.Cell>{data.name}</Table.Cell>
                  <Table.Cell>{data.role}</Table.Cell>
                  <Table.Cell>
                    <Chip color={statusColorMap[data    .status]} size="sm" variant="soft">
                      {data.status}
                    </Chip>
                  </Table.Cell>
                  <Table.Cell>{data.email}</Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
            {!!hasMore && (
              <Table.LoadMore isLoading={isLoading} scrollOffset={0} onLoadMore={loadMore}>
                <Table.LoadMoreContent>
                  <Spinner size="md" />
                </Table.LoadMoreContent>
              </Table.LoadMore>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
        </div>
    );
};

export default YourAddedProduct;