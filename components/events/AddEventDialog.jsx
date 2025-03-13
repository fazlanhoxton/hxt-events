// components/events/AddEventDialog.jsx
"use client";

import { createEvent } from "@/lib/api/events";
import { fetchGuestManagerVenues } from "@/lib/api/venues";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Validation schema for event form
const eventFormSchema = z.object({
    name: z.string().min(2, "Event name must be at least 2 characters."),
    description: z.string().optional(),
    date: z.string().min(1, "Event date is required."),
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
        if (open) {
            const loadVenues = async () => {
                setIsLoadingVenues(true);
                try {
                    const venueData = await fetchGuestManagerVenues();
                    setVenues(venueData);
                    
                    // If venues are loaded and there's at least one venue,
                    // set the default venue to the first one
                    if (venueData.length > 0) {
                        form.setValue('venue', venueData[0].id);
                    }
                } catch (error) {
                    console.error("Error loading venues:", error);
                    toast.error("Failed to load venues. Using default options.");
                    
                    // Fallback to basic venues if the API fails
                    const fallbackVenues = [
                        { id: "venue-default-1", name: "Default Venue 1" },
                        { id: "venue-default-2", name: "Default Venue 2" }
                    ];
                    setVenues(fallbackVenues);
                    form.setValue('venue', fallbackVenues[0].id);
                } finally {
                    setIsLoadingVenues(false);
                }
            };
            
            loadVenues();
        }
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
                                        <Input placeholder="Annual Conference 2025" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of the event"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className={isLoadingVenues ? "opacity-70" : ""}>
                                                <SelectValue placeholder={isLoadingVenues ? "Loading venues..." : "Select a venue"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {venues.map((venue) => (
                                                <SelectItem key={venue.id} value={venue.id}>
                                                    {venue.name}
                                                </SelectItem>
                                            ))}
                                            {venues.length === 0 && (
                                                <SelectItem value="default-venue">
                                                    No venues available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select from available Guest Manager venues
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select event status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Current status of the event
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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