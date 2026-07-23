"use client";

import { PreviewCard } from "@base-ui/react/preview-card";

import { cn } from "@/lib/utils";

function HoverCard({ ...props }: PreviewCard.Root.Props) {
	return <PreviewCard.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({ ...props }: PreviewCard.Trigger.Props) {
	return <PreviewCard.Trigger data-slot="hover-card-trigger" {...props} />;
}

function HoverCardContent({
	className,
	side = "bottom",
	sideOffset = 4,
	align = "center",
	alignOffset = 0,
	children,
	...props
}: PreviewCard.Popup.Props &
	Pick<
		PreviewCard.Positioner.Props,
		"align" | "alignOffset" | "side" | "sideOffset"
	>) {
	return (
		<PreviewCard.Portal>
			<PreviewCard.Positioner
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
				className="isolate z-50"
			>
				<PreviewCard.Popup
					data-slot="hover-card-content"
					className={cn(
						"z-50 w-72 origin-(--transform-origin) rounded-xl border bg-card p-4 text-sm text-card-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				>
					{children}
					<PreviewCard.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-card fill-card data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
				</PreviewCard.Popup>
			</PreviewCard.Positioner>
		</PreviewCard.Portal>
	);
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
