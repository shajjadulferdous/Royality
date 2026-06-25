'use client';

import React from 'react';
import { Input, Select, ListBox } from '@heroui/react';
import { FiSearch } from 'react-icons/fi';

const SearchFilter = ({
    query,
    onQueryChange,
    category,
    onCategoryChange,
    categories = [],
    sort,
    onSortChange,
    placeholder = 'Search…',
    className = '',
}) => {
    return (
        <div
            className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${className}`}
        >
            <div className="md:col-span-6">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder={placeholder}
                    variant="secondary"
                    className="w-full"
                >
                    <Input.Prefix>
                        <FiSearch className="text-gray-400 w-4 h-4" />
                    </Input.Prefix>
                </Input>
            </div>

            {categories.length > 0 && (
                <div className="md:col-span-3">
                    <Select
                        aria-label="Category"
                        value={category}
                        onChange={(val) => onCategoryChange(val || 'all')}
                        variant="secondary"
                        className="w-full"
                    >
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                <ListBox.Item key="all" id="all" textValue="All categories">
                                    All categories
                                </ListBox.Item>
                                {categories.map((c) => (
                                    <ListBox.Item
                                        key={c}
                                        id={c}
                                        textValue={c}
                                        className="capitalize"
                                    >
                                        {c}
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>
            )}

            {onSortChange && (
                <div className="md:col-span-3">
                    <Select
                        aria-label="Sort"
                        value={sort}
                        onChange={(val) => onSortChange(val || 'newest')}
                        variant="secondary"
                        className="w-full"
                    >
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                <ListBox.Item key="newest" id="newest" textValue="Newest first">
                                    Newest first
                                </ListBox.Item>
                                <ListBox.Item key="price-asc" id="price-asc" textValue="Price: low to high">
                                    Price: low to high
                                </ListBox.Item>
                                <ListBox.Item key="price-desc" id="price-desc" textValue="Price: high to low">
                                    Price: high to low
                                </ListBox.Item>
                                <ListBox.Item key="title-asc" id="title-asc" textValue="Name: A → Z">
                                    Name: A → Z
                                </ListBox.Item>
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>
            )}
        </div>
    );
};

export default SearchFilter;
