import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Send,
	Sparkles,
	Package,
	DollarSign,
	Truck,
	Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { toast } from "sonner";

interface Message {
	id: string;
	role: "user" | "ai";
	content: string;
}

const CreateRFP = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			role: "ai",
			content:
				"Hello! I'm your AI procurement assistant. Describe what you need to procure, and I'll help you create a structured RFP.\n\nFor example: \"I need 50 laptops for our engineering team with 16GB RAM and 512GB SSD, delivery within 30 days, budget around $100,000\"",
		},
	]);
	const [structuredRFP, setStructuredRFP] = useState<any>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	useEffect(() => {
		const fetchRFP = async () => {
			if (id) {
				try {
					const data = await api.getRFP(id);
					updateRfpState(data);
				} catch (error) {
					console.error("Failed to load RFP", error);
					toast.error("Failed to load RFP details");
				}
			}
		};
		fetchRFP();
	}, [id]);

	const updateRfpState = (data: any) => {
		setStructuredRFP({
			items: data.requirements.map((r: any) => ({
				name: r.item,
				quantity: r.quantity,
				specifications: r.specifications,
			})),
			budget: data.total_budget
				? `$${data.total_budget.toLocaleString()}`
				: "Not specified",
			deliveryTimeline: data.timeline || "Not specified",
			paymentTerms: "Standard",
			warranty:
				data.requirements.find((r: any) => r.warranty)?.warranty ||
				"Standard warranty",
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isGenerating) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input,
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsGenerating(true);

		try {
			let updatedRfp;
			let aiMessageContent = "";

			const payload = id
				? { prompt: userMessage.content, rfpId: id }
				: { prompt: userMessage.content };

			updatedRfp = await api.createRFP(payload);

			if (!id && updatedRfp._id) {
				navigate(`/create-rfp/${updatedRfp._id}`, { replace: true });
			}

			if (id) {
				aiMessageContent =
					"I've updated the RFP with your changes. Please review the structured data.";
			} else {
				aiMessageContent =
					"I've created a new RFP draft based on your requirements. You can see the details on the right. You can ask for further changes here to refine it.";
			}

			if (updatedRfp.mail_body) {
				aiMessageContent += `\n${updatedRfp.mail_body}`;
			}

			if (id) {
				toast.success("RFP updated successfully");
			}

			updateRfpState(updatedRfp);

			const aiResponse: Message = {
				id: (Date.now() + 1).toString(),
				role: "ai",
				content: aiMessageContent,
			};
			setMessages((prev) => [...prev, aiResponse]);
		} catch (error) {
			console.error("Error generating RFP", error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "ai",
				content:
					"Sorry, I encountered an error processing your request. Please try again.",
			};
			setMessages((prev) => [...prev, errorMessage]);
			toast.error("Failed to generate RFP");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleConfirmRFP = () => {
		if (id) {
			navigate(`/rfp/${id}`);
		}
	};

	return (
		<div className="h-[calc(100vh-4rem)] flex animate-fade-in">
			<div className="flex-1 flex flex-col border-r border-border">
				<div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Sparkles className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h2 className="font-semibold text-foreground">AI RFP Assistant</h2>
						<p className="text-sm text-muted-foreground">
							Describe your procurement needs
						</p>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-6 space-y-4">
					{messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								"flex",
								message.role === "user" ? "justify-end" : "justify-start"
							)}
						>
							<div
								className={cn(
									"max-w-[80%] rounded-2xl px-4 py-3 text-sm",
									message.role === "user"
										? "bg-chat-user text-chat-user-foreground rounded-br-md"
										: "bg-chat-ai text-chat-ai-foreground rounded-bl-md"
								)}
							>
								<p className="whitespace-pre-wrap">{message.content}</p>
							</div>
						</div>
					))}

					{isGenerating && (
						<div className="flex justify-start">
							<div className="bg-chat-ai text-chat-ai-foreground rounded-2xl rounded-bl-md px-4 py-3">
								<div className="flex items-center gap-2">
									<div className="flex gap-1">
										<span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
										<span
											className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"
											style={{ animationDelay: "0.2s" }}
										/>
										<span
											className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"
											style={{ animationDelay: "0.4s" }}
										/>
									</div>
									<span className="text-sm text-muted-foreground">
										Generating RFP...
									</span>
								</div>
							</div>
						</div>
					)}
				</div>

				<form
					onSubmit={handleSubmit}
					className="p-4 border-t border-border bg-card"
				>
					<div className="flex gap-3">
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit(e);
								}
							}}
							placeholder="Describe what you need to procure..."
							className="flex-1 min-h-[60px] max-h-[120px] px-4 py-3 bg-secondary border-0 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
							rows={2}
						/>
						<button
							type="submit"
							disabled={!input.trim() || isGenerating}
							className="self-end h-[60px] px-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Send className="h-5 w-5" />
						</button>
					</div>
				</form>
			</div>

			<div className="hidden lg:flex lg:w-[480px] flex-col bg-muted/30">
				<div className="px-6 py-4 border-b border-border bg-card">
					<h2 className="font-semibold text-foreground">
						Structured RFP Preview
					</h2>
					<p className="text-sm text-muted-foreground">
						AI-extracted requirements
					</p>
				</div>

				<div className="flex-1 overflow-y-auto p-6">
					{structuredRFP ? (
						<div className="space-y-6 animate-fade-in">
							<div className="card-elevated p-4">
								<div className="flex items-center gap-2 mb-3">
									<Package className="h-4 w-4 text-primary" />
									<h3 className="font-medium text-foreground">Items</h3>
								</div>
								<div className="space-y-3">
									{structuredRFP.items.map((item, i) => (
										<div key={i} className="pl-4 border-l-2 border-primary/30">
											<p className="font-medium text-sm">{item.name}</p>
											<p className="text-xs text-muted-foreground">
												Qty: {item.quantity} • {item.specifications}
											</p>
										</div>
									))}
								</div>
							</div>

							<div className="card-elevated p-4">
								<div className="flex items-center gap-2 mb-2">
									<DollarSign className="h-4 w-4 text-primary" />
									<h3 className="font-medium text-foreground">Budget</h3>
								</div>
								<p className="text-lg font-semibold text-accent">
									{structuredRFP.budget}
								</p>
							</div>

							<div className="card-elevated p-4">
								<div className="flex items-center gap-2 mb-2">
									<Truck className="h-4 w-4 text-primary" />
									<h3 className="font-medium text-foreground">
										Delivery Timeline
									</h3>
								</div>
								<p className="text-sm text-foreground">
									{structuredRFP.deliveryTimeline}
								</p>
							</div>
						</div>
					) : (
						<div className="h-full flex flex-col items-center justify-center text-center">
							<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
								<Sparkles className="h-8 w-8 text-muted-foreground/50" />
							</div>
							<h3 className="font-medium text-foreground mb-2">
								No RFP generated yet
							</h3>
							<p className="text-sm text-muted-foreground max-w-[280px]">
								Describe your procurement requirements in the chat, and the AI
								will generate a structured RFP
							</p>
						</div>
					)}
				</div>

				{structuredRFP && (
					<div className="p-4 border-t border-border bg-card">
						<button
							onClick={handleConfirmRFP}
							className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
						>
							<Check className="h-5 w-5" />
							Confirm & Save RFP
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default CreateRFP;
