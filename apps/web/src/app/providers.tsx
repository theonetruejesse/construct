"use client";

import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { VTableProvider } from "@construct/vtable";

const convex = new ConvexReactClient(
	process.env.NEXT_PUBLIC_CONVEX_URL as string,
);

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ConvexProvider client={convex}>
			<VTableProvider>
				{children}
			</VTableProvider>
		</ConvexProvider>
	);
}
