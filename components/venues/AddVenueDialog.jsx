// components/venues/AddVenueDialog.jsx
"use client";

import { useState } from "react";
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
import { createVenue } from "@/lib/api/venues";
import { toast } from "sonner";

// Validation schema for our form
const venueFormSchema = z.object({
    name: z.string().min(2, "Venue name must be at least 2 characters."),
    description: z.string().optional(),
    time_zone: z.string().min(1, "Time zone is required."),
    address: z.object({
        city: z.string().min(1, "City is required."),
        country_code: z.string().min(2, "Country code is required.").max(2),
    }),
});

// List of time zones from your API data and common ones
const timeZones = [
  // Time zones from your API data
  "Abu Dhabi", 
  "Brisbane",
  "Cairo",
  "London",
  "Melbourne",
  "Perth",
  "Riyadh",
  "Sydney",
  
  // Common US/Canada time zones
  "Pacific Time (US & Canada)",
  "Mountain Time (US & Canada)",
  "Central Time (US & Canada)",
  "Eastern Time (US & Canada)",
  "Alaska",
  "Hawaii",
  "Arizona",
  
  // Major international cities
  "Amsterdam",
  "Athens",
  "Bangkok",
  "Beijing",
  "Berlin",
  "Bern",
  "Brussels",
  "Bucharest",
  "Budapest",
  "Copenhagen",
  "Dublin",
  "Edinburgh",
  "Frankfurt",
  "Geneva",
  "Helsinki",
  "Hong Kong",
  "Istanbul",
  "Jakarta",
  "Jerusalem",
  "Johannesburg",
  "Kuala Lumpur",
  "Kuwait",
  "Lagos",
  "Lisbon",
  "Madrid",
  "Manila",
  "Mexico City",
  "Milan",
  "Moscow",
  "Mumbai",
  "Munich",
  "Nairobi",
  "New Delhi",
  "Oslo",
  "Paris",
  "Prague",
  "Rome",
  "Santiago",
  "Seoul",
  "Shanghai",
  "Singapore",
  "Stockholm",
  "Taipei",
  "Tokyo",
  "Toronto",
  "Vancouver",
  "Vienna",
  "Warsaw",
  "Zurich",
  
  // UTC and GMT options
  "UTC",
  "GMT"
];

export function AddVenueDialog({ onVenueCreated }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(venueFormSchema),
        defaultValues: {
            name: "",
            description: "",
            time_zone: "UTC",
            address: {
                city: "",
                country_code: "US",
            },
        },
    });

    async function onSubmit(data) {
        setIsSubmitting(true);
        try {
            const response = await createVenue(data);
            toast.success("Venue created successfully!");
            form.reset();
            setOpen(false);

            // Notify parent component to refresh the venues list
            if (onVenueCreated) {
                onVenueCreated(response.data);
            }
        } catch (error) {
            toast.error(`Failed to create venue: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add New Venue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Add New Venue</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new venue.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Venue Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="The Rio Theatre" {...field} />
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
                                            placeholder="Brief description of the venue"
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
                            name="time_zone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time Zone</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a time zone" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {timeZones.map((zone) => (
                                                <SelectItem key={zone} value={zone}>
                                                    {zone}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select the time zone for this venue
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="address.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Vancouver" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address.country_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country Code</FormLabel>
                                        <FormControl>
                                            <Input 
                                              placeholder="CA" 
                                              {...field} 
                                              maxLength={2}
                                              className="uppercase"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Two-letter country code (e.g., CA, US, GB)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Creating..." : "Create Venue"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}