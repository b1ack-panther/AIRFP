import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Building2,
	Mail,
	Phone,
	DollarSign,
	Truck,
	Shield,
	AlertTriangle,
	ChevronDown,
	ChevronUp,
	CheckCircle,
} from "lucide-react";
import { api, Proposal } from "@/services/api";
import StatusBadge from "@/components/ui/StatusBadge";

const ProposalDetail = () => {
	const { id: rfpId, proposalId } = useParams<{
		id: string;
		proposalId: string;
	}>();
	const navigate = useNavigate();
	const [proposal, setProposal] = useState<Proposal | null>(null);
	const [loading, setLoading] = useState(true);
	const [showRawContent, setShowRawContent] = useState(false);

	useEffect(() => {
		const loadProposal = async () => {
			if (!proposalId) return;
			try {
				const data = await api.getProposal(proposalId);
				setProposal(data);
			} catch (error) {
				console.error("Failed to load proposal", error);
			} finally {
				setLoading(false);
			}
		};
		loadProposal();
	}, [proposalId]);

	const confidenceColor = (score?: number) => {
		if (!score) return "text-muted-foreground";
		if (score >= 90) return "text-status-awarded";
		if (score >= 70) return "text-status-draft-foreground";
		return "text-status-responses";
	};

	if (loading) {
		return (
			<div className="page-container animate-fade-in flex items-center justify-center p-12">
				<div className="text-muted-foreground">Loading proposal details...</div>
			</div>
		);
	}

	if (!proposal) {
		return (
			<div className="page-container animate-fade-in p-12 text-center">
				<h2 className="text-xl font-semibold">Proposal Not Found</h2>
				<Link
					to={`/rfp/${rfpId}`}
					className="text-primary hover:underline mt-4 inline-block"
				>
					Return to RFP
				</Link>
			</div>
		);
	}

	// Derive status if missing
	const status = "parsed";

	const totalCost = proposal.extracted_data.reduce(
		(sum, item) => sum + item.price,
		0
	);

	return (
		<div className="page-container animate-fade-in">
			{/* Back button and header */}
			<div className="mb-6">
				<Link
					to={`/rfp/${rfpId}/proposals`}
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Proposals
				</Link>

				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex flex-row items-center gap-4">
						<div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
							<Building2 className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold text-foreground">
								{proposal.vendor?.name || "Unknown Vendor"}
							</h1>
							<div className="flex items-center gap-3 mt-1">
								<StatusBadge status={status as any} />
								<span className="text-sm text-muted-foreground">
									Submitted{" "}
									{new Date(proposal.received_at).toLocaleDateString()}
								</span>
							</div>
						</div>
					</div>

					<Link
						to={`/rfp/${rfpId}/compare`}
						className="min-w-max flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
					>
						Compare Proposal
					</Link>
				</div>
			</div>

			<div className="grid lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Extracted Data */}
					<div className="card-elevated p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="font-semibold text-foreground">
								AI-Extracted Proposal Data
							</h2>
						</div>

						{/* Key Metrics */}
						<div className="grid sm:grid-cols-3 gap-4 mb-6">
							<div className="p-4 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2 mb-2">
									<DollarSign className="h-4 w-4 text-primary" />
									<span className="text-sm text-muted-foreground">
										Total Cost
									</span>
								</div>
								<p className="text-2xl font-bold text-foreground">
									${totalCost.toLocaleString()}
								</p>
							</div>

							<div className="p-4 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2 mb-2">
									<Truck className="h-4 w-4 text-primary" />
									<span className="text-sm text-muted-foreground">
										Delivery
									</span>
								</div>
								<p className="text-2xl font-bold text-foreground">
									{proposal.timeline || "-"}
								</p>
							</div>

							<div className="p-4 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2 mb-2">
									<CheckCircle className="h-4 w-4 text-primary" />
									<span className="text-sm text-muted-foreground">
										Compliance
									</span>
								</div>
								<p className="text-2xl font-bold text-foreground">
									{proposal.compliance || "-"}%
								</p>
							</div>
						</div>

						{/* Line Items */}
						{proposal.extracted_data && proposal.extracted_data.length > 0 && (
							<div>
								<h3 className="font-medium text-foreground mb-3">Line Items</h3>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b border-border">
												<th className="table-header pb-3 text-left">Item</th>
												<th className="table-header pb-3 text-left">
													Specifications
												</th>
												<th className="table-header pb-3 text-right">Qty</th>
												<th className="table-header pb-3 text-left pl-4">
													Warranty
												</th>
												<th className="table-header pb-3 text-right">Total</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border">
											{proposal.extracted_data.map((item, i) => (
												<tr key={item._id || i}>
													<td className="py-3 text-sm font-medium text-foreground">
														{item.item}
													</td>
													<td className="py-3 text-sm text-muted-foreground">
														{item.specifications || "-"}
													</td>
													<td className="py-3 text-sm text-muted-foreground text-right">
														{item.quantity}
													</td>
													<td className="py-3 text-sm text-muted-foreground pl-4">
														{item.warranty || "-"}
													</td>
													<td className="py-3 text-sm font-medium text-foreground text-right">
														${item.price.toLocaleString()}
													</td>
												</tr>
											))}
										</tbody>
										<tfoot>
											<tr className="border-t-2 border-border">
												<td
													colSpan={4}
													className="py-3 text-sm font-semibold text-foreground text-right pr-4"
												>
													Total:
												</td>
												<td className="py-3 text-lg font-bold text-accent text-right">
													${totalCost.toLocaleString()}
												</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Sidebar - Vendor Info */}
				<div className="space-y-6">
					<div className="card-elevated p-6">
						<h2 className="font-semibold text-foreground mb-4">
							Vendor Information
						</h2>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
									<span className="text-sm font-medium text-primary">
										{proposal.vendor?.name?.charAt(0) || "U"}
									</span>
								</div>
								<div>
									<p className="font-medium text-foreground">
										{proposal.vendor?.name || "Unknown"}
									</p>
									<p className="text-sm text-muted-foreground">
										{proposal.vendor?.category || "-"}
									</p>
								</div>
							</div>

							<div className="pt-4 border-t border-border space-y-3">
								<div className="flex items-center gap-3 text-sm">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span className="text-foreground">
										{proposal.vendor?.email || "-"}
									</span>
								</div>
								{proposal.vendor?.phone && (
									<div className="flex items-center gap-3 text-sm">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="text-foreground">
											{proposal.vendor.phone}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProposalDetail;
