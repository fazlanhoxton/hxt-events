"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { fetchGuestManagerVenues } from "@/lib/api/venues";
import { Separator } from "@/components/ui/separator";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ✅ Improved Validation Schema
const eventFormSchema = z.object({
    name: z.string().min(2, "Event name must be at least 2 characters."),
    startDate: z.date({ required_error: "Event start date is required." }),
    endDate: z.date({ required_error: "Event end date is required." }),
    venue: z.string().min(1, "Venue is required."),
    sc_id: z.string().min(1, "SC ID is required."),
});

export function AddEventDialog({ onEventCreated }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [venues, setVenues] = useState([]);
    const [selectedStartedDate, setSelectedStartedDate] = useState(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());

    // ✅ Fetch venues when modal opens
    useEffect(() => {
        if (!open) return;
        async function loadVenues() {
            try {
                console.log("Fetching venues...");
                const venueData = await fetchGuestManagerVenues();
                if (Array.isArray(venueData)) {
                    setVenues(venueData);
                } else if (venueData?.data && Array.isArray(venueData.data)) {
                    setVenues(venueData.data);
                } else {
                    console.error("Unexpected venue data format:", venueData);
                    toast.error("Unexpected response format. Please try again.");
                }
            } catch (error) {
                console.error("Error loading venues:", error);
                toast.error("Failed to load venues.");
            }
        }
        loadVenues();
    }, [open]);

    const form = useForm({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            name: "",
            startDate: new Date(),
            endDate: new Date(),
            venue: "",
            sc_id: "",
        },
    });

    // ✅ Log form validation errors
    useEffect(() => {
        console.log("Form Errors:", form.formState.errors);
    }, [form.formState.errors]);

    async function onSubmit(data) {
        setIsSubmitting(true);

        if (!selectedStartedDate || !selectedEndDate) {
            console.error("Error: Start or end date is missing");
            toast.error("Please select a start and end date.");
            setIsSubmitting(false);
            return;
        }

        // Date Validation
        const now = new Date();
        if (selectedStartedDate <= now) {
            console.error("Error: Start date must be in the future");
            toast.error("Start date must be in the future.");
            setIsSubmitting(false);
            return;
        }
        if (selectedEndDate <= selectedStartedDate) {
            console.error("Error: End date must be later than the start date.");
            toast.error("End date must be later than the start date.");
            setIsSubmitting(false);
            return;
        }

        // Convert dates to a proper format (e.g., "YYYY-MM-DDTHH:mm:ssZ")
        const formattedStartDate = selectedStartedDate.toISOString();
        const formattedEndDate = selectedEndDate.toISOString();

        // Ensure venue_id is a valid number
        const venueId = parseInt(data.venue, 10);
        if (isNaN(venueId)) {
            console.error("Error: Invalid venue ID");
            toast.error("Please select a valid venue.");
            setIsSubmitting(false);
            return;
        }

        // Create the request payload
        const formattedData = {
            name: data.name,
            starts_at: formattedStartDate,
            ends_at: formattedEndDate,
            venue_id: venueId,
            sc_id: data.sc_id,
        };

        try {
            console.log("Submitting data:", formattedData); // Ensure correct values
            const response = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedData),
            });

            const responseBody = await response.json();
            console.log("API Response:", responseBody);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Response Error:", errorData);
                throw new Error(
                    `Guest Manager API error: ${response.status} - ${JSON.stringify(
                        errorData
                    )}`
                );
            }

            toast.success("Event created successfully!");
            setOpen(false);
            //reset the form
            form.reset();
            onEventCreated(); // Refresh event list if applicable
        } catch (error) {
            console.error("Submission Error:", error.message);
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
                                        <Input
                                            autoComplete="off"
                                            placeholder="Annual Conference 2025"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sc_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default SC_ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            autoComplete="off"
                                            placeholder="1000"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormItem>
                                <FormLabel>Start Date & Time</FormLabel>
                                <DatePicker
                                    selected={selectedStartedDate}
                                    onChange={(date) => setSelectedStartedDate(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="Pp"
                                    className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormItem>
                            <FormItem>
                                <FormLabel>End Date & Time</FormLabel>
                                <DatePicker
                                    selected={selectedEndDate}
                                    onChange={(date) => setSelectedEndDate(date)}
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
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a venue" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {venues.map((venue) => (
                                                <SelectItem key={venue.id} value={String(venue.id)}>
                                                    {venue.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Separator className="my-4" />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Create Event"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
