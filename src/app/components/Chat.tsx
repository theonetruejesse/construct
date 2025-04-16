"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../../../convex/_generated/api";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

interface Message {
	_id: string;
	text: string;
	author: string;
	createdAt: number;
}

export function Chat() {
	const [username, setUsername] = useState("");
	const [isUsernameSet, setIsUsernameSet] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messages = useQuery(api.messages.list) as Message[] | undefined;

	useEffect(() => {
		// Scroll to bottom when new messages arrive
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (username.trim()) {
			setIsUsernameSet(true);
		}
	};

	if (!isUsernameSet) {
		return (
			<div className="flex h-screen flex-col items-center justify-center p-4">
				<div className="w-full max-w-md rounded-lg border p-8 shadow-md">
					<h1 className="mb-6 text-center font-bold text-2xl">
						Welcome to Chat
					</h1>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter your username"
							className="rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
						/>
						<button
							type="submit"
							className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
						>
							Start Chatting
						</button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col">
			<div className="flex items-center justify-between bg-blue-500 p-4 text-white">
				<h1 className="font-bold text-xl">Chat App</h1>
				<div>Logged in as: {username}</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				{messages ? (
					messages.map((message: Message) => (
						<ChatMessage
							key={message._id}
							author={message.author}
							text={message.text}
							isCurrentUser={message.author === username}
						/>
					))
				) : (
					<div className="flex h-full items-center justify-center">
						<p>Loading messages...</p>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<ChatInput username={username} />
		</div>
	);
}
