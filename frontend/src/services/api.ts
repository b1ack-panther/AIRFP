import axios from "axios";

export interface Vendor {
	_id: string;
	name: string;
	email: string;
	category: string;
	phone?: string;
	address?: string;
}

export interface RFP {
	_id: string;
	title: string;
	original_prompt: string;
	status: string;
	requirements: {
		item: string;
		quantity: string;
		budget?: number;
		specifications: string;
		warranty?: string;
	}[];
	total_budget?: number;
	timeline?: string;
	createdAt: string;
	updatedAt: string;
	vendors?: string[]; // Kept for legacy or if we want to map mapped vendors
	proposals?: Proposal[]; // Now we have full proposals
	best_proposal_id?: string;
	justification?: string[];
	mail_body?: string;
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
	status: "sent" | "parsed";
}

const API_URL = "http://localhost:5000/api";

export const api = {
	getAllRFPs: async (status?: string): Promise<RFP[]> => {
		const response = await axios.get(`${API_URL}/rfps`);
		let data = response.data;
		if (status) {
			const lowerStatus = status.toLowerCase();
			data = data.filter(
				(rfp: any) => (rfp.status || "DRAFT").toLowerCase() === lowerStatus
			);
		}
		return data;
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

	checkEmails: async () => {
		const response = await axios.post(`${API_URL}/rfps/check-emails`);
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
