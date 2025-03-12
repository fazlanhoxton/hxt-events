"use client";

import { useState, useEffect } from 'react';
import { getVenues } from "@/lib/api/venues";
import { columns } from "@/components/venues/Columns";
import { DataTable } from "@/components/venues/DataTable";
import { AddVenueDialog } from "@/components/venues/AddVenueDialog";
import { Toaster } from "sonner";

export default function VenuesPage() {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        pageIndex: 0, // 0-based index for TanStack Table
        pageSize: 10,
    });

    const [pageCount, setPageCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Client-side filtered venues for searching
    const [filteredVenues, setFilteredVenues] = useState([]);

    // Function to load venues
    const fetchVenues = async () => {
        try {
            setLoading(true);
            const response = await getVenues({
                pageNumber: pagination.pageIndex + 1,
                pageSize: pagination.pageSize,
                // No search term - we'll filter on the client side
            });

            const venuesData = response.data || [];
            setVenues(venuesData);
            setFilteredVenues(venuesData);

            if (response.meta?.page) {
                setPageCount(response.meta.page.total || 1);
            } else {
                const total = response.meta?.total || 0;
                setPageCount(Math.ceil(total / pagination.pageSize) || 1);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching venues:', err);
            setError(`Failed to load venues: ${err.message}`);
            setVenues([]);
            setFilteredVenues([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load of venues
    useEffect(() => {
        fetchVenues();
    }, [pagination.pageIndex, pagination.pageSize]);

    // Handle search on the client side
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredVenues(venues);
            return;
        }

        const lowerCaseSearch = searchTerm.toLowerCase();
        const filtered = venues.filter(venue =>
            venue.name?.toLowerCase().includes(lowerCaseSearch) ||
            venue.address?.city?.toLowerCase().includes(lowerCaseSearch) ||
            venue.description?.toLowerCase().includes(lowerCaseSearch)
        );

        setFilteredVenues(filtered);
    }, [searchTerm, venues]);

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleRetry = () => {
        setPagination({ pageIndex: 0, pageSize: 10 });
        setSearchTerm('');
        fetchVenues();
    };

    // Handle venue creation
    const handleVenueCreated = (newVenue) => {
        // Refresh the venues list
        fetchVenues();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Venues</h1>
                <AddVenueDialog onVenueCreated={handleVenueCreated} />
            </div>

            {error ? (
                <div className="bg-destructive/10 p-4 rounded-md text-destructive flex items-center">
                    <span>{error}</span>
                    <Button
                        variant="outline"
                        className="ml-auto"
                        onClick={handleRetry}
                    >
                        Retry
                    </Button>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredVenues}
                    pageCount={pageCount}
                    pagination={pagination}
                    setPagination={setPagination}
                    loading={loading}
                    onSearch={handleSearch}
                    searchValue={searchTerm}
                />
            )}
            <Toaster position="top-right" />
        </div>
    );
}