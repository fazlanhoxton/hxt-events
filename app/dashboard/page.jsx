import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EventsPage() {
  // Sample events data - in a real app, you'd fetch this from an API
  const events = [
    {
      id: 1,
      name: "Annual Tech Conference",
      date: "March 15, 2025",
      guestManagerId: "GM-2025-001",
      status: "upcoming",
    },
    {
      id: 2,
      name: "Product Launch Webinar",
      date: "April 5, 2025",
      guestManagerId: "GM-2025-002",
      status: "completed",
    },
    {
      id: 3,
      name: "Team Building Retreat",
      date: "May 20, 2025",
      guestManagerId: "GM-2025-003",
      status: "upcoming",
    },
    {
      id: 4,
      name: "Customer Appreciation Day",
      date: "June 12, 2025",
      guestManagerId: "GM-2025-004",
      status: "cancelled",
    },
    {
      id: 5,
      name: "Quarterly Business Review",
      date: "July 30, 2025",
      guestManagerId: "GM-2025-005",
      status: "completed",
    },
  ];

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let variant = "outline";

    switch (status) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Event
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
        <Button variant="outline">Sort</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Event Name</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead>Guest Manager ID</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.guestManagerId}</TableCell>
                <TableCell>{renderStatusBadge(event.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing <strong>1</strong> to <strong>5</strong> of <strong>10</strong> events
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}