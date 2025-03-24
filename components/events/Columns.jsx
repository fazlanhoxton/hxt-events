"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Copy, Calendar, MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

// Format a date string to a readable format
function formatColumnDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date)
    ? "-"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

// Function to render status badge with appropriate color
const renderStatusBadge = (status) => {
  if (!status) return <Badge variant="outline">Unknown</Badge>;

  let variant = "outline";
  switch (status.toLowerCase()) {
    case "upcoming":
      variant = "default";
      break;
    case "active":
      variant = "success";
      break;
    case "completed":
      variant = "secondary";
      break;
    case "cancelled":
      variant = "destructive";
      break;
    case "draft":
      variant = "outline";
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const columns = [
  {
    accessorKey: "guestManagerId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("guestManagerId") || "-"}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="font-medium w-60 overflow-hidden text-ellipsis">
              {row.getValue("name") || "Unnamed Event"}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">
              {row.getValue("name") || "Unnamed Event"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },

  {
    accessorKey: "starts_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Event Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("starts_at");
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {date
            ? new Date(date).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "-"}
        </div>
      );
    },
    sortingFn: "datetime",
  },

  {
    accessorKey: "county",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        County
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("county") || "-"}</div>,
  },

  {
    accessorKey: "venue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Venue
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const venue = row.getValue("venue");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="w-60 overflow-hidden text-ellipsis">
                  {venue || "-"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm font-medium">{venue || "-"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => renderStatusBadge(row.getValue("status")),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "registeredCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Registered
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("registeredCount");
      return (
        <div className="text-center font-medium">
          {count !== undefined ? count : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "attendeeCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Attendees
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("attendeeCount");
      return (
        <div className="text-center font-medium">
          {count !== undefined ? count : "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Copy Link
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const baseUrl = "https://hoxtonwealth.com/event/";
      const eventName = row.getValue("name") || "Unnamed Event";
      const slug = eventName.replace(/\s+/g, "-");
      const referreal_name = "FazlanFaleel";
      const county = row.getValue("county").replace(/\s+/g, "-");
      const event_date = row.getValue("starts_at").split("T")[0];
      const eventUrl = `${baseUrl}${slug}?utm_campaign=${county}_Seminar_${event_date}_Referral_${referreal_name}&utm_medium=${referreal_name}&utm_source=Referral`;
      const [isCopied, setIsCopied] = useState(false);

      const handleCopy = async () => {
        await navigator.clipboard.writeText(eventUrl);
        setIsCopied(true);
        toast.success("Event URL copied to clipboard!");
        // Reset the tooltip after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      };
      return (
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex gap-2 items-center"
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4 text-green-500" /> Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy
            </>
          )}
        </Button>
      );
    },
  },
];
