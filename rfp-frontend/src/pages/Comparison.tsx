import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
	ArrowLeft,
	Trophy,
	TrendingDown,
	Clock,
	CheckCircle,
	ArrowRight,
	Shield,
	Truck,
	DollarSign,
	Building2,
	Sparkles,
} from "lucide-react";
import { api, RFP, Proposal } from "@/services/api";

const Comparison = () => {
	const { id } = useParams<{ id: string }>();
	const [rfp, setRfp] = useState<RFP | null>(null);
	const [proposals, setProposals] = useState<Proposal[]>([]);
	const [loading, setLoading] = useState(true);

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
				console.error("Failed to load comparison data", error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [id]);

	// Filter only parsed proposals with data

	// Helper to get total cost if not directly on object
	const getProposalCost = (p: Proposal) =>
		p.extracted_data.reduce((sum, item) => sum + item.price, 0);

	// Recommendation logic: Lowest Cost with acceptable compliance (>70%)
	// If no compliances available, just cost.
	const sortedByValue = [...proposals].sort((a, b) => {
		const costA = getProposalCost(a);
		const costB = getProposalCost(b);

		// If cost is significantly different (>10%), prioritize cost
		const costDiff = (costA - costB) / Math.min(costA, costB);
		if (Math.abs(costDiff) > 0.1) return costA - costB;

		// Otherwise prioritize compliance
		return (b.compliance || 0) - (a.compliance || 0);
	});

	const recommendedVendor = sortedByValue[0];

	const getScoreColor = (score: number | undefined) => {
		if (!score) return "text-muted-foreground";
		if (score >= 90) return "text-status-awarded";
		if (score >= 80) return "text-accent";
		if (score >= 70) return "text-status-draft-foreground";
		return "text-status-responses";
	};

	const isLowestCost = (value: number) => {
		if (!value || proposals.length < 2) return false;
		const costs = proposals.map(getProposalCost);
		return value === Math.min(...costs) && Math.min(...costs) > 0;
	};

	const isHighestCompliance = (value: number | undefined) => {
		if (value === undefined || proposals.length < 2) return false;
		const scores = proposals.map((p) => p.compliance || 0);
		return value === Math.max(...scores) && Math.max(...scores) > 0;
	};

	if (loading) {
		return (
			<div className="page-container animate-fade-in flex items-center justify-center p-12">
				<div className="text-muted-foreground">Loading comparison...</div>
			</div>
		);
	}

	if (!rfp) {
		return (
			<div className="page-container animate-fade-in p-12 text-center">
				<h2 className="text-xl font-semibold">RFP Not Found</h2>
			</div>
		);
	}

	const selectedProposal = rfp?.best_vendor_id
		? proposals.find((p) => p.vendor?._id === rfp.best_vendor_id)
		: sortedByValue[0];

	return (
		<div className="page-container animate-fade-in">
			{/* Back button and header */}
			<div className="mb-6">
				<Link
					to={`/rfp/${id}/proposals`}
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Proposals
				</Link>

				<div className="flex items-center gap-4">
					<div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
						<Trophy className="h-6 w-6 text-accent" />
					</div>
					<div>
						<h1 className="text-xl font-semibold text-foreground">
							Proposal Comparison
						</h1>
						<p className="text-muted-foreground">{rfp.title}</p>
					</div>
				</div>
			</div>

			<div>
				{/* Main Content - Comparison Table */}
				{proposals.length === 0 ? (
					<div className="card-elevated p-8 text-center text-muted-foreground">
						Not enough data to compare. Wait for more proposals to be parsed.
					</div>
				) : (
					<div className="card-elevated overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-muted/50 border-b border-border">
										<th className="table-header px-6 py-4 text-left">Vendor</th>
										<th className="table-header px-6 py-4 text-right">
											Total Cost
										</th>
										<th className="table-header px-6 py-4 text-right">
											Delivery
										</th>
										<th className="table-header px-6 py-4 text-right">
											Warranty
										</th>
										<th className="table-header px-6 py-4 text-right">
											Compliance
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{proposals.map((proposal) => {
										const isRecommended =
											proposal._id === recommendedVendor?._id ||
											proposal._id === recommendedVendor?._id;
										// _id check
										const cost = getProposalCost(proposal);

										return (
											<tr
												key={proposal._id}
												className={`hover:bg-muted/30 transition-colors ${
													isRecommended ? "bg-accent/15" : ""
												}`}
											>
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														{isRecommended && (
															<div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
																<Trophy className="h-3.5 w-3.5 text-accent-foreground" />
															</div>
														)}
														<div>
															<p className="font-medium text-foreground">
																{proposal.vendor?.name || "Unknown"}
															</p>
															<p className="text-xs">{proposal.vendor.email}</p>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 text-right">
													<div className="flex items-center justify-end gap-2">
														{isLowestCost(cost) && (
															<TrendingDown className="h-4 w-4 text-status-awarded" />
														)}
														<span
															className={`font-semibold ${
																isLowestCost(cost)
																	? "text-status-awarded"
																	: "text-foreground"
															}`}
														>
															${cost.toLocaleString()}
														</span>
													</div>
												</td>
												<td className="px-6 py-4 text-right">
													<div className="flex items-center justify-end gap-2">
														{/* Disabled numeric check for timeline string */}
														<Clock className="h-4 w-4 text-muted-foreground/50" />
														<span className="font-medium text-foreground">
															{proposal.timeline || "-"}
														</span>
													</div>
												</td>
												<td className="px-6 py-4 text-right">
													<span className="font-medium text-foreground">
														{proposal.extracted_data?.[0]?.warranty || "-"}
													</span>
												</td>
												<td className="px-6 py-4 text-right">
													<div className="flex items-center justify-end gap-2">
														{isHighestCompliance(proposal.compliance) && (
															<CheckCircle className="h-4 w-4 text-status-awarded" />
														)}
														<span
															className={`font-semibold ${getScoreColor(
																proposal.compliance
															)}`}
														>
															{proposal.compliance !== undefined
																? `${proposal.compliance}%`
																: "-"}
														</span>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
			{selectedProposal && (
				<>
					{/* Selected Vendor Card */}
					<div className="card-elevated p-4 mt-6 border-2 border-status-awarded/30">
						<div className="flex items-center gap-2 text-status-awarded mb-4">
							<Trophy className="h-5 w-5" />
							<span className="text-sm font-medium">Selected Vendor</span>
						</div>

						<div className="flex items-center gap-4 mb-3">
							<div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
								<Building2 className="h-7 w-7 text-primary" />
							</div>
							<div>
								<h2 className="text-xl font-semibold text-foreground">
									{selectedProposal.vendor?.name}
								</h2>
								<p className="text-muted-foreground">
									{selectedProposal.vendor?.category}
								</p>
							</div>
						</div>

						<div className="p-3 mb-6">
							<div className="flex items-center gap-2 mb-6">
								<Sparkles className="h-5 w-5 text-accent" />
								<h3 className="font-semibold text-foreground">
									AI Justification
								</h3>
							</div>

							<div className="prose prose-sm max-w-none">
								<ul className="space-y-2">
									{rfp.justification && rfp.justification.length > 0 ? (
										rfp.justification.map((point, index) => (
											<li key={index} className="flex items-start gap-2">
												<CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-1" />
												<span className="text-muted-foreground">{point}</span>
											</li>
										))
									) : (
										<li className="flex items-start gap-2">
											<span className="text-muted-foreground">
												AI analysis is pending more proposals or requires
												processing. The recommendation above is a preliminary
												estimate based on cost and value.
											</span>
										</li>
									)}
								</ul>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default Comparison;
