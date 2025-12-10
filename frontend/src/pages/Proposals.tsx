import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
	ArrowLeft,
	FileText,
	Clock,
	CheckCircle,
	AlertTriangle,
	ChevronRight,
	DollarSign,
	Truck,
	BarChart3,
	RefreshCw,
} from "lucide-react";
import { api, RFP, Proposal } from "@/services/api";
import { toast } from "sonner";
import StatusBadge from "@/components/ui/StatusBadge";

const Proposals = () => {
	const { id } = useParams<{ id: string }>();
	const [rfp, setRfp] = useState<RFP | null>(null);
	const [proposals, setProposals] = useState<Proposal[]>([]);
	const [loading, setLoading] = useState(true);
	const [checkingEmails, setCheckingEmails] = useState(false);

	useEffect(() => {
		const loadData = async () => {
			if (!id) return;
			try {
				const [rfpData, proposalsData] = await Promise.all([
					api.getRFP(id),
					api.getProposals(id),
				]);
				setRfp(rfpData);
				setProposals(proposalsData);
			} catch (error) {
				console.error("Failed to load proposals data", error);
				toast.error("Failed to load proposals");
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [id]);

	const handleCheckEmails = async () => {
		setCheckingEmails(true);
		try {
			await api.checkEmails();
			toast.success("Checking emails for new proposals...");
			// Refresh data after a short delay
			if (id) {
				const proposalsData = await api.getProposals(id);
				setProposals(proposalsData);
				toast.success("Proposals list updated");
			}
		} catch (error) {
			console.error("Failed to check emails", error);
			toast.error("Failed to check emails");
		} finally {
			setCheckingEmails(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "processing":
				return <Clock className="h-5 w-5 text-status-draft" />;
			case "parsed":
				return <CheckCircle className="h-5 w-5 text-status-awarded" />;
			case "needs-review":
				return <AlertTriangle className="h-5 w-5 text-status-responses" />;
			case "sent":
				return <Clock className="h-5 w-5 text-status-sent" />;
			default:
				return <FileText className="h-5 w-5 text-muted-foreground" />;
		}
	};

	if (loading) {
		return (
			<div className="page-container animate-fade-in flex items-center justify-center p-12">
				<div className="text-muted-foreground">Loading proposals...</div>
			</div>
		);
	}

	if (!rfp) {
		return (
			<div className="page-container animate-fade-in p-12 text-center">
				<h2 className="text-xl font-semibold">RFP Not Found</h2>
				<Link to="/" className="text-primary hover:underline mt-4 inline-block">
					Return to Dashboard
				</Link>
			</div>
		);
	}

	return (
		<div className="page-container animate-fade-in">
			<div className="mb-6">
				<Link
					to={`/rfp/${id}`}
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to RFP
				</Link>

				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="h-12 w-12 rounded-xl bg-status-responses/20 flex items-center justify-center">
							<FileText className="h-6 w-6 text-status-responses" />
						</div>
						<div>
							<h1 className="text-xl font-semibold text-foreground">
								{proposals.length > 0 ? (
									<span className="text-secondary-foreground font-medium">
										{proposals.length} Proposals
									</span>
								) : (
									"Vendor Proposals"
								)}
							</h1>
							<p className="text-muted-foreground">{rfp.title}</p>
						</div>
					</div>

					<div>
						{proposals.filter((p) => p.status === "parsed").length >= 2 && (
							<Link
								to={`/rfp/${id}/compare`}
								className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent/90 transition-all"
							>
								<BarChart3 className="h-4 w-4" />
								Compare Proposals
							</Link>
						)}
						<button
							onClick={handleCheckEmails}
							disabled={checkingEmails}
							className="inline-flex ml-3 items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50"
						>
							<RefreshCw
								className={`h-4 w-4 ${checkingEmails ? "animate-spin" : ""}`}
							/>
							{checkingEmails ? "Refreshing..." : "Refresh"}
						</button>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				{proposals.map((proposal, index) => {
					const status = proposal.status || "parsed";

					return (
						<Link
							key={proposal._id}
							to={`/rfp/${id}/proposal/${proposal._id}`}
							className="block card-elevated hover:shadow-lg transition-all"
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<div className="p-6">
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-center gap-4">
										{getStatusIcon(status)}
										<div>
											<h3 className="font-semibold text-foreground">
												{proposal.vendor?.name || "Unknown Vendor"}
											</h3>
											<p className="text-sm text-muted-foreground">
												Submitted{" "}
												{new Date(proposal.received_at).toLocaleDateString()}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<StatusBadge status={status as any} />
										<ChevronRight className="h-5 w-5 text-muted-foreground" />
									</div>
								</div>

								{status === "parsed" && (
									<div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
										<div className="flex items-center gap-2">
											<DollarSign className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-xs text-muted-foreground">
													Total Cost
												</p>
												<p className="font-medium text-foreground">
													$
													{proposal.extracted_data.reduce(
														(sum, item) => sum + item.price,
														0
													)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Truck className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-xs text-muted-foreground">
													Delivery
												</p>
												<p className="font-medium text-foreground">
													{proposal.timeline ?? "-"}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<FileText className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-xs text-muted-foreground">
													Warranty
												</p>
												<p className="font-medium text-foreground">
													{proposal.extracted_data[0].warranty
														? `${proposal.extracted_data[0].warranty} months`
														: "-"}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-xs text-muted-foreground">
													Compliance
												</p>
												<p className="font-medium text-foreground">
													{proposal.compliance !== undefined
														? `${proposal.compliance}%`
														: "-"}
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</Link>
					);
				})}
			</div>

			{proposals.length === 0 && (
				<div className="card-elevated py-12 text-center">
					<FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-foreground mb-2">
						No proposals yet
					</h3>
					<p className="text-muted-foreground">
						Vendor responses will appear here once submitted
					</p>
				</div>
			)}
		</div>
	);
};

export default Proposals;
