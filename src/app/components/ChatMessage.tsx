"use client";

interface ChatMessageProps {
	author: string;
	text: string;
	isCurrentUser: boolean;
}

export function ChatMessage({ author, text, isCurrentUser }: ChatMessageProps) {
	return (
		<div
			className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
		>
			<div
				className={`max-w-[70%] break-words rounded-lg px-4 py-2 ${
					isCurrentUser
						? "self-end bg-blue-500 text-white"
						: "self-start bg-gray-200 text-gray-800"
				}`}
			>
				<div className="font-bold text-sm">{author}</div>
				<div>{text}</div>
			</div>
		</div>
	);
}
