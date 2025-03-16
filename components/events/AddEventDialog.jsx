// components/venues/AddVenueDialog.jsx
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { fetchGuestManagerVenues } from '@/lib/api/venues';
import { Separator } from "@/components/ui/separator"

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

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
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
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
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        if (!open) return;
        async function loadVenues() {
            try {
                console.log("Fetching venues...");
                const venueData = await fetchGuestManagerVenues();
                if (Array.isArray(venueData)) {
                    setVenues(venueData);
                } else if (venueData && venueData.data && Array.isArray(venueData.data)) {
                    setVenues(venueData.data);
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
            date: new Date().toISOString(),
            venue: "default-venue",
            status: "upcoming",
        },
    });

    async function onSubmit(data) {
        console.log({ ...data, date: selectedDate.toISOString() });
        setIsSubmitting(true);
        try {
            const selectedVenue = venues.find(venue => venue.id === data.venue);
            const mockedResponse = {
                id: Date.now(),
                guestManagerId: `GM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                attendeeCount: 0,
                ...data,
                date: selectedDate.toISOString(),
                venueDetails: selectedVenue
            };
            console.log(mockedResponse);
            toast.success("Event created successfully!");
            form.reset();
            setOpen(false);
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
                        <FormItem>
                            <FormLabel>Event Date & Time</FormLabel>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="Pp"
                                className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormItem>
                        <FormItem>
                            <FormLabel>Event Date & Time</FormLabel>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="Pp"
                                className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormItem>
                        </div>
                        <FormField
                            control={form.control}
                            name="venue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Venue</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || "default-venue"}>
                                        <FormControl>
                                            <SelectTrigger>
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
