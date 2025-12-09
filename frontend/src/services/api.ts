import axios from "axios";

export interface Vendor {
	_id: string;
	id?: string;
	name: string;
	email: string;
	category: string;
	phone?: string;
	address?: string;
}

export interface RFP {
	_id: string;
	id?: string;
	title: string;
	name?: string;
	description?: string;
	original_prompt?: string;
	status:
		| "draft"
		| "sent"
		| "responses"
		| "awarded"
		| "processing"
		| "parsed"
		| "needs-review";
	requirements: any[];
	total_budget?: number;
	budget?: string;
	timeline?: string;
	deliveryTimeline?: string;
	warranty?: string;
	createdAt: string;
	updatedAt: string;
	lastUpdated?: string;
	vendors?: string[];
	vendorCount?: number;
	best_vendor_id?: string;
	justification?: string[];
}

export interface Proposal {
	_id: string;
	vendor: {
		name: string;
		email: string;
		category: string;
		_id?: string;
		phone?: string;
	};
	extracted_data: {
		item: string;
		quantity: string;
		price: number;
		warranty?: string;
		specifications?: string;
		_id: string;
	}[];
	compliance: number;
	received_at: string;
	timeline?: string;
}

const API_URL = "http://localhost:5000/api";

export const api = {
	getAllRFPs: async (): Promise<RFP[]> => {
		const response = await axios.get(`${API_URL}/rfps`);

		return response.data.map((rfp: any) => ({
			...rfp,
			id: rfp._id,
			name: rfp.title,
			lastUpdated: new Date(rfp.updatedAt).toLocaleDateString(),
			vendorCount: rfp.vendors?.length || 0,
			status: rfp.status.toLowerCase() as RFP["status"],
			items: rfp.requirements.map((req: any) => ({
				name: req.item,
				quantity: req.quantity,
				specifications: req.specifications || "",
				budget: req.budget,
				totalPrice:
					req.total_price ||
					(req.budget && !isNaN(parseFloat(req.quantity))
						? req.budget * parseFloat(req.quantity)
						: 0),
				warranty: req.warranty || rfp.warranty || "",
			})),
			description: rfp.original_prompt,
			deliveryTimeline: rfp.timeline,
		}));
	},

	getRFP: async (id: string) => {
		const response = await axios.get(`${API_URL}/rfps/${id}`);
		return response.data;
	},

	createRFP: async (rfpData: any) => {
		const response = await axios.post(`${API_URL}/rfps`, rfpData);
		return response.data;
	},

	refineRFP: async (id: string, prompt: string) => {
		const response = await axios.post(`${API_URL}/rfps/${id}/refine`, {
			prompt,
		});
		return response.data;
	},

	sendRFP: async (id: string, vendorIds: string[]) => {
		const response = await axios.post(`${API_URL}/rfps/${id}/send`, {
			vendorIds: vendorIds,
		});
		return response.data;
	},

	// Proposal Methods
	getProposals: async (rfpId: string) => {
		const response = await axios.get(`${API_URL}/proposals/rfp/${rfpId}`);
		return response.data;
	},
	getProposal: async (id: string) => {
		const response = await axios.get(`${API_URL}/proposals/${id}`);
		return response.data;
	},

	// Vendor Methods
	getAllVendors: async (searchQuery?: string) => {
		const response = await axios.get(
			`${API_URL}/vendors?search=${searchQuery ?? ""}`
		);
		return response.data.map((v: any) => ({
			...v,
			id: v._id, // Frontend expects id
		}));
	},

	createVendor: async (vendorData: Partial<Vendor>) => {
		const response = await axios.post(`${API_URL}/vendors`, vendorData);
		return { ...response.data, id: response.data._id };
	},

	updateVendor: async (id: string, vendorData: Partial<Vendor>) => {
		const response = await axios.put(`${API_URL}/vendors/${id}`, vendorData);
		return { ...response.data, id: response.data._id };
	},

	deleteVendor: async (id: string) => {
		const response = await axios.delete(`${API_URL}/vendors/${id}`);
		return response.data;
	},
};
