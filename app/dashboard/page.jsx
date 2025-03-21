// app/dashboard/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/events/AddEventDialog";
import { Toaster } from "sonner";
import { fetchEventsFromDatoCMS } from "@/lib/api/events";
import { EventsDataTable } from "@/components/events/EventsDataTable";
import { columns } from "@/components/events/Columns";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, TicketCheck, Users, Activity } from "lucide-react";

export default function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0, // 0-based index for TanStack Table
    pageSize: 5,
  });

  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Client-side filtered events for searching
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Dashboard metrics
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    activeEvents: 0
  });

  // Function to load events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await fetchEventsFromDatoCMS();
      
      setEvents(eventsData);
      setFilteredEvents(eventsData);
      
      // Calculate total number of pages
      setPageCount(Math.ceil(eventsData.length / pagination.pageSize));
      
      // Calculate dashboard metrics
      calculateMetrics(eventsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(`Failed to load events: ${err.message}`);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard metrics from events data
  const calculateMetrics = (eventsData) => {
    const now = new Date();
    
    const metrics = {
      totalEvents: eventsData.length,
      upcomingEvents: eventsData.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now && event.status !== 'cancelled';
      }).length,
      totalAttendees: eventsData.reduce((sum, event) => sum + (event.attendeeCount || 0), 0),
      activeEvents: eventsData.filter(event => event.status === 'active').length
    };
    
    setMetrics(metrics);
  };

  // Initial load of events
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle search on the client side
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = events.filter(event =>
      event.name?.toLowerCase().includes(lowerCaseSearch) ||
      event.guestManagerId?.toLowerCase().includes(lowerCaseSearch) ||
      event.status?.toLowerCase().includes(lowerCaseSearch) ||
      event.venue?.toLowerCase().includes(lowerCaseSearch)
    );

    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleRetry = () => {
    setPagination({ pageIndex: 0, pageSize: 5 });
    setSearchTerm('');
    fetchEvents();
  };

  // Handle event creation
  const handleEventCreated = (newEvent) => {
    // Refresh the events list
    fetchEvents();
  };

  useEffect(() => {
    const formattedEvents = events.map(event => ({
      ...event,
      county: event.county || "N/A",
    }));
  
    setFilteredEvents(formattedEvents);
  }, [events]); // Runs when `events` updates
  

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                All events in the system
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <TicketCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Events scheduled in the future
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalAttendees}</div>
              <p className="text-xs text-muted-foreground">
                Across all events
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeEvents}</div>
              <p className="text-xs text-muted-foreground">
                Currently running events
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recent Events</h2>
        <AddEventDialog onEventCreated={handleEventCreated} />
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
        <EventsDataTable
          columns={columns}
          data={filteredEvents}
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