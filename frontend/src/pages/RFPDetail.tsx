import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Package,
	DollarSign,
	Truck,
	Shield,
	FileText,
	Send,
	Eye,
	X,
	Search,
	Check,
	Mail,
} from "lucide-react";
import { api, Vendor } from "@/services/api";
import StatusBadge from "@/components/ui/StatusBadge";

const RFPDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [rfp, setRfp] = useState<any>(null);
	const [vendors, setVendors] = useState<Vendor[]>([]);
	const [loading, setLoading] = useState(true);

	const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
	const [vendorSearch, setVendorSearch] = useState("");
	const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
	const [sending, setSending] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;
			try {
				const [rfpData, vendorsData] = await Promise.all([
					api.getRFP(id),
					api.getAllVendors(),
				]);

				setRfp({
					...rfpData,
					name: rfpData.title,
					description: rfpData.original_prompt,
					items: rfpData.requirements.map((req: any) => ({
						name: req.item,
						quantity: req.quantity,
						specifications: req.specifications || "",
						budget: req.budget,
						warranty: req.warranty,
					})),
					deliveryTimeline: rfpData.timeline,
					warranty: rfpData.requirements.find((r: any) => r.warranty)?.warranty,
					vendorCount: rfpData.vendors?.length || 0,
					vendors: rfpData.vendors || [],
				});
				setVendors(vendorsData);

				if (rfpData.vendors) {
					setSelectedVendorIds(rfpData.vendors);
				}
			} catch (error) {
				console.error("Failed to fetch data", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [id]);

	if (loading)
		return (
			<div className="page-container flex justify-center p-12">Loading...</div>
		);
	if (!rfp)
		return (
			<div className="page-container flex justify-center p-12">
				RFP not found
			</div>
		);

	const handleSendRFP = async () => {
		setSending(true);
		try {
			const initialVendorIds = rfp.vendors || [];
			const newVendorIds = selectedVendorIds.filter(
				(id) => !initialVendorIds.includes(id)
			);

			if (newVendorIds.length > 0) {
				await api.sendRFP(id!, newVendorIds);

				const updatedRfp = await api.getRFP(id!);
				setRfp((prev) => ({
					...prev,
					vendors: updatedRfp.vendors,
					status: "sent",
				}));
			}
			setIsVendorModalOpen(false);
		} catch (error) {
			console.error(error);
			alert("Failed to send RFP");
		} finally {
			setSending(false);
		}
	};

	const toggleVendor = (vendorId: string) => {
		const isAlreadySent = rfp.vendors?.includes(vendorId);
		if (isAlreadySent) return;

		if (selectedVendorIds.includes(vendorId)) {
			setSelectedVendorIds(selectedVendorIds.filter((id) => id !== vendorId));
		} else {
			setSelectedVendorIds([...selectedVendorIds, vendorId]);
		}
	};

	const filteredVendors = vendors.filter(
		(v) =>
			v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
			v.email.toLowerCase().includes(vendorSearch.toLowerCase())
	);

	return (
		<div className="page-container animate-fade-in relative">
			<div className="mb-6">
				<Link
					to="/"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Dashboard
				</Link>

				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
							<FileText className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h1 className="text-xl font-semibold text-foreground">
								{rfp.name}
							</h1>
							<div className="flex items-center gap-3 mt-1">
								<StatusBadge status={rfp.status} />
							</div>
						</div>
					</div>

					<div className="flex flex-wrap gap-3">
						<button
							onClick={() => setIsVendorModalOpen(true)}
							className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
						>
							<Send className="h-4 w-4" />
							Send RFP
						</button>

						<Link
							to={`/rfp/${id}/proposals`}
							className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-accent text-accent-foreground hover:bg-accent/90`}
						>
							<Eye className="h-4 w-4" />
							View Responses
						</Link>
						<Link
							to={`/rfp/${id}/compare`}
							className="min-w-max flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
						>
							Compare Responses
						</Link>
					</div>
				</div>
			</div>

			<div className="lg:col-span-2 space-y-6">
				{rfp.description && (
					<div className="card-elevated p-6">
						<h2 className="font-semibold text-foreground mb-3">Description</h2>
						<p className="text-muted-foreground">{rfp.description}</p>
					</div>
				)}

				{rfp.items && rfp.items.length > 0 && (
					<div className="card-elevated p-6">
						<div className="flex items-center gap-2 mb-4">
							<Package className="h-5 w-5 text-primary" />
							<h2 className="font-semibold text-foreground">Items Required</h2>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border">
										<th className="table-header pb-3 text-left">Item</th>
										<th className="table-header pb-3 text-left">Quantity</th>
										<th className="table-header pb-3 text-left">
											Specifications
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{rfp.items.map((item, i) => (
										<tr key={i}>
											<td className="py-3 text-sm font-medium text-foreground">
												{item.name}
											</td>
											<td className="py-3 text-sm text-muted-foreground">
												{item.quantity}
											</td>
											<td className="py-3 text-sm text-muted-foreground">
												{item.specifications}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				<div className="grid sm:grid-cols-2 gap-4">
					{rfp.budget && (
						<div className="card-elevated p-4">
							<div className="flex items-center gap-2 mb-2">
								<DollarSign className="h-4 w-4 text-primary" />
								<span className="text-sm text-muted-foreground">Budget</span>
							</div>
							<p className="text-lg font-semibold text-foreground">
								{rfp.budget}
							</p>
						</div>
					)}

					{rfp.deliveryTimeline && (
						<div className="card-elevated p-4">
							<div className="flex items-center gap-2 mb-2">
								<Truck className="h-4 w-4 text-primary" />
								<span className="text-sm text-muted-foreground">
									Delivery Timeline
								</span>
							</div>
							<p className="text-lg font-semibold text-foreground">
								{rfp.deliveryTimeline}
							</p>
						</div>
					)}

					{rfp.total_budget && (
						<div className="card-elevated p-4">
							<div className="flex items-center gap-2 mb-2">
								<DollarSign className="h-4 w-4 text-primary" />
								<span className="text-sm text-muted-foreground">
									Total Budget
								</span>
							</div>
							<p className="text-lg font-semibold text-foreground">
								${rfp.total_budget ?? "-"}
							</p>
						</div>
					)}

					{rfp.warranty && (
						<div className="card-elevated p-4">
							<div className="flex items-center gap-2 mb-2">
								<Shield className="h-4 w-4 text-primary" />
								<span className="text-sm text-muted-foreground">Warranty</span>
							</div>
							<p className="text-lg font-semibold text-foreground">
								{rfp.warranty}
							</p>
						</div>
					)}
				</div>
			</div>

			{isVendorModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
						onClick={() => setIsVendorModalOpen(false)}
					/>
					<div className="relative w-full max-w-2xl bg-card rounded-xl border border-border shadow-lg animate-fade-in flex flex-col max-h-[85vh]">
						<div className="flex items-center justify-between p-6 border-b border-border">
							<div>
								<h2 className="text-lg font-semibold text-foreground">
									Select Vendors
								</h2>
								<p className="text-sm text-muted-foreground">
									Choose vendors to receive this RFP
								</p>
							</div>
							<button
								onClick={() => setIsVendorModalOpen(false)}
								className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="p-4 border-b border-border bg-muted/30">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<input
									type="text"
									placeholder="Search vendors by name or email..."
									value={vendorSearch}
									onChange={(e) => setVendorSearch(e.target.value)}
									className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
								/>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto p-2">
							{filteredVendors.map((vendor) => {
								const isSelected = selectedVendorIds.includes(vendor.id);
								const isLocked = rfp.vendors?.includes(vendor.id);

								return (
									<div
										key={vendor.id}
										aria-disabled={isLocked}
										onClick={() => !isLocked && toggleVendor(vendor.id)}
										className={`flex items-center gap-4 p-3 rounded-lg border mb-2 cursor-pointer transition-all ${
											isSelected
												? "bg-primary/5 border-primary/30"
												: "bg-card border-border hover:border-primary/30"
										} ${
											isLocked
												? "opacity-60 cursor-not-allowed bg-muted/80 border-transparent"
												: ""
										}`}
									>
										<div
											className={`
                                            h-5 w-5 rounded-md border flex items-center justify-center transition-colors
                                            ${
																							isSelected
																								? "bg-primary border-primary text-primary-foreground"
																								: "border-muted-foreground/30"
																						}
                                        `}
										>
											{isSelected && <Check className="h-3 w-3" />}
										</div>

										<div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
											<span className="text-sm font-medium text-primary">
												{vendor.name.charAt(0)}
											</span>
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<h3 className="font-medium text-foreground truncate">
													{vendor.name}
												</h3>
												{isLocked && (
													<span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
														Sent
													</span>
												)}
											</div>
											<div className="flex items-center gap-3 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<Mail className="h-3 w-3" />
													{vendor.email}
												</span>
												<span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-secondary text-xs">
													{vendor.category}
												</span>
											</div>
										</div>
									</div>
								);
							})}

							{filteredVendors.length === 0 && (
								<div className="text-center py-8 text-muted-foreground">
									No vendors found.
								</div>
							)}
						</div>

						<div className="p-4 border-t border-border bg-muted/30 flex justify-between items-center">
							<span className="text-sm text-muted-foreground">
								{
									selectedVendorIds.filter((id) => !rfp.vendors?.includes(id))
										.length
								}{" "}
								vendor(s) selected
							</span>
							<div className="flex gap-3">
								<button
									onClick={() => setIsVendorModalOpen(false)}
									className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleSendRFP}
									disabled={
										sending ||
										selectedVendorIds.filter((id) => !rfp.vendors?.includes(id))
											.length === 0
									}
									className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
								>
									{sending ? (
										<>
											<span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
											Sending...
										</>
									) : (
										<>
											<Send className="h-4 w-4" />
											Send RFP
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RFPDetail;
