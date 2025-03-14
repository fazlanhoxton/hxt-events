// components/venues/AddVenueDialog.jsx
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { fetchGuestManagerVenues } from '@/lib/api/venues';
import { Separator } from "@/components/ui/separator"

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
// Make sure these imports are included
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Validation schema for event form
const eventFormSchema = z.object({
    name: z.string().min(2, "Event name must be at least 2 characters."),
    date: z.string().min(2, "Event date is required."),
    venue: z.string().min(1, "Venue is required."),
    status: z.enum(["upcoming", "active", "completed", "cancelled", "draft"]),
});

export function AddEventDialog({ onEventCreated }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [venues, setVenues] = useState([]);
    const [isLoadingVenues, setIsLoadingVenues] = useState(false);

    // Fetch venues from Guest Manager when the dialog opens
    useEffect(() => {
        if (!open) return;

        async function loadVenues() {
            try {
                console.log("Fetching venues...");
                const venueData = await fetchGuestManagerVenues();
                console.log("Received venue data:", venueData); // Debugging

                // ✅ Ensure 'venueData' is an array before setting state
                if (Array.isArray(venueData)) {
                    setVenues(venueData);
                } else if (venueData && venueData.data && Array.isArray(venueData.data)) {
                    setVenues(venueData.data); // Fix: If 'venueData' has 'data' property, use that
                } else {
                    console.error("Unexpected venue data format:", venueData);
                    toast.error("Unexpected response format. Please try again.");
                }
            } catch (error) {
                console.error("Error loading venues:", error);
                toast.error("Failed to load venues. Using default options.");
            } finally {
                setIsLoadingVenues(false);
            }
        }

        loadVenues();
    }, [open]);


    const form = useForm({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            name: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
            venue: "default-venue", // This will be updated after venues are loaded
            status: "upcoming",
        },
    });

    async function onSubmit(data) {
        console.log(data);
        
        setIsSubmitting(true);
        try {
            // Get the venue name based on the selected venue ID
            const selectedVenue = venues.find(venue => venue.id === data.venue);

            // Create mock response with a generated ID, guestManagerId, and venue details
            const mockedResponse = {
                id: Date.now(),
                guestManagerId: `GM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                attendeeCount: 0,
                ...data,
                venueDetails: selectedVenue // Include full venue details
            };
            console.log(mockedResponse);

            toast.success("Event created successfully!");
            form.reset();
            setOpen(false);

            // Notify parent component
            if (onEventCreated) {
                onEventCreated(mockedResponse);
            }
        } catch (error) {
            toast.error(`Failed to create event: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add New Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new event.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Name</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="off" placeholder="Annual Conference 2025" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="eventDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Event Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full pl-3 text-left">
                                                    {field.value ? format(field.value, "PPP") : "Select a date"}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="venue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Venue</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "default-venue"} className="truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                            <FormControl>
                                                <SelectTrigger className="w-[230px]">
                                                    <SelectValue placeholder="Select a venue" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem key="default-venue" value="default-venue" disabled>
                                                    Select a venue
                                                </SelectItem>
                                                {venues.length > 0 ? (
                                                    venues.map((venue) => (
                                                        <SelectItem key={venue.id} value={String(venue.id)}>
                                                            {venue.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem key="no-venues" value="no-venues" disabled>
                                                        No venues available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Separator className="my-4" />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Creating..." : "Create Event"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}