import { useState, useEffect } from "react";
import {
	Plus,
	Pencil,
	Trash2,
	X,
	Mail,
	Phone,
	MapPin,
	Building2,
} from "lucide-react";
import { api, Vendor } from "@/services/api";

const Vendors = () => {
	const [vendors, setVendors] = useState<Vendor[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		category: "",
		phone: "",
		address: "",
	});

	const fetchVendors = async (searchQuery?: string) => {
		try {
			const data = await api.getAllVendors(searchQuery);
			setVendors(data);
		} catch (error) {
			console.error("Failed to fetch vendors", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchVendors();
	}, []);

	const handleOpenModal = (vendor?: Vendor) => {
		if (vendor) {
			setEditingVendor(vendor);
			setFormData({
				name: vendor.name,
				email: vendor.email,
				category: vendor.category,
				phone: vendor.phone || "",
				address: vendor.address || "",
			});
		} else {
			setEditingVendor(null);
			setFormData({
				name: "",
				email: "",
				category: "",
				phone: "",
				address: "",
			});
		}
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingVendor(null);
		setFormData({ name: "", email: "", category: "", phone: "", address: "" });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (editingVendor && editingVendor.id) {
				await api.updateVendor(editingVendor.id, formData);
			} else {
				await api.createVendor(formData);
			}
			await fetchVendors();
			handleCloseModal();
		} catch (error) {
			console.error("Failed to save vendor", error);
			alert("Failed to save vendor");
		}
	};

	const handleDelete = async (vendorId: string) => {
		try {
			await api.deleteVendor(vendorId);
			await fetchVendors();
		} catch (error) {
			console.error("Failed to delete vendor", error);
			alert("Failed to delete vendor");
		}
	};

	const categories = [...new Set(vendors.map((v) => v.category))];

	if (loading)
		return (
			<div className="page-container flex justify-center p-12">Loading...</div>
		);

	return (
		<div className="page-container animate-fade-in">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="page-title mb-1">Vendors</h1>
					<p className="text-muted-foreground">Manage your vendor database</p>
				</div>
				<button
					onClick={() => handleOpenModal()}
					className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all hover:shadow-lg"
				>
					<Plus className="h-4 w-4" />
					Add Vendor
				</button>
			</div>

			<div className="card-elevated overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="bg-muted/50 border-b border-border">
								<th className="table-header px-6 py-4 text-left">Vendor</th>
								<th className="table-header px-6 py-4 text-left">Contact</th>
								<th className="table-header px-6 py-4 text-left">Category</th>
								<th className="table-header px-6 py-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{vendors.map((vendor) => (
								<tr
									key={vendor.id}
									className="hover:bg-muted/30 transition-colors"
								>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
												<Building2 className="h-5 w-5 text-primary" />
											</div>
											<div>
												<p className="font-medium text-foreground">
													{vendor.name}
												</p>
												{vendor.address && (
													<p className="text-sm text-muted-foreground flex items-center gap-1">
														<MapPin className="h-3 w-3" />
														{vendor.address}
													</p>
												)}
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="space-y-1">
											<p className="text-sm text-foreground flex items-center gap-2">
												<Mail className="h-4 w-4 text-muted-foreground" />
												{vendor.email}
											</p>
											{vendor.phone && (
												<p className="text-sm text-muted-foreground flex items-center gap-2">
													<Phone className="h-4 w-4" />
													{vendor.phone}
												</p>
											)}
										</div>
									</td>
									<td className="px-6 py-4">
										<span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
											{vendor.category}
										</span>
									</td>
									<td className="px-6 py-4 text-right">
										<div className="flex items-center justify-end gap-2">
											<button
												onClick={() => handleOpenModal(vendor)}
												className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
											>
												<Pencil className="h-4 w-4" />
											</button>
											<button
												onClick={() => handleDelete(vendor.id)}
												className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
						onClick={handleCloseModal}
					/>
					<div className="relative w-full max-w-md bg-card rounded-xl border border-border shadow-lg animate-fade-in">
						<div className="flex items-center justify-between p-6 border-b border-border">
							<h2 className="text-lg font-semibold text-foreground">
								{editingVendor ? "Edit Vendor" : "Add New Vendor"}
							</h2>
							<button
								onClick={handleCloseModal}
								className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-foreground mb-1.5">
									Company Name *
								</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full px-4 py-2.5 bg-secondary border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
									placeholder="Acme Corp"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-foreground mb-1.5">
									Email *
								</label>
								<input
									type="email"
									required
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									className="w-full px-4 py-2.5 bg-secondary border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
									placeholder="sales@acme.com"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-foreground mb-1.5">
									Category *
								</label>
								<input
									type="text"
									required
									value={formData.category}
									onChange={(e) =>
										setFormData({ ...formData, category: e.target.value })
									}
									className="w-full px-4 py-2.5 bg-secondary border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
									placeholder="IT Equipment"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-foreground mb-1.5">
									Phone
								</label>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									className="w-full px-4 py-2.5 bg-secondary border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
									placeholder="+1 (555) 123-4567"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-foreground mb-1.5">
									Address
								</label>
								<input
									type="text"
									value={formData.address}
									onChange={(e) =>
										setFormData({ ...formData, address: e.target.value })
									}
									className="w-full px-4 py-2.5 bg-secondary border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
									placeholder="123 Business Ave, City, State"
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={handleCloseModal}
									className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
								>
									{editingVendor ? "Save Changes" : "Add Vendor"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Vendors;
