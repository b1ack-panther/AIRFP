/**
 * StatusBadge Component
 * Displays status with appropriate color coding
 */

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
	status: string;
	label?: string;
}

const statusStyles: Record<string, string> = {
	draft:
		"bg-status-draft/20 text-status-draft-foreground border-status-draft/30",
	sent: "bg-status-sent/20 text-status-sent border-status-sent/30",
	responses:
		"bg-status-responses/20 text-status-responses border-status-responses/30",
	awarded: "bg-status-awarded/20 text-status-awarded border-status-awarded/30",
	processing:
		"bg-status-draft/20 text-status-draft-foreground border-status-draft/30",
	parsed: "bg-status-awarded/20 text-status-awarded border-status-awarded/30",
	"needs-review":
		"bg-status-responses/20 text-status-responses border-status-responses/30",
};

const defaultLabels: Record<string, string> = {
	draft: "Draft",
	sent: "Sent",
	responses: "Responses Received",
	awarded: "Awarded",
	processing: "Processing",
	parsed: "Parsed",
	"needs-review": "Needs Review",
	DRAFT: "Draft",
	SENT: "Sent",
	RESPONSES: "Responses Received",
	AWARDED: "Awarded",
	PROCESSING: "Processing",
	PARSED: "Parsed",
	"NEEDS-REVIEW": "Needs Review",
};

const StatusBadge = ({ status, label }: StatusBadgeProps) => {
	const lowerStatus =
		(status?.toLowerCase() as StatusBadgeProps["status"]) || "draft";
	return (
		<span
			className={cn(
				"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
				statusStyles[lowerStatus]
			)}
		>
			<span
				className={cn(
					"w-1.5 h-1.5 rounded-full mr-1.5",
					lowerStatus === "draft" || lowerStatus === "processing"
						? "bg-status-draft"
						: "",
					lowerStatus === "sent" ? "bg-status-sent" : "",
					lowerStatus === "responses" || lowerStatus === "needs-review"
						? "bg-status-responses"
						: "",
					lowerStatus === "awarded" || lowerStatus === "parsed"
						? "bg-status-awarded"
						: ""
				)}
			/>
			{label || defaultLabels[lowerStatus] || status}
		</span>
	);
};

export default StatusBadge;
